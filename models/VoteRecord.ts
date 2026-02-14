import mongoose, { Schema, Document } from 'mongoose';

/**
 * VoteRecord Model
 * 
 * This model stores records of votes for anti-abuse purposes.
 * It tracks which IP addresses (hashed for privacy) have voted on which polls.
 * 
 * Anti-Abuse Mechanism 1: IP-based vote restriction
 * - Stores hashed IP address + poll ID combination
 * - Prevents multiple votes from the same IP on the same poll
 * - IP addresses are hashed with a salt for privacy protection
 */

// Interface for VoteRecord document
export interface IVoteRecord extends Document {
  pollId: string;
  hashedIp: string;
  votedAt: Date;
}

// VoteRecord Schema
const VoteRecordSchema = new Schema<IVoteRecord>({
  pollId: {
    type: String,
    required: true,
    index: true,
    ref: 'Poll',
  },
  hashedIp: {
    type: String,
    required: true,
    index: true,
  },
  votedAt: {
    type: Date,
    default: Date.now,
    expires: 86400 * 30, // Auto-delete records after 30 days (TTL index)
  },
}, {
  timestamps: false, // We only need votedAt
  collection: 'vote_records',
});

// Compound index to ensure unique vote per IP per poll
// This prevents duplicate votes at the database level
VoteRecordSchema.index({ pollId: 1, hashedIp: 1 }, { unique: true });

// Index for cleanup queries
VoteRecordSchema.index({ votedAt: 1 }, { expireAfterSeconds: 86400 * 30 });

/**
 * Static method to check if an IP has already voted on a poll
 */
VoteRecordSchema.statics.hasVoted = async function(
  pollId: string, 
  hashedIp: string
): Promise<boolean> {
  const count = await this.countDocuments({ pollId, hashedIp });
  return count > 0;
};

/**
 * Static method to record a vote
 * Returns true if vote was recorded, false if already voted
 */
VoteRecordSchema.statics.recordVote = async function(
  pollId: string, 
  hashedIp: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const record = new this({
      pollId,
      hashedIp,
      votedAt: new Date(),
    });
    
    await record.save();
    return { success: true };
  } catch (error: unknown) {
    // Check for duplicate key error (MongoDB error code 11000)
    if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
      return { 
        success: false, 
        error: 'You have already voted on this poll from this network' 
      };
    }
    
    console.error('Error recording vote:', error);
    return { 
      success: false, 
      error: 'Failed to record vote. Please try again.' 
    };
  }
};

/**
 * Static method to delete all vote records for a poll
 * Useful when deleting a poll
 */
VoteRecordSchema.statics.deleteByPollId = async function(pollId: string): Promise<void> {
  await this.deleteMany({ pollId });
};

// Create or get the model
export const VoteRecord = mongoose.models.VoteRecord || 
  mongoose.model<IVoteRecord>('VoteRecord', VoteRecordSchema);

export default VoteRecord;

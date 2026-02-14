import mongoose, { Schema, Document } from 'mongoose';

/**
 * Poll Model
 * 
 * Defines the schema for polls in the database.
 * Each poll has a question, multiple options with vote counts,
 * and metadata for creation/update timestamps.
 */

// Interface for Poll Option subdocument
export interface IPollOption {
  id: string;
  text: string;
  votes: number;
}

// Interface for Poll document
export interface IPoll extends Document {
  _id: string;
  question: string;
  options: IPollOption[];
  totalVotes: number;
  createdAt: Date;
  updatedAt: Date;
}

// Poll Option Schema
const PollOptionSchema = new Schema<IPollOption>({
  id: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  votes: {
    type: Number,
    default: 0,
    min: 0,
  },
}, { _id: false });

// Poll Schema
const PollSchema = new Schema<IPoll>({
  _id: {
    type: String,
    required: true,
  },
  question: {
    type: String,
    required: true,
    trim: true,
    minlength: 5,
    maxlength: 500,
  },
  options: {
    type: [PollOptionSchema],
    required: true,
    validate: {
      validator: function(options: IPollOption[]) {
        return options.length >= 2 && options.length <= 10;
      },
      message: 'Poll must have between 2 and 10 options',
    },
  },
  totalVotes: {
    type: Number,
    default: 0,
    min: 0,
  },
}, {
  timestamps: true, // Automatically add createdAt and updatedAt
  collection: 'polls',
});

// Index for faster queries
PollSchema.index({ createdAt: -1 });

// Static method to find poll by ID
PollSchema.statics.findByPollId = function(pollId: string) {
  return this.findById(pollId).lean();
};

// Instance method to increment vote count for an option
PollSchema.methods.voteForOption = async function(optionId: string): Promise<boolean> {
  const option = this.options.find((opt: IPollOption) => opt.id === optionId);
  
  if (!option) {
    return false;
  }
  
  // Use atomic update to prevent race conditions
  const result = await mongoose.model('Poll').findOneAndUpdate(
    { 
      _id: this._id, 
      'options.id': optionId 
    },
    { 
      $inc: { 
        'options.$.votes': 1,
        totalVotes: 1
      } 
    },
    { 
      new: true,
      runValidators: true 
    }
  );
  
  return !!result;
};

// Create or get the model
export const Poll = mongoose.models.Poll || mongoose.model<IPoll>('Poll', PollSchema);

export default Poll;

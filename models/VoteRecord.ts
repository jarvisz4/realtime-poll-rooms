import mongoose, { Schema, Model, Document } from "mongoose";

export interface IVoteRecord extends Document {
  pollId: string;
  hashedIp: string;
  optionId: string;
  votedAt: Date;
}

interface VoteRecordModel extends Model<IVoteRecord> {
  deleteByPollId(id: string): unknown;
  hasVoted(pollId: string, hashedIp: string): Promise<boolean>;
  recordVote(
    pollId: string,
    hashedIp: string,
    optionId: string
  ): Promise<IVoteRecord>;
}

const VoteRecordSchema = new Schema<IVoteRecord>(
  {
    pollId: { type: String, required: true, index: true },
    hashedIp: { type: String, required: true, index: true },
    optionId: { type: String, required: true },
    votedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

/* ---------- STATIC METHODS ---------- */

VoteRecordSchema.statics.hasVoted = async function (
  pollId: string,
  hashedIp: string
) {
  const existing = await this.findOne({ pollId, hashedIp });
  return !!existing;
};

VoteRecordSchema.statics.recordVote = async function (
  pollId: string,
  hashedIp: string,
  optionId: string
) {
  return await this.create({
    pollId,
    hashedIp,
    optionId,
  });
};

export const VoteRecord =
  (mongoose.models.VoteRecord as VoteRecordModel) ||
  mongoose.model<IVoteRecord, VoteRecordModel>(
    "VoteRecord",
    VoteRecordSchema
  );

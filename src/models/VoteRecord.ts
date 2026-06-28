import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IVoteRecord extends Document {
  userId: string;
  electionId: mongoose.Types.ObjectId;
  candidateId?: mongoose.Types.ObjectId;
  timestamp: Date;
}

const VoteRecordSchema: Schema<IVoteRecord> = new Schema(
  {
    userId: {
      type: String,
      required: [true, 'User ID pemilih harus diisi'],
    },
    electionId: {
      type: Schema.Types.ObjectId,
      ref: 'Election',
      required: [true, 'ID Pemilihan harus diisi'],
    },
    candidateId: {
      type: Schema.Types.ObjectId,
      ref: 'Candidate',
      required: false,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

// Prevent double voting by creating a compound unique index on userId + electionId
VoteRecordSchema.index({ userId: 1, electionId: 1 }, { unique: true });

if (mongoose.models.VoteRecord) {
  delete mongoose.models.VoteRecord;
}

const VoteRecord: Model<IVoteRecord> =
  mongoose.model<IVoteRecord>('VoteRecord', VoteRecordSchema);

export default VoteRecord;

import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IElection extends Document {
  title: string;
  description: string;
  createdBy: string; // Name or User ID who created it
  startTime: Date;
  endTime: Date;
  status: 'draft' | 'published' | 'active' | 'closed';
  candidates: mongoose.Types.ObjectId[]; // References to Candidate documents
  rules: any; // RuleGroup logic tree (Schema.Types.Mixed)
  totalVotes: number;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const ElectionSchema: Schema<IElection> = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Judul pemilihan harus diisi'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    createdBy: {
      type: String, // Can be user name or user ID
      required: [true, 'Nama/ID Pembuat harus diisi'],
    },
    startTime: {
      type: Date,
      required: [true, 'Waktu mulai harus ditentukan'],
    },
    endTime: {
      type: Date,
      required: [true, 'Waktu selesai harus ditentukan'],
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'active', 'closed'],
      default: 'draft',
    },
    candidates: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Candidate',
      },
    ],

    rules: {
      type: Schema.Types.Mixed, // Flexible logic tree rules engine
      default: {
        logic: 'AND',
        conditions: [],
        groups: [],
      },
    },
    totalVotes: {
      type: Number,
      default: 0,
      min: 0,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Election: Model<IElection> =
  mongoose.models.Election || mongoose.model<IElection>('Election', ElectionSchema);

export default Election;

import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICandidate extends Document {
  name: string;
  description: string;
  image: string; // Cloudinary secure URL
  electionId: mongoose.Types.ObjectId;
  voteCount: number;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const CandidateSchema: Schema<ICandidate> = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Nama kandidat harus diisi'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    image: {
      type: String, // Cloudinary secure URL
      default: '',
    },
    electionId: {
      type: Schema.Types.ObjectId,
      ref: 'Election',
      required: [true, 'ID Pemilihan harus dikaitkan'],
    },
    voteCount: {
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

const Candidate: Model<ICandidate> =
  mongoose.models.Candidate || mongoose.model<ICandidate>('Candidate', CandidateSchema);

export default Candidate;

import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUserCategory extends Document {
  key: string;
  label: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserCategorySchema: Schema<IUserCategory> = new Schema(
  {
    key: {
      type: String,
      required: [true, 'Key kategori harus diisi'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    label: {
      type: String,
      required: [true, 'Label kategori harus diisi'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const UserCategory: Model<IUserCategory> =
  mongoose.models.UserCategory ||
  mongoose.model<IUserCategory>('UserCategory', UserCategorySchema);

export default UserCategory;

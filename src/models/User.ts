import mongoose, { Schema, Document, Model } from 'mongoose';
import { UserRole } from '@/types';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash?: string; // Optional password hash for secure login
  role: UserRole;
  avatar?: string; // Cloudinary secure URL
  category: string; // Dynamic user category key (e.g. 'mahasiswa', 'dosen', 'staff')
  attributes: Record<string, string | number>;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Nama lengkap harus diisi'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email harus diisi'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Format email tidak valid'],
    },
    passwordHash: {
      type: String,
    },
    role: {
      type: String,
      enum: ['admin', 'election_admin', 'voter'],
      default: 'voter',
    },
    avatar: {
      type: String, // Cloudinary image URL
      default: '',
    },
    category: {
      type: String, // Dynamic category key
      default: '',
      trim: true,
      lowercase: true,
    },
    attributes: {
      type: Schema.Types.Mixed, // Flexible key-value dynamic attributes
      default: {},
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

if (mongoose.models.User) {
  delete mongoose.models.User;
}

const User: Model<IUser> = mongoose.model<IUser>('User', UserSchema);

export default User;

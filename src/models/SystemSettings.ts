import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISystemSettings extends Document {
  appName: string;
  tagline: string;
  defaultLanguage: 'id' | 'en';
  timezone: string;
  emailNotification: boolean;
  autoClose: boolean;
  maintenanceMode: boolean;
  maxCandidates: number;
  minVoterThreshold: number;
  primaryColor: string;
  logoUrl?: string; // Cloudinary secure URL
  faviconUrl?: string; // Cloudinary secure URL
  createdAt: Date;
  updatedAt: Date;
}

const SystemSettingsSchema: Schema<ISystemSettings> = new Schema(
  {
    appName: {
      type: String,
      default: 'MudaVote',
      trim: true,
    },
    tagline: {
      type: String,
      default: 'Platform E-Voting Organisasi Modern',
      trim: true,
    },
    defaultLanguage: {
      type: String,
      enum: ['id', 'en'],
      default: 'id',
    },
    timezone: {
      type: String,
      default: 'Asia/Jakarta',
      trim: true,
    },
    emailNotification: {
      type: Boolean,
      default: true,
    },
    autoClose: {
      type: Boolean,
      default: true,
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    maxCandidates: {
      type: Number,
      default: 10,
    },
    minVoterThreshold: {
      type: Number,
      default: 50,
    },
    primaryColor: {
      type: String,
      default: '#4f46e5',
      trim: true,
    },
    logoUrl: {
      type: String, // Cloudinary secure URL
      default: '',
    },
    faviconUrl: {
      type: String, // Cloudinary secure URL
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const SystemSettings: Model<ISystemSettings> =
  mongoose.models.SystemSettings ||
  mongoose.model<ISystemSettings>('SystemSettings', SystemSettingsSchema);

export default SystemSettings;

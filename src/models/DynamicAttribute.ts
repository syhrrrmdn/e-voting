import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDynamicAttribute extends Document {
  key: string;
  label: string;
  type: 'text' | 'select' | 'number';
  options: string[];
  required: boolean;
  applicableTo: string[]; // Array of category keys; empty [] = applies to ALL categories
  sentencePattern?: 'default' | 'origin' | 'from' | 'status' | 'direct' | 'title' | 'location';
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const DynamicAttributeSchema: Schema<IDynamicAttribute> = new Schema(
  {
    key: {
      type: String,
      required: [true, 'Key atribut harus diisi'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    label: {
      type: String,
      required: [true, 'Label tampilan atribut harus diisi'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['text', 'select', 'number'],
      required: true,
      default: 'text',
    },
    options: {
      type: [String], // Array of choices if type is 'select'
      default: [],
    },
    required: {
      type: Boolean,
      default: false,
    },
    applicableTo: {
      type: [String], // Array of category keys; empty means ALL
      default: [],
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

if (mongoose.models.DynamicAttribute) {
  delete mongoose.models.DynamicAttribute;
}

const DynamicAttribute: Model<IDynamicAttribute> =
  mongoose.model<IDynamicAttribute>('DynamicAttribute', DynamicAttributeSchema);

export default DynamicAttribute;

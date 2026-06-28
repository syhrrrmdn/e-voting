import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAuditLog extends Document {
  userId: string;
  userName: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'VOTE' | 'PUBLISH' | string;
  description: string;
  timestamp: Date;
  resource: string;
  details?: any;
}

const AuditLogSchema: Schema<IAuditLog> = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      required: true,
      trim: true,
    },
    action: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    resource: {
      type: String,
      required: true,
      trim: true,
    },
    details: {
      type: Schema.Types.Mixed,
      required: false,
    },
  },
  {
    timestamps: false, // Using timestamp field explicitly
  }
);

delete mongoose.models.AuditLog;

const AuditLog: Model<IAuditLog> =
  mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);

export default AuditLog;

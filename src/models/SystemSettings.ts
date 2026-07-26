import { BaseModel } from '@/lib/db';

export interface ISystemSettings {
  _id: string;
  id: string;
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
  faviconUrl?: string; // Plain URL string for favicon (no JSON)
  createdAt: Date | string;
  updatedAt: Date | string;
}

const SystemSettings = new BaseModel('SystemSettings');
export default SystemSettings;

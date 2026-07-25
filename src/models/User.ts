import { BaseModel } from '@/lib/db';
import { UserRole } from '@/types';

export interface IUser {
  _id: string;
  id: string;
  name: string;
  email: string;
  passwordHash?: string; // Optional password hash for secure login
  role: UserRole;
  avatar?: string; // Cloudinary secure URL
  category: string; // Dynamic user category key (e.g. 'mahasiswa', 'dosen', 'staff')
  attributes: Record<string, string | number>;
  status: 'active' | 'inactive';
  resetPasswordToken?: string;
  resetPasswordExpires?: Date | string;
  deletedAt?: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

const User = new BaseModel('User');
export default User;

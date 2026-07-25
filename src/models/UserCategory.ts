import { BaseModel } from '@/lib/db';

export interface IUserCategory {
  _id: string;
  id: string;
  key: string;
  label: string;
  description: string;
  deletedAt?: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

const UserCategory = new BaseModel('UserCategory');
export default UserCategory;

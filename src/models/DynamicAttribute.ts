import { BaseModel } from '@/lib/db';

export interface IDynamicAttribute {
  _id: string;
  id: string;
  key: string;
  label: string;
  type: 'text' | 'select' | 'number';
  options: string[];
  required: boolean;
  applicableTo: string[]; // Array of category keys; empty [] = applies to ALL categories
  sentencePattern?: 'default' | 'origin' | 'from' | 'status' | 'direct' | 'title' | 'location';
  deletedAt?: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

const DynamicAttribute = new BaseModel('DynamicAttribute');
export default DynamicAttribute;

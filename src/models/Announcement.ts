import { BaseModel } from '@/lib/db';

export interface IAnnouncement {
  _id: string;
  id: string;
  title: string;
  content: string;
  category: 'PENTING' | 'INFORMASI' | 'PANDUAN' | 'UMUM';
  imageUrl?: string;
  isPinned?: boolean;
  authorName?: string;
  createdById?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  deletedAt?: Date | string | null;
}

const Announcement = new BaseModel('Announcement');
export default Announcement;

import { BaseModel } from '@/lib/db';

export interface ICandidate {
  _id: string;
  id: string;
  name: string;
  description: string;
  image: string; // Cloudinary secure URL
  electionId: string;
  voteCount: number;
  deletedAt?: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

const Candidate = new BaseModel('Candidate');
export default Candidate;

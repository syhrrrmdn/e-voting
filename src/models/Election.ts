import { BaseModel } from '@/lib/db';

export interface IElection {
  _id: string;
  id: string;
  title: string;
  description: string;
  createdBy: string; // Name or User ID who created it
  startTime: Date | string;
  endTime: Date | string;
  status: 'draft' | 'published' | 'active' | 'closed';
  candidates: any[]; // References to Candidate documents or populated Candidates
  rules: any; // RuleGroup logic tree
  totalVotes: number;
  deletedAt?: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

const Election = new BaseModel('Election');
export default Election;

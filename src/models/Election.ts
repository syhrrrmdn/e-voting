import { BaseModel } from '@/lib/db';

export interface IElection {
  _id: string;
  id: string;
  title: string;
  description: string;
  createdBy: string; // Name of creator
  createdById?: string; // User ID of creator (dedicated column)
  creatorCategory?: string; // Creator's category (dedicated column)
  creatorAttributes?: Record<string, any>; // Creator's dynamic attributes (dedicated column)
  startTime: Date | string;
  endTime: Date | string;
  status: 'draft' | 'published' | 'active' | 'closed';
  candidates: any[]; // Legacy column — kept but not used. Use Candidate.electionId instead.
  rules: any; // RuleGroup logic tree (voter eligibility ONLY)
  totalVotes: number;
  deletedAt?: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

const Election = new BaseModel('Election');
export default Election;

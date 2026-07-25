import { BaseModel } from '@/lib/db';

export interface IVoteRecord {
  _id: string;
  id: string;
  userId: string;
  electionId: string;
  candidateId?: string;
  timestamp: Date | string;
}

const VoteRecord = new BaseModel('VoteRecord');
export default VoteRecord;

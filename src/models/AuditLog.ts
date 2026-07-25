import { BaseModel } from '@/lib/db';

export interface IAuditLog {
  _id: string;
  id: string;
  userId: string;
  userName: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'VOTE' | 'PUBLISH' | string;
  description: string;
  timestamp: Date | string;
  resource: string;
  details?: any;
}

const AuditLog = new BaseModel('AuditLog');
export default AuditLog;

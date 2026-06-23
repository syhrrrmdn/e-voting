// ============================================================
// E-Voting Multi-Instansi - Type Definitions
// ============================================================

export type UserRole = 'admin' | 'election_admin' | 'voter';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  instansiId: string;
  instansiName: string;
  avatar?: string;
  attributes: Record<string, string | number>;
  createdAt: string;
  status: 'active' | 'inactive';
}

export interface Instansi {
  id: string;
  name: string;
  code: string;
  type: string;
  userCount: number;
  electionCount: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface DynamicAttribute {
  id: string;
  key: string;
  label: string;
  type: 'text' | 'select' | 'number';
  options: string[];
  required: boolean;
  createdAt: string;
}

export interface Candidate {
  id: string;
  name: string;
  description: string;
  image: string;
  electionId: string;
  voteCount: number;
}

export type RuleOperator = '=' | '!=' | 'IN';

export interface RuleCondition {
  id: string;
  field: string;
  operator: RuleOperator;
  value: string | string[];
}

export interface RuleGroup {
  id: string;
  logic: 'AND' | 'OR';
  conditions: RuleCondition[];
  groups: RuleGroup[];
}

export interface Election {
  id: string;
  title: string;
  description: string;
  instansiId: string;
  instansiName: string;
  startTime: string;
  endTime: string;
  status: 'draft' | 'published' | 'active' | 'closed';
  candidates: Candidate[];
  rules: RuleGroup;
  totalVotes: number;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  description: string;
  timestamp: string;
  resource: string;
}

export interface VoteRecord {
  id: string;
  userId: string;
  electionId: string;
  candidateId: string;
  timestamp: string;
}

export type AdminPage =
  | 'dashboard'
  | 'users'
  | 'instansi'
  | 'attributes'
  | 'elections'
  | 'audit'
  | 'settings';

export type ElectionAdminPage =
  | 'dashboard'
  | 'elections'
  | 'candidates'
  | 'rules'
  | 'results'
  | 'audit';

export type VoterPage =
  | 'dashboard'
  | 'elections'
  | 'voting'
  | 'results'
  | 'profile';

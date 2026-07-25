-- ============================================================
-- E-Voting System - Supabase/PostgreSQL Database Schema
-- Run this script in the Supabase SQL Editor to initialize all tables
-- ============================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Table: UserCategory
CREATE TABLE IF NOT EXISTS "UserCategory" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "key" TEXT UNIQUE NOT NULL,
  "label" TEXT NOT NULL,
  "description" TEXT DEFAULT '',
  "deletedAt" TIMESTAMPTZ DEFAULT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Table: User
CREATE TABLE IF NOT EXISTS "User" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "email" TEXT UNIQUE NOT NULL,
  "passwordHash" TEXT,
  "role" TEXT NOT NULL DEFAULT 'voter',
  "avatar" TEXT DEFAULT '',
  "category" TEXT DEFAULT '',
  "attributes" JSONB NOT NULL DEFAULT '{}'::jsonb,
  "status" TEXT NOT NULL DEFAULT 'active',
  "resetPasswordToken" TEXT DEFAULT NULL,
  "resetPasswordExpires" TIMESTAMPTZ DEFAULT NULL,
  "deletedAt" TIMESTAMPTZ DEFAULT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Table: DynamicAttribute
CREATE TABLE IF NOT EXISTS "DynamicAttribute" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "key" TEXT UNIQUE NOT NULL,
  "label" TEXT NOT NULL,
  "type" TEXT NOT NULL DEFAULT 'text',
  "options" JSONB NOT NULL DEFAULT '[]'::jsonb,
  "required" BOOLEAN NOT NULL DEFAULT false,
  "applicableTo" JSONB NOT NULL DEFAULT '[]'::jsonb,
  "deletedAt" TIMESTAMPTZ DEFAULT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Table: Election
CREATE TABLE IF NOT EXISTS "Election" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "title" TEXT NOT NULL,
  "description" TEXT DEFAULT '',
  "createdBy" TEXT NOT NULL,
  "startTime" TIMESTAMPTZ NOT NULL,
  "endTime" TIMESTAMPTZ NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'draft',
  "candidates" JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of candidate UUID strings
  "rules" JSONB NOT NULL DEFAULT '{"logic": "AND", "conditions": [], "groups": []}'::jsonb,
  "totalVotes" INTEGER NOT NULL DEFAULT 0,
  "deletedAt" TIMESTAMPTZ DEFAULT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Table: Candidate
CREATE TABLE IF NOT EXISTS "Candidate" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "description" TEXT DEFAULT '',
  "image" TEXT DEFAULT '',
  "electionId" UUID NOT NULL REFERENCES "Election"("id") ON DELETE CASCADE,
  "voteCount" INTEGER NOT NULL DEFAULT 0,
  "deletedAt" TIMESTAMPTZ DEFAULT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Table: VoteRecord
CREATE TABLE IF NOT EXISTS "VoteRecord" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" TEXT NOT NULL,
  "electionId" UUID NOT NULL REFERENCES "Election"("id") ON DELETE CASCADE,
  "candidateId" UUID REFERENCES "Candidate"("id") ON DELETE SET NULL,
  "timestamp" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_user_election UNIQUE ("userId", "electionId")
);

-- 7. Table: AuditLog
CREATE TABLE IF NOT EXISTS "AuditLog" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" TEXT NOT NULL,
  "userName" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "timestamp" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "resource" TEXT NOT NULL,
  "details" JSONB DEFAULT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Table: SystemSettings
CREATE TABLE IF NOT EXISTS "SystemSettings" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "appName" TEXT NOT NULL DEFAULT 'MudaVote',
  "tagline" TEXT NOT NULL DEFAULT 'Platform E-Voting Organisasi Modern',
  "defaultLanguage" TEXT NOT NULL DEFAULT 'id',
  "timezone" TEXT NOT NULL DEFAULT 'Asia/Jakarta',
  "emailNotification" BOOLEAN NOT NULL DEFAULT true,
  "autoClose" BOOLEAN NOT NULL DEFAULT true,
  "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
  "maxCandidates" INTEGER NOT NULL DEFAULT 10,
  "minVoterThreshold" INTEGER NOT NULL DEFAULT 50,
  "primaryColor" TEXT NOT NULL DEFAULT '#4f46e5',
  "logoUrl" TEXT DEFAULT '',
  "faviconUrl" TEXT DEFAULT '',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security (RLS) on all tables for security compliance
ALTER TABLE "UserCategory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DynamicAttribute" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Election" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Candidate" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "VoteRecord" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AuditLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SystemSettings" ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any to prevent duplication errors
DROP POLICY IF EXISTS "Allow All Operations for App Backend" ON "UserCategory";
DROP POLICY IF EXISTS "Allow All Operations for App Backend" ON "User";
DROP POLICY IF EXISTS "Allow All Operations for App Backend" ON "DynamicAttribute";
DROP POLICY IF EXISTS "Allow All Operations for App Backend" ON "Election";
DROP POLICY IF EXISTS "Allow All Operations for App Backend" ON "Candidate";
DROP POLICY IF EXISTS "Allow All Operations for App Backend" ON "VoteRecord";
DROP POLICY IF EXISTS "Allow All Operations for App Backend" ON "AuditLog";
DROP POLICY IF EXISTS "Allow All Operations for App Backend" ON "SystemSettings";

-- Create RLS Policies for Application Server & Authenticated Operations
CREATE POLICY "Allow All Operations for App Backend" ON "UserCategory" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Operations for App Backend" ON "User" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Operations for App Backend" ON "DynamicAttribute" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Operations for App Backend" ON "Election" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Operations for App Backend" ON "Candidate" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Operations for App Backend" ON "VoteRecord" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Operations for App Backend" ON "AuditLog" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Operations for App Backend" ON "SystemSettings" FOR ALL USING (true) WITH CHECK (true);


'use client';

import React, { useState, useEffect } from 'react';
import type { UserRole } from '@/types';
import DashboardLayout from '@/components/layout/DashboardLayout';

// Admin System components
import AdminDashboard from '@/components/admin/Dashboard';
import UserManagement from '@/components/admin/UserManagement';
import InstansiManagement from '@/components/admin/InstansiManagement';
import DynamicAttributes from '@/components/admin/DynamicAttributes';
import AdminElectionManagement from '@/components/admin/ElectionManagement';
import AdminAuditLogs from '@/components/admin/AuditLogs';
import SystemSettings from '@/components/admin/SystemSettings';

// Election Admin components
import ElectionAdminDashboard from '@/components/election-admin/Dashboard';
import ElectionManagement from '@/components/election-admin/ElectionManagement';
import CandidateManagement from '@/components/election-admin/CandidateManagement';
import VoterRuleEngine from '@/components/election-admin/VoterRuleEngine';
import ResultDashboard from '@/components/election-admin/ResultDashboard';

// Voter components
import VoterDashboard from '@/components/voter/Dashboard';
import AvailableElections from '@/components/voter/AvailableElections';
import VotingPage from '@/components/voter/VotingPage';
import VoterResults from '@/components/voter/Results';
import VoterProfile from '@/components/voter/Profile';

export default function Page() {
  const [role, setRole] = useState<UserRole>('admin');
  const [activePage, setActivePage] = useState<string>('dashboard');
  const [selectedElectionId, setSelectedElectionId] = useState<string>('elec-1');

  // Load state from URL on initial mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const roleParam = params.get('role') as UserRole;
      const pageParam = params.get('page');
      const electionParam = params.get('election');

      if (roleParam && ['admin', 'election_admin', 'voter'].includes(roleParam)) {
        setRole(roleParam);
      }
      if (pageParam) {
        setActivePage(pageParam);
      }
      if (electionParam) {
        setSelectedElectionId(electionParam);
      }
    }
  }, []);

  // Update URL function helper
  const updateUrl = (newRole: UserRole, newPage: string, electionId: string) => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('role', newRole);
      url.searchParams.set('page', newPage);
      if (electionId) {
        url.searchParams.set('election', electionId);
      } else {
        url.searchParams.delete('election');
      }
      window.history.pushState({}, '', url.pathname + url.search);
    }
  };

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    setActivePage('dashboard');
    updateUrl(newRole, 'dashboard', selectedElectionId);
  };

  const handlePageChange = (newPage: string) => {
    setActivePage(newPage);
    updateUrl(role, newPage, selectedElectionId);
  };

  const handleElectionChange = (newElectionId: string) => {
    setSelectedElectionId(newElectionId);
    updateUrl(role, activePage, newElectionId);
  };

  // Page Routing Logic
  const renderContent = () => {
    switch (role) {
      case 'admin':
        switch (activePage) {
          case 'dashboard':
            return <AdminDashboard onNavigate={handlePageChange} />;
          case 'users':
            return <UserManagement />;
          case 'instansi':
            return <InstansiManagement />;
          case 'attributes':
            return <DynamicAttributes />;
          case 'elections':
            return <AdminElectionManagement onNavigate={handlePageChange} onSelectElection={handleElectionChange} onRoleChange={handleRoleChange} />;
          case 'audit':
            return <AdminAuditLogs />;
          case 'settings':
            return <SystemSettings />;
          default:
            return <AdminDashboard onNavigate={handlePageChange} />;
        }

      case 'election_admin':
        switch (activePage) {
          case 'dashboard':
            return <ElectionAdminDashboard onNavigate={handlePageChange} onSelectElection={handleElectionChange} />;
          case 'elections':
            return <ElectionManagement onNavigate={handlePageChange} onSelectElection={handleElectionChange} />;
          case 'candidates':
            return <CandidateManagement selectedElectionId={selectedElectionId} />;
          case 'rules':
            return <VoterRuleEngine />;
          case 'results':
            return <ResultDashboard />;
          case 'audit':
            return <AdminAuditLogs />;
          default:
            return <ElectionAdminDashboard onNavigate={handlePageChange} onSelectElection={handleElectionChange} />;
        }

      case 'voter':
        switch (activePage) {
          case 'dashboard':
            return <VoterDashboard onNavigate={handlePageChange} onSelectElection={handleElectionChange} />;
          case 'elections':
            return (
              <AvailableElections 
                onSelectElection={handleElectionChange} 
                onNavigate={handlePageChange} 
              />
            );
          case 'voting':
            return <VotingPage selectedElectionId={selectedElectionId} onNavigate={handlePageChange} />;
          case 'results':
            return <VoterResults />;
          case 'profile':
            return <VoterProfile />;
          default:
            return <VoterDashboard onNavigate={handlePageChange} onSelectElection={handleElectionChange} />;
        }

      default:
        return <AdminDashboard onNavigate={handlePageChange} />;
    }
  };

  return (
    <DashboardLayout
      role={role}
      activePage={activePage}
      onNavigate={handlePageChange}
      onRoleChange={handleRoleChange}
    >
      {renderContent()}
    </DashboardLayout>
  );
}

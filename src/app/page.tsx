'use client';

import React, { useState, useEffect } from 'react';
import type { UserRole } from '@/types';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useSession } from 'next-auth/react';

// Admin System components
import AdminDashboard from '@/components/admin/Dashboard';
import UserManagement from '@/components/admin/UserManagement';
import VoterDataManager from '@/components/admin/VoterDataManager';
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
  const { data: session, status } = useSession();
  const sessionRole = (session?.user as any)?.role as UserRole;

  const [role, setRole] = useState<UserRole>('voter');
  const [activePage, setActivePage] = useState<string>('dashboard');
  const [selectedElectionId, setSelectedElectionId] = useState<string>('');
  const [settings, setSettings] = useState<any>(null);

  // Fetch settings on mount
  useEffect(() => {
    fetch('/api/settings')
      .then(res => {
        if (!res.ok) return null;
        return res.json();
      })
      .then(json => {
        if (json && json.success && json.data) {
          setSettings(json.data);
          // Update browser tab title dynamically
          const name = json.data.appName || 'MudaVote';
          const tag = json.data.tagline || 'Platform E-Voting Organisasi';
          document.title = `${name} — ${tag}`;
        }
      })
      .catch(() => {});
  }, []);

  // Enforce role-based access control (RBAC) client-side
  useEffect(() => {
    if (status === 'authenticated' && sessionRole) {
      if (sessionRole !== 'admin') {
        // Strict locking for non-admins to their session role
        setRole(sessionRole);

        // Clean URL role parameter if they tried to spoof it
        if (typeof window !== 'undefined') {
          const url = new URL(window.location.href);
          const roleParam = url.searchParams.get('role');
          if (roleParam && roleParam !== sessionRole) {
            url.searchParams.set('role', sessionRole);
            window.history.replaceState({}, '', url.pathname + url.search);
          }
        }
      } else {
        // Admins can switch roles for testing, load role from parameter if valid
        if (typeof window !== 'undefined') {
          const params = new URLSearchParams(window.location.search);
          const roleParam = params.get('role') as UserRole;
          if (roleParam && ['admin', 'election_admin', 'voter'].includes(roleParam)) {
            setRole(roleParam);
          } else {
            setRole('admin');
          }
        }
      }
    }
  }, [sessionRole, status]);

  // Load other states from URL on initial mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const pageParam = params.get('page');
      const electionParam = params.get('election');

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
      // If user is not an admin, they cannot change their role parameter
      const targetRole = (status === 'authenticated' && sessionRole !== 'admin') ? sessionRole : newRole;

      url.searchParams.set('role', targetRole);
      url.searchParams.set('page', newPage);
      if (electionId) {
        url.searchParams.set('election', electionId);
      } else {
        url.searchParams.delete('election');
      }
      window.history.pushState({}, '', url.pathname + url.search);
    }
  };

  // Render a loading page
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 font-sans">
        <div className="relative flex items-center justify-center">
          {/* Pulsing ring outer */}
          <div className="absolute w-20 h-20 rounded-full border-4 border-indigo-500/20 animate-pulse" />
          {/* Spinning loader */}
          <div className="w-16 h-16 rounded-full border-4 border-t-indigo-500 border-r-cyan-400 border-b-indigo-500 border-l-cyan-400 animate-spin" />
        </div>
        <h2 className="mt-6 text-lg font-bold text-white tracking-wide">Memuat Sesi Pengguna...</h2>
        <p className="mt-1.5 text-xs text-slate-400 font-medium">
          {settings?.appName || 'MudaVote'} — {settings?.tagline || 'Platform E-Voting'}
        </p>
      </div>
    );
  }

  // Fallback for unauthenticated state (normally redirected by middleware)
  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 font-sans">
        <h2 className="text-lg font-bold text-white tracking-wide">Mengarahkan ke Halaman Login...</h2>
        <p className="mt-1 text-xs text-slate-400">Anda belum masuk.</p>
      </div>
    );
  }

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
          case 'voter_data':
            return <VoterDataManager />;
          case 'attributes':
            return <DynamicAttributes />;
          case 'elections':
            return <AdminElectionManagement />;
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

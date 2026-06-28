'use client';
import React, { useState, useEffect } from 'react';
import { PageHeader, Card, Badge, Button } from '@/components/ui';
import { checkEligibility } from '@/lib/ruleEngine';

export default function AvailableElections({ onSelectElection, onNavigate }: { 
  onSelectElection: (id: string) => void;
  onNavigate: (page: string) => void;
}) {
  const [elections, setElections] = useState<any[]>([]);
  const [votes, setVotes] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [electionsRes, votesRes, userRes] = await Promise.all([
        fetch('/api/elections'),
        fetch('/api/vote'),
        fetch('/api/me')
      ]);

      const electionsJson = await electionsRes.json();
      const votesJson = await votesRes.json();
      const userJson = await userRes.json();

      if (electionsJson.success && electionsJson.data) {
        setElections(electionsJson.data);
      }
      if (votesJson.success && votesJson.data) {
        setVotes(votesJson.data);
      }
      if (userJson.success && userJson.data) {
        setUserProfile(userJson.data);
      }
    } catch (err) {
      console.error('Gagal mengambil data pemilihan:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleVoteClick = (id: string) => {
    onSelectElection(id);
    onNavigate('voting');
  };

  const handleResultClick = (id: string) => {
    onSelectElection(id);
    onNavigate('results');
  };

  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center text-slate-500">
        <div className="w-8 h-8 rounded-full border-2 border-t-indigo-600 border-slate-200 animate-spin mb-3" />
        <p className="text-sm font-medium">Memuat daftar pemilihan...</p>
      </div>
    );
  }

  // Filter elections to only show the ones targeting the user's attributes (based on rules engine)
  const categoryFilteredElections = elections.filter(e => {
    return checkEligibility(
      { category: userProfile?.category, ...(userProfile?.attributes || {}) },
      e.rules
    );
  });

  const processedElections = categoryFilteredElections.map(e => {
    let eligible = true;
    let reason = '';
    const now = new Date();

    const hasAlreadyVoted = votes.some(v => v.electionId === e._id);

    if (e.status === 'closed' || now > new Date(e.endTime)) {
      eligible = false;
      reason = 'Pemilihan sudah berakhir';
    } else if (hasAlreadyVoted) {
      eligible = false;
      reason = 'Anda sudah memberikan suara';
    }

    return { 
      ...e, 
      eligible, 
      reason,
      hasVoted: hasAlreadyVoted 
    };
  });

  return (
    <div>
      <PageHeader 
        title="Daftar Pemilihan" 
        subtitle="Lihat semua pemilihan yang aktif, terjadwal, maupun selesai" 
      />

      {processedElections.length === 0 ? (
        <Card className="text-center py-12 text-slate-400">
          <p className="text-sm">Belum ada pemilihan yang terdaftar di sistem.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {processedElections.map((e) => (
            <Card key={e._id} className="flex flex-col justify-between h-full relative">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Badge color={e.status === 'active' ? 'green' : e.status === 'published' ? 'indigo' : 'gray'}>
                    {e.status === 'active' ? 'Aktif Berjalan' : e.status === 'published' ? 'Akan Datang' : 'Selesai'}
                  </Badge>
                  
                  {e.status === 'active' && (
                    <Badge color={e.eligible ? 'green' : 'red'} dot>
                      {e.eligible ? 'Memenuhi Syarat' : 'Tidak Memenuhi Syarat'}
                    </Badge>
                  )}
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-2">{e.title}</h3>
                <p className="text-sm text-slate-600 mb-4 line-clamp-3">{e.description}</p>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Mulai: {new Date(e.startTime).toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Selesai: {new Date(e.endTime).toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 flex items-center justify-between mt-auto">
                {!e.eligible && (e.status === 'active' || e.status === 'closed') ? (
                  <span className="text-xs text-red-500 font-medium italic">{e.reason}</span>
                ) : (
                  <span className="text-xs text-slate-400 font-semibold">{e.totalVotes || 0} Suara Terdaftar</span>
                )}

                {e.status === 'active' && (
                  <Button 
                    size="sm" 
                    disabled={!e.eligible}
                    onClick={() => handleVoteClick(e._id)}
                  >
                    Buka Bilik Suara
                  </Button>
                )}

                {e.status === 'closed' && (
                  <Button 
                    size="sm" 
                    variant="secondary"
                    onClick={() => handleResultClick(e._id)}
                  >
                    Lihat Hasil
                  </Button>
                )}

                {e.status === 'published' && (
                  <Button 
                    size="sm" 
                    variant="secondary"
                    disabled
                  >
                    Belum Dimulai
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

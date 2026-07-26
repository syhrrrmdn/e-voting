'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  image?: string;
  category?: string;
  attributes?: Record<string, any>;
}

interface AuthContextType {
  user: AuthUser | null;
  supabaseUser: SupabaseUser | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  supabaseUser: null,
  status: 'loading',
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

// Compatibility shim: components that used useSession() can use this
export function useSession() {
  const { user, status } = useAuth();
  return {
    data: user ? {
      user: {
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
        id: user.id,
      }
    } : null,
    status,
    update: async () => {
      // Trigger profile refresh
    },
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');

  const supabase = createSupabaseBrowserClient();

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch('/api/me');
      const json = await res.json();
      if (json.success && json.data) {
        setUser({
          id: json.data.id || json.data._id,
          name: json.data.name,
          email: json.data.email,
          role: json.data.role,
          image: json.data.avatar || '',
          category: json.data.category,
          attributes: json.data.attributes,
        });
        setStatus('authenticated');
      } else {
        setUser(null);
        setStatus('unauthenticated');
      }
    } catch {
      setUser(null);
      setStatus('unauthenticated');
    }
  }, []);

  useEffect(() => {
    // Check initial auth state
    supabase.auth.getUser().then(({ data: { user: sbUser } }) => {
      if (sbUser) {
        setSupabaseUser(sbUser);
        fetchProfile();
      } else {
        setStatus('unauthenticated');
      }
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setSupabaseUser(session.user);
          await fetchProfile();
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setSupabaseUser(null);
          setStatus('unauthenticated');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase, fetchProfile]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSupabaseUser(null);
    setStatus('unauthenticated');
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{
      user,
      supabaseUser,
      status,
      signOut: handleSignOut,
      refreshProfile: fetchProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

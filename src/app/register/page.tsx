'use client';

import React, { Suspense } from 'react';
import RegisterForm from '@/components/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4 py-12 relative overflow-hidden font-sans">
      {/* Background Decorative Blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-500/15 blur-[120px] pointer-events-none" />

      <Suspense fallback={
        <div className="max-w-md w-full space-y-8 z-10 flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full border-4 border-t-indigo-500 border-r-cyan-400 border-b-indigo-500 border-l-cyan-400 animate-spin mb-4" />
          <p className="text-slate-400 text-sm font-medium">Memuat Halaman Daftar...</p>
        </div>
      }>
        <RegisterForm />
      </Suspense>
    </div>
  );
}

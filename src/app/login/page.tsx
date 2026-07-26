'use client';

import React, { Suspense } from 'react';
import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F8FC] px-4 py-12 relative overflow-hidden font-sans">
      <Suspense fallback={
        <div className="max-w-md w-full space-y-8 z-10 flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full border-4 border-t-indigo-600 border-r-teal-500 border-b-indigo-600 border-l-teal-500 animate-spin mb-4" />
          <p className="text-gray-500 text-sm font-medium">Memuat Halaman Masuk...</p>
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
}

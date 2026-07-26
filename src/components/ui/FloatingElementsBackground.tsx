'use client';

import React from 'react';

export default function FloatingElementsBackground() {
  const spheres = [
    // ── Large Ambient Glowing Orbs ──
    { size: 'w-[450px] h-[450px]', pos: 'top-[-5%] left-[10%]', color: 'bg-indigo-400/15 blur-[120px]', anim: 'animate-drift-1', delay: '0s' },
    { size: 'w-[500px] h-[500px]', pos: 'top-[25%] right-[-5%]', color: 'bg-teal-400/15 blur-[130px]', anim: 'animate-drift-2', delay: '-4s' },
    { size: 'w-[400px] h-[400px]', pos: 'bottom-[10%] left-[-5%]', color: 'bg-purple-400/15 blur-[110px]', anim: 'animate-drift-3', delay: '-8s' },
    { size: 'w-[380px] h-[380px]', pos: 'bottom-[-5%] right-[20%]', color: 'bg-cyan-400/12 blur-[100px]', anim: 'animate-drift-4', delay: '-3s' },

    // ── Medium Floating Spheres ──
    { size: 'w-24 h-24', pos: 'top-[12%] left-[5%]', color: 'bg-gradient-to-tr from-indigo-500/20 to-purple-500/30 blur-md border border-indigo-300/30', anim: 'animate-drift-2', delay: '-2s' },
    { size: 'w-32 h-32', pos: 'top-[18%] right-[12%]', color: 'bg-gradient-to-br from-teal-400/25 to-emerald-500/20 blur-md border border-teal-200/40', anim: 'animate-drift-4', delay: '-6s' },
    { size: 'w-20 h-20', pos: 'top-[45%] left-[8%]', color: 'bg-gradient-to-r from-purple-400/25 to-pink-400/20 blur-sm border border-purple-300/30', anim: 'animate-drift-1', delay: '-10s' },
    { size: 'w-28 h-28', pos: 'top-[52%] right-[8%]', color: 'bg-gradient-to-tr from-cyan-400/25 to-blue-500/20 blur-md border border-cyan-200/40', anim: 'animate-drift-3', delay: '-5s' },
    { size: 'w-36 h-36', pos: 'bottom-[25%] left-[18%]', color: 'bg-gradient-to-bl from-indigo-400/20 to-teal-400/25 blur-lg border border-indigo-200/30', anim: 'animate-drift-2', delay: '-1s' },
    { size: 'w-16 h-16', pos: 'bottom-[15%] right-[15%]', color: 'bg-gradient-to-tr from-amber-400/25 to-rose-400/20 blur-xs border border-amber-200/40', anim: 'animate-drift-4', delay: '-7s' },

    // ── Small Floating Vibrant Spheres ──
    { size: 'w-8 h-8', pos: 'top-[8%] left-[30%]', color: 'bg-indigo-500/30 border border-indigo-400/50 shadow-sm', anim: 'animate-drift-3', delay: '-3s' },
    { size: 'w-12 h-12', pos: 'top-[15%] left-[45%]', color: 'bg-teal-400/35 border border-teal-300/60 shadow-sm', anim: 'animate-drift-1', delay: '-9s' },
    { size: 'w-6 h-6', pos: 'top-[22%] right-[32%]', color: 'bg-purple-500/40 border border-purple-300/60', anim: 'animate-drift-4', delay: '-1s' },
    { size: 'w-10 h-10', pos: 'top-[38%] left-[22%]', color: 'bg-cyan-400/35 border border-cyan-300/50 shadow-xs', anim: 'animate-drift-2', delay: '-11s' },
    { size: 'w-7 h-7', pos: 'top-[42%] right-[25%]', color: 'bg-emerald-400/40 border border-emerald-300/60', anim: 'animate-drift-3', delay: '-4s' },
    { size: 'w-14 h-14', pos: 'top-[60%] left-[35%]', color: 'bg-indigo-400/25 border border-indigo-300/40 shadow-sm', anim: 'animate-drift-1', delay: '-7s' },
    { size: 'w-5 h-5', pos: 'top-[68%] right-[38%]', color: 'bg-rose-400/40 border border-rose-300/60', anim: 'animate-drift-4', delay: '-12s' },
    { size: 'w-9 h-9', pos: 'bottom-[35%] left-[40%]', color: 'bg-teal-500/35 border border-teal-300/50', anim: 'animate-drift-2', delay: '-5s' },
    { size: 'w-11 h-11', pos: 'bottom-[20%] right-[30%]', color: 'bg-purple-400/35 border border-purple-300/50 shadow-xs', anim: 'animate-drift-3', delay: '-2s' },
    { size: 'w-6 h-6', pos: 'bottom-[8%] left-[28%]', color: 'bg-indigo-500/40 border border-indigo-300/60', anim: 'animate-drift-1', delay: '-8s' },
    { size: 'w-10 h-10', pos: 'bottom-[12%] right-[5%]', color: 'bg-emerald-400/35 border border-emerald-300/50', anim: 'animate-drift-4', delay: '-6s' },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* Subtle Grid Dot Matrix */}
      <div className="absolute inset-0 bg-[radial-gradient(#CBD5E1_1px,transparent_1px)] [background-size:32px_32px] opacity-35" />

      {/* Render Random Sized Drifting Spheres */}
      {spheres.map((s, idx) => (
        <div
          key={idx}
          className={`absolute rounded-full ${s.size} ${s.pos} ${s.color} ${s.anim} will-change-transform`}
          style={{ animationDelay: s.delay }}
        />
      ))}
    </div>
  );
}

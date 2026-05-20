"use client";

import React from 'react';
import { Search, User as UserIcon } from 'lucide-react';
import { NotificationBell } from './NotificationBell';
import { Logo } from '@/shared/components/Logo';

export const Header: React.FC = () => {
  return (
    <header className="h-20 bg-[#050010]/80 backdrop-blur-md border-b border-[#a855f7]/20 sticky top-0 z-30 px-8 flex items-center justify-between">
      <div className="flex items-center gap-4 bg-[#110121]/50 px-4 py-2 rounded-xl border border-[#a855f7]/20 w-96 group focus-within:bg-[#110121] focus-within:border-[#a855f7]/50 transition-all">
        <Search className="w-4 h-4 text-slate-400 group-focus-within:text-[#a855f7]" />
        <input 
          type="text" 
          placeholder="Buscar órdenes, equipos o personal..." 
          className="bg-transparent border-none outline-none text-sm text-slate-200 w-full placeholder:text-slate-500"
        />
      </div>

      <div className="flex items-center gap-6">
        <NotificationBell />
        
        <div className="flex items-center gap-3 pl-6 border-l border-[#a855f7]/20">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-200 uppercase tracking-widest" style={{ fontFamily: 'var(--font-oswald)' }}>MEDTRACK</p>
            <p className="text-[10px] font-bold text-[#a855f7] uppercase tracking-tighter">Hospital Central</p>
          </div>
          <div className="relative">
            <Logo size={40} className="scale-90" />
          </div>
        </div>
      </div>
    </header>
  );
};

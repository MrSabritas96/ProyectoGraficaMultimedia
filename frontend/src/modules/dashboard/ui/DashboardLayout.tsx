"use client";

import React from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';

interface Props {
  children: React.ReactNode;
  role: string;
}

export const DashboardLayout: React.FC<Props> = ({ children, role }) => {
  return (
    <div className="flex h-screen bg-[#020005] overflow-hidden text-slate-200">
      <Sidebar role={role} />
      
      <main className="flex-1 flex flex-col min-w-0 relative">
        {/* Subtle background decoration - dark mode version */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:32px_32px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 -z-10" />
        
        <Header />
        
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto animate-fade-in">
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </div>
        </div>
      </main>
    </div>
  );
};

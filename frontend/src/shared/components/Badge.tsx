"use client";

import React from 'react';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'default';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  pulse?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', pulse = false, className = '' }) => {
  const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest";
  
  const variantClasses = {
    success: "bg-emerald-100 text-emerald-800 border border-emerald-200",
    warning: "bg-amber-100 text-amber-800 border border-amber-200",
    error: "bg-rose-100 text-rose-800 border border-rose-200",
    info: "bg-indigo-100 text-indigo-800 border border-indigo-200",
    default: "bg-slate-100 text-slate-800 border border-slate-200",
  };

  const pulseClasses = {
    success: "shadow-[0_0_10px_rgba(16,185,129,0.4)]",
    warning: "shadow-[0_0_10px_rgba(245,158,11,0.4)]",
    error: "shadow-[0_0_10px_rgba(244,63,94,0.4)]",
    info: "shadow-[0_0_10px_rgba(99,102,241,0.4)]",
    default: "shadow-[0_0_10px_rgba(148,163,184,0.4)]",
  };

  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${pulse ? `animate-pulse ${pulseClasses[variant]}` : ''} ${className}`}>
      {pulse && (
        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
          variant === 'success' ? 'bg-emerald-500' :
          variant === 'warning' ? 'bg-amber-500' :
          variant === 'error' ? 'bg-rose-500' :
          variant === 'info' ? 'bg-indigo-500' :
          'bg-slate-500'
        }`} />
      )}
      {children}
    </span>
  );
};

"use client";

import React from 'react';

interface Props {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  headerAction?: React.ReactNode;
  onClick?: () => void;
}

export const Card: React.FC<Props> = ({ children, title, subtitle, className = '', headerAction, onClick }) => {
  return (
    <div onClick={onClick} className={`rounded-2xl shadow-sm overflow-hidden ${className || 'bg-[#050010] border border-[#a855f7]/20 shadow-[0_0_20px_rgba(126,34,206,0.1)]'}`}>
      {(title || headerAction) && (
        <div className="px-6 py-4 border-b border-[#a855f7]/20 flex items-center justify-between">
          <div>
            {title && <h3 className="font-bold text-white">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

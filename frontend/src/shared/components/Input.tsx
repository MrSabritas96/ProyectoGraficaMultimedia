"use client";

import React from 'react';

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
  variant?: 'light' | 'dark' | 'minimal';
}

export const Input: React.FC<Props> = ({ label, error, icon, rightElement, className = '', variant = 'light', ...props }) => {
  const { placeholder, ...restProps } = props;
  const isDark = variant === 'dark';
  const isMinimal = variant === 'minimal';
  
  // Use placeholder as floating label for minimal variant if label isn't explicitly provided
  const floatingLabel = isMinimal ? (label || placeholder) : null;
  
  return (
    <div className="space-y-1.5 w-full">
      {label && !isMinimal && (
        <label className={`text-sm font-bold ml-1 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
          {label}
        </label>
      )}
      <div className="relative group w-full">
        {icon && (
          <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors z-10 ${isMinimal ? 'text-slate-400 group-focus-within:text-[#8b5cf6]' : isDark ? 'text-slate-400 group-focus-within:text-cyan-400' : 'text-slate-400 group-focus-within:text-indigo-500'}`}>
            {icon}
          </div>
        )}
        <input 
          className={`
            peer w-full transition-all duration-300 outline-none relative z-10 bg-transparent
            ${isMinimal 
              ? 'border-0 border-b-[1px] border-slate-600/50 rounded-none px-0 py-3 text-slate-300 focus:border-[#8b5cf6] focus:ring-0 text-lg font-light' 
              : isDark 
                ? 'bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:bg-slate-800/80 focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/10' 
                : 'bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5'
            }
            ${icon && !isMinimal ? 'pl-11' : ''}
            ${icon && isMinimal ? 'pl-8' : ''}
            ${error ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/5' : ''}
            ${className}
          `}
          placeholder={isMinimal ? " " : placeholder}
          {...restProps}
        />
        
        {/* Floating Label for Minimal Variant */}
        {isMinimal && floatingLabel && (
          <label className="absolute left-0 top-3 text-slate-500 text-sm pointer-events-none transition-all duration-300 origin-left z-0
            peer-focus:-translate-y-6 peer-focus:scale-[0.8] peer-focus:text-[#8b5cf6]
            group-hover:-translate-y-6 group-hover:scale-[0.8] group-hover:text-[#8b5cf6]
            peer-[:not(:placeholder-shown)]:-translate-y-6 peer-[:not(:placeholder-shown)]:scale-[0.8] peer-[:not(:placeholder-shown)]:text-slate-400
          ">
            {floatingLabel}
          </label>
        )}

        {rightElement && (
          <div className="absolute right-0 top-1/2 -translate-y-1/2 z-20">
            {rightElement}
          </div>
        )}
      </div>
      {error && (
        <p className="text-xs text-red-500 font-medium ml-1 animate-in fade-in slide-in-from-top-1">
          {error}
        </p>
      )}
    </div>
  );
};


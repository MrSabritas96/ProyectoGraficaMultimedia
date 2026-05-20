"use client";

import React from 'react';
import { Loader2 } from 'lucide-react';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
}

export const Button: React.FC<Props> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  isLoading, 
  leftIcon,
  className = '',
  disabled,
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]";
  
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200",
    secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200",
    outline: "bg-transparent border-2 border-slate-200 text-slate-600 hover:border-indigo-500 hover:text-indigo-600",
    danger: "bg-red-50 text-red-600 hover:bg-red-600 hover:text-white",
    success: "bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-8 py-4 text-base"
  };

  return (
    <button 
      className={`\${baseStyles} \${variants[variant]} \${sizes[size]} \${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin mr-2" />
      ) : leftIcon && (
        <span className="mr-2">{leftIcon}</span>
      )}
      {children}
    </button>
  );
};

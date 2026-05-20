"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  progress: number; // 0 to 100
  label?: string;
  showValue?: boolean;
  colorClass?: string; // e.g., 'bg-indigo-500'
  heightClass?: string; // e.g., 'h-2'
  animated?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  label,
  showValue = false,
  colorClass = 'bg-indigo-500',
  heightClass = 'h-2',
  animated = true,
}) => {
  // Ensure progress is within 0-100
  const normalizedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1">
          {label && <span className="text-sm font-bold text-slate-700">{label}</span>}
          {showValue && <span className="text-xs font-bold text-slate-500">{normalizedProgress}%</span>}
        </div>
      )}
      <div className={`w-full bg-slate-200 rounded-full overflow-hidden ${heightClass}`}>
        <motion.div
          className={`${colorClass} h-full rounded-full ${animated ? 'relative overflow-hidden' : ''}`}
          initial={{ width: 0 }}
          animate={{ width: `${normalizedProgress}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          {animated && (
            <div className="absolute top-0 left-0 w-full h-full bg-white/20 animate-border-sweep" style={{ backgroundSize: '200% 100%', backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)' }} />
          )}
        </motion.div>
      </div>
    </div>
  );
};

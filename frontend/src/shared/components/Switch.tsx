"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}

export const Switch: React.FC<SwitchProps> = ({ checked, onChange, label }) => {
  return (
    <div 
      className="flex items-center gap-3 cursor-pointer group"
      onClick={() => onChange(!checked)}
    >
      <div 
        className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${
          checked ? 'bg-indigo-500' : 'bg-slate-300'
        }`}
      >
        <motion.div 
          className="bg-white w-4 h-4 rounded-full shadow-md"
          layout
          transition={{ type: "spring", stiffness: 700, damping: 30 }}
          style={{ x: checked ? 24 : 0 }}
        />
      </div>
      {label && (
        <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">
          {label}
        </span>
      )}
    </div>
  );
};

"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  id?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({ checked, onChange, label, id }) => {
  return (
    <div 
      className="flex items-center gap-3 cursor-pointer group"
      onClick={() => onChange(!checked)}
    >
      <div 
        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${
          checked 
            ? 'bg-indigo-500 border-indigo-500 shadow-md shadow-indigo-200' 
            : 'bg-white border-slate-300 group-hover:border-indigo-400'
        }`}
      >
        <motion.div
          initial={false}
          animate={{ scale: checked ? 1 : 0, opacity: checked ? 1 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        >
          <Check className="w-4 h-4 text-white" strokeWidth={3} />
        </motion.div>
      </div>
      {label && (
        <span className={`text-sm font-bold transition-colors ${checked ? 'text-slate-800' : 'text-slate-500 group-hover:text-slate-700'}`}>
          {label}
        </span>
      )}
    </div>
  );
};

"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface LogoProps {
  className?: string;
  size?: number; // base size for scaling, e.g., 60
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 60 }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      {/* Spinning Gear */}
      <motion.svg 
        viewBox="0 0 300 300" 
        className="absolute w-full h-full"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
      >
        <circle cx="150" cy="150" r="130" fill="none" stroke="url(#loader-silver-gradient)" strokeWidth="1" opacity="0.5" />
        <circle cx="150" cy="150" r="115" fill="none" stroke="url(#loader-silver-gradient)" strokeWidth="15" strokeDasharray="4 4" opacity="0.9" />
        <circle cx="150" cy="150" r="105" fill="none" stroke="url(#loader-silver-gradient)" strokeWidth="2" opacity="0.8" />
      </motion.svg>

      {/* HC Logo */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <svg viewBox="0 0 400 300" className="w-[75%] h-auto z-10 relative">
          <text x="40%" y="52%" textAnchor="middle" dominantBaseline="middle" className="logo-text" style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontWeight: 'bold', fontSize: '160px', textShadow: '0 0 5px rgba(255,255,255,0.4)' }} fill="#ffffff">H</text>
          <text x="62%" y="67%" textAnchor="middle" dominantBaseline="middle" className="logo-text" style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontWeight: 'bold', fontSize: '180px', textShadow: '0 0 5px rgba(255,255,255,0.4)' }} fill="#ffffff">C</text>
        </svg>
      </div>

      {/* SVG Defs (if not present globally, though we have them in login, better safe to add locally for the shared component) */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="loader-silver-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#94a3b8" />
          </linearGradient>
          <linearGradient id="loader-purple-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7e22ce" />
            <stop offset="50%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#4c1d95" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

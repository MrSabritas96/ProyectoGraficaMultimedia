import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

export const Preloader = ({ onFinish }: { onFinish: () => void }) => {
  useEffect(() => {
    // Extended the total animation slightly to accommodate the two-step sequence.
    const timer = setTimeout(() => {
      onFinish();
    }, 5500);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#020005]"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
    >
      {/* SVG Definitions for Gradients */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="loader-purple-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7e22ce" />
            <stop offset="50%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#4c1d95" />
          </linearGradient>
          <linearGradient id="loader-silver-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#94a3b8" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
      </svg>

      {/* Main Container for Logo and Text */}
      <div className="relative flex flex-col items-center justify-center w-full h-[400px]">
        
        {/* HC Logo and Gear Animation Container */}
        <motion.div 
          className="absolute top-0 flex flex-col items-center justify-center w-full h-full"
          initial={{ opacity: 0, scale: 0.8, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: -20 }}
          transition={{ delay: 2.2, duration: 1, ease: "easeOut" }}
        >
          <motion.div layoutId="hero-logo-gear" className="relative flex items-center justify-center w-[240px] h-[240px] md:w-[280px] md:h-[280px]">
            {/* Spinning Gear */}
            <motion.svg 
              viewBox="0 0 300 300" 
              className="absolute w-full h-full"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
            >
              {/* Purple Gear (Base) */}
              <motion.g
                initial={{ opacity: 1 }}
                animate={{ opacity: 0 }}
                transition={{ delay: 4.0, duration: 1 }}
              >
                <circle cx="150" cy="150" r="130" fill="none" stroke="url(#loader-purple-gradient)" strokeWidth="1" opacity="0.3" />
                <circle cx="150" cy="150" r="115" fill="none" stroke="url(#loader-purple-gradient)" strokeWidth="15" strokeDasharray="4 4" pathLength="100" opacity="0.7" />
                <circle cx="150" cy="150" r="105" fill="none" stroke="url(#loader-purple-gradient)" strokeWidth="2" opacity="0.5" />
              </motion.g>

              {/* Silver Gear (Overlay for color sync transition) */}
              <motion.g
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 4.0, duration: 1 }}
              >
                <circle cx="150" cy="150" r="130" fill="none" stroke="url(#loader-silver-gradient)" strokeWidth="1" opacity="0.5" />
                <circle cx="150" cy="150" r="115" fill="none" stroke="url(#loader-silver-gradient)" strokeWidth="15" strokeDasharray="4 4" pathLength="100" opacity="0.9" filter="url(#glow)" />
                <circle cx="150" cy="150" r="105" fill="none" stroke="url(#loader-silver-gradient)" strokeWidth="2" opacity="0.8" />
              </motion.g>
            </motion.svg>
          </motion.div>

          <motion.div layoutId="hero-logo-hc" className="absolute flex items-center justify-center w-[180px] md:w-[220px] h-auto z-10 pointer-events-none">
            {/* HC Logo */}
            <svg viewBox="0 0 400 300" className="w-full h-auto">
              {/* The H */}
              <text x="40%" y="52%" textAnchor="middle" dominantBaseline="middle" className="logo-text" style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontWeight: 'bold', fontSize: '160px', textShadow: '0 0 15px rgba(255,255,255,0.6)' }} fill="#ffffff">H</text>
              {/* The C */}
              <text x="62%" y="67%" textAnchor="middle" dominantBaseline="middle" className="logo-text" style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontWeight: 'bold', fontSize: '180px', textShadow: '0 0 15px rgba(255,255,255,0.6)' }} fill="#ffffff">C</text>
            </svg>
          </motion.div>
        </motion.div>

        <motion.div
          layoutId="hero-logo-text"
          className="absolute flex items-center justify-center w-full h-full"
          initial={{ y: 0, scale: 1 }}
          animate={{ y: 175, scale: 0.32 }}
          transition={{ delay: 2.2, duration: 1.2, ease: "easeInOut" }}
        >
          <svg viewBox="0 0 800 200" className="w-full max-w-[80vw] h-auto">
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="loader-text text-6xl md:text-8xl tracking-[0.2em] font-light"
              style={{ fontFamily: "'Outfit', system-ui, sans-serif" }}
              filter="url(#glow)"
              strokeLinejoin="round"
              strokeLinecap="round"
            >
              MEDTRACK
            </text>
          </svg>
        </motion.div>
      </div>

      {/* ECG Loading Bar */}
      <div className="w-[300px] md:w-[400px] h-[100px] mt-2 relative flex items-center justify-center">
        {/* Purple ECG Line */}
        <motion.svg 
          viewBox="0 0 400 100" 
          className="absolute w-full h-full overflow-visible"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ delay: 4.0, duration: 1 }}
        >
          <path
            d="M 0 50 L 160 50 L 165 35 L 170 50 L 180 50 L 185 75 L 195 10 L 205 95 L 215 50 L 225 50 L 235 35 L 245 50 L 400 50"
            fill="none"
            stroke="url(#loader-purple-gradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength="100"
            strokeDasharray="100"
            strokeDashoffset="100"
            style={{ filter: 'drop-shadow(0 0 8px #7e22ce)' }}
          >
            <animate attributeName="stroke-dashoffset" values="100; 67.8; 30.5; 0" keyTimes="0; 0.4; 0.55; 1" dur="4.5s" begin="0.5s" fill="freeze" calcMode="linear" />
          </path>
          
          {/* Leading Circle */}
          <g>
            <circle r="4.5" fill="#d8b4fe" style={{ filter: 'drop-shadow(0 0 8px #7e22ce)' }} />
            <circle r="9" fill="none" stroke="#a855f7" strokeWidth="2" opacity="0.8" />
            <animateMotion 
              path="M 0 50 L 160 50 L 165 35 L 170 50 L 180 50 L 185 75 L 195 10 L 205 95 L 215 50 L 225 50 L 235 35 L 245 50 L 400 50"
              dur="4.5s" begin="0.5s" fill="freeze" calcMode="linear" 
              keyTimes="0; 0.4; 0.55; 1" keyPoints="0; 0.322; 0.695; 1"
            />
          </g>
        </motion.svg>

        {/* Silver ECG Line (Crossfade) */}
        <motion.svg 
          viewBox="0 0 400 100" 
          className="absolute w-full h-full overflow-visible"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 4.0, duration: 1 }}
        >
          <path
            d="M 0 50 L 160 50 L 165 35 L 170 50 L 180 50 L 185 75 L 195 10 L 205 95 L 215 50 L 225 50 L 235 35 L 245 50 L 400 50"
            fill="none"
            stroke="url(#loader-silver-gradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength="100"
            strokeDasharray="100"
            strokeDashoffset="100"
            style={{ filter: 'drop-shadow(0 0 10px #ffffff)' }}
          >
            <animate attributeName="stroke-dashoffset" values="100; 67.8; 30.5; 0" keyTimes="0; 0.4; 0.55; 1" dur="4.5s" begin="0.5s" fill="freeze" calcMode="linear" />
          </path>

          {/* Leading Circle */}
          <g>
            <circle r="4.5" fill="#ffffff" style={{ filter: 'drop-shadow(0 0 10px #ffffff)' }} />
            <circle r="9" fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.8" />
            <animateMotion 
              path="M 0 50 L 160 50 L 165 35 L 170 50 L 180 50 L 185 75 L 195 10 L 205 95 L 215 50 L 225 50 L 235 35 L 245 50 L 400 50"
              dur="4.5s" begin="0.5s" fill="freeze" calcMode="linear" 
              keyTimes="0; 0.4; 0.55; 1" keyPoints="0; 0.322; 0.695; 1"
            />
          </g>
        </motion.svg>
      </div>
    </motion.div>
  );
};

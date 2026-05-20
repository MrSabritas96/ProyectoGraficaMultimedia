"use client";

import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export const CustomCursor = () => {
  const [isVisible, setIsVisible] = useState(false);
  
  // Exact position (no delay) for the rhombus
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // Springs for circles with different delays
  const springConfig1 = { damping: 25, stiffness: 400, mass: 0.5 };
  const springConfig2 = { damping: 30, stiffness: 200, mass: 0.8 }; // more delay
  
  const cursorXSpring1 = useSpring(cursorX, springConfig1);
  const cursorYSpring1 = useSpring(cursorY, springConfig1);
  
  const cursorXSpring2 = useSpring(cursorX, springConfig2);
  const cursorYSpring2 = useSpring(cursorY, springConfig2);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };
    
    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => setIsVisible(false);

    window.addEventListener('mousemove', moveCursor);
    document.body.addEventListener('mouseenter', handleMouseEnter);
    document.body.addEventListener('mouseleave', handleMouseLeave);
    
    setIsVisible(true);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      document.body.removeEventListener('mouseenter', handleMouseEnter);
      document.body.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [cursorX, cursorY]);

  if (!isVisible) return null;

  // Bright metallic icy purple to match the theme
  const cursorColor = '#d8b4fe';

  return (
    <div className="pointer-events-none fixed inset-0 z-[999999] overflow-hidden">
      {/* Outer Thin Circle (most delayed) */}
      <motion.div
        className="absolute top-0 left-0 w-16 h-16 rounded-full border-[1px]"
        style={{
          x: cursorXSpring2,
          y: cursorYSpring2,
          translateX: '-50%',
          translateY: '-50%',
          borderColor: cursorColor,
          opacity: 0.6,
        }}
      />
      
      {/* Inner Thicker Circle (delayed) */}
      <motion.div
        className="absolute top-0 left-0 w-[3.25rem] h-[3.25rem] rounded-full border-2"
        style={{
          x: cursorXSpring1,
          y: cursorYSpring1,
          translateX: '-50%',
          translateY: '-50%',
          borderColor: cursorColor,
          opacity: 0.8,
        }}
      />

      {/* Center Rhombus (immediate) */}
      <motion.div
        className="absolute top-0 left-0 w-2 h-2"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: '-50%',
          translateY: '-50%',
        }}
      >
        <div 
          className="w-full h-full rotate-45 shadow-[0_0_8px_rgba(216,180,254,0.6)]"
          style={{ backgroundColor: cursorColor }}
        />
      </motion.div>
    </div>
  );
};

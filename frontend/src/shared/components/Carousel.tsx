"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface CarouselItem {
  id: string | number;
  image: string;
  title: string;
  description: string;
  status?: 'Ok' | 'Warning' | 'Critical';
}

interface CarouselProps {
  items: CarouselItem[];
  autoPlayInterval?: number;
}

export const Carousel: React.FC<CarouselProps> = ({ items, autoPlayInterval = 5000 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered || items.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [currentIndex, isHovered, items.length, autoPlayInterval]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
  };

  if (!items || items.length === 0) return null;

  return (
    <div 
      className="relative w-full h-[300px] rounded-2xl overflow-hidden glass shadow-xl group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="absolute inset-0 w-full h-full"
        >
          {/* Background Image with Overlay */}
          <div 
            className="absolute inset-0 w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${items[currentIndex].image})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" />

          {/* Content */}
          <div className="absolute bottom-0 left-0 w-full p-6 text-white">
            {items[currentIndex].status && (
              <span className={`inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full mb-3 shadow-lg ${
                items[currentIndex].status === 'Ok' ? 'bg-emerald-500/80 text-white' :
                items[currentIndex].status === 'Warning' ? 'bg-amber-500/80 text-white' :
                'bg-rose-500/80 text-white animate-pulse'
              }`}>
                {items[currentIndex].status}
              </span>
            )}
            <motion.h3 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-bold mb-2"
            >
              {items[currentIndex].title}
            </motion.h3>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-slate-200 text-sm max-w-2xl"
            >
              {items[currentIndex].description}
            </motion.p>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Controls */}
      {items.length > 1 && (
        <>
          <button 
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/30 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button 
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/30 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Indicators */}
          <div className="absolute bottom-6 right-6 flex gap-2">
            {items.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  idx === currentIndex ? 'w-6 bg-indigo-500' : 'bg-white/50 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

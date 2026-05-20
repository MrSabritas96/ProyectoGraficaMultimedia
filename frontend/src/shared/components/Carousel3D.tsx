"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Badge } from './Badge';
import { Settings, ChevronLeft, ChevronRight } from 'lucide-react';

export interface Carousel3DItem {
  id: string | number;
  image: string;
  title: string;
  description: string;
  status?: 'Active' | 'Inactive' | 'Warning' | 'Critical';
  [key: string]: any;
}

interface Carousel3DProps {
  items: Carousel3DItem[];
  onViewEquipment: (item: Carousel3DItem) => void;
  autoPlayInterval?: number;
}

export const Carousel3D: React.FC<Carousel3DProps> = ({ items, onViewEquipment, autoPlayInterval = 5000 }) => {
  const [rotation, setRotation] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [hoveredItemId, setHoveredItemId] = useState<string | number | null>(null);

  useEffect(() => {
    setRotation(0);
  }, [items]);

  const angle = 360 / items.length;
  // Calculate translateZ to form a perfect circle based on card width (approx 320px)
  const tz = Math.round((320 / 2) / Math.tan(Math.PI / items.length)) + 50; 

  useEffect(() => {
    if (isHovered || items.length <= 1) return;

    const timer = setInterval(() => {
      setRotation(prev => prev - angle);
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [isHovered, items.length, autoPlayInterval, angle]);

  const handlePrev = () => setRotation(prev => prev + angle);
  const handleNext = () => setRotation(prev => prev - angle);

  if (!items || items.length === 0) return null;

  return (
    <div 
      className="relative w-full h-[500px] flex items-center justify-center perspective-2000 overflow-visible group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Controls */}
      <button 
        onClick={handlePrev}
        className="absolute left-4 z-40 w-12 h-12 bg-[#110121]/80 hover:bg-[#a855f7]/30 border border-[#a855f7]/30 rounded-full flex items-center justify-center text-[#a855f7] hover:text-white transition-all backdrop-blur-md opacity-0 group-hover:opacity-100"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button 
        onClick={handleNext}
        className="absolute right-4 z-40 w-12 h-12 bg-[#110121]/80 hover:bg-[#a855f7]/30 border border-[#a855f7]/30 rounded-full flex items-center justify-center text-[#a855f7] hover:text-white transition-all backdrop-blur-md opacity-0 group-hover:opacity-100"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      <motion.div
        className="relative w-[320px] h-[400px] preserve-3d"
        animate={{ rotateY: rotation }}
        transition={{ type: "spring", stiffness: 50, damping: 20 }}
      >
        {items.map((item, index) => {
          const itemRotation = angle * index;
          const isItemHovered = hoveredItemId === item.id;
          
          return (
            <motion.div
              key={item.id}
              className="absolute top-0 left-0 w-full h-full preserve-3d"
              style={{ transform: `rotateY(${itemRotation}deg) translateZ(${tz}px)` }}
            >
              <motion.div 
                className={`w-full h-full rounded-2xl overflow-hidden shadow-2xl flex flex-col transition-all duration-500 ease-out border ${isItemHovered ? 'border-[#a855f7] shadow-[0_0_30px_rgba(168,85,247,0.5)] bg-[#110121]' : 'border-slate-800 bg-[#050010]'}`}
                onMouseEnter={() => setHoveredItemId(item.id)}
                onMouseLeave={() => setHoveredItemId(null)}
                animate={{ scale: isItemHovered ? 1.1 : 1 }}
              >
                {/* Image Section */}
                <div className="relative h-[55%] w-full bg-slate-900 overflow-hidden">
                  <div 
                    className={`absolute inset-0 bg-cover bg-center transition-transform duration-700 ${isItemHovered ? 'scale-110' : 'scale-100'}`}
                    style={{ backgroundImage: `url(${item.image})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050010] via-transparent to-transparent opacity-90" />
                  
                  {/* Status Bar */}
                  <div className="absolute top-4 left-4 z-10">
                    <Badge variant={
                      item.status === 'Active' ? 'success' :
                      item.status === 'Critical' ? 'error' :
                      item.status === 'Warning' ? 'warning' : 'default'
                    } pulse={item.status === 'Critical'}>
                      {item.status}
                    </Badge>
                  </div>
                  
                  {/* Falla Activa Badge (Notificación tipo WhatsApp) */}
                  {item.falla_activa && (
                    <div className="absolute top-4 right-4 z-20 flex items-center justify-center">
                      <div className="relative">
                        <div className="w-6 h-6 bg-rose-600 rounded-full flex items-center justify-center border-2 border-[#110121] shadow-[0_0_15px_rgba(225,29,72,0.8)] z-10 relative">
                          <span className="text-[10px] text-white font-bold">1</span>
                        </div>
                        <div className="absolute inset-0 bg-rose-500 rounded-full animate-ping opacity-75" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <div className="flex-1 p-5 flex flex-col relative z-10">
                  <h3 className="text-xl font-bold text-[#e9d5ff] mb-2 drop-shadow-md">{item.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 flex-1">{item.description}</p>
                  
                  <button 
                    onClick={() => onViewEquipment(item)}
                    className={`mt-4 w-full py-2.5 rounded-xl font-bold text-sm tracking-wider uppercase flex items-center justify-center gap-2 transition-all duration-300 ${
                      isItemHovered 
                        ? 'bg-gradient-to-r from-[#7e22ce] to-[#4c1d95] text-white shadow-[0_0_15px_rgba(126,34,206,0.6)] hover:brightness-125' 
                        : 'bg-[#110121] text-slate-300 border border-[#a855f7]/30'
                    }`}
                  >
                    <Settings className={`w-4 h-4 ${isItemHovered ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }} />
                    Ver Equipo
                  </button>
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};

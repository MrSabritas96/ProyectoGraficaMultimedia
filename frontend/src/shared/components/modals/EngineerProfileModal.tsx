"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User as UserIcon, Star, Clock, CheckCircle2, TrendingUp, Award } from 'lucide-react';
import { Badge } from '../Badge';
import { ProgressBar } from '../ProgressBar';
import { getEngineerByName } from '../../data/mockDatabase';

interface EngineerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  engineerName?: string;
}

export const EngineerProfileModal: React.FC<EngineerProfileModalProps> = ({ isOpen, onClose, engineerName }) => {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => setMounted(true), []);

  const engineer = engineerName ? getEngineerByName(engineerName) : null;

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#020005]/95 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="bg-[#050010] border border-[#a855f7]/30 rounded-3xl w-full max-w-2xl shadow-[0_0_50px_rgba(126,34,206,0.3)] overflow-hidden relative"
            onClick={e => e.stopPropagation()}
          >
            {/* Close Button */}
            <button onClick={onClose} className="absolute top-4 right-4 z-50 bg-[#110121]/80 hover:bg-rose-500/20 text-slate-400 hover:text-white p-2 rounded-full transition-all">
              <X className="w-5 h-5" />
            </button>

            {engineer ? (
              <>
                {/* Header Background */}
                <div className="h-32 bg-gradient-to-r from-[#312e81] to-[#7e22ce] relative overflow-hidden">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                </div>

                {/* Profile Info */}
                <div className="px-8 pb-8 relative">
                  <div className="flex justify-between items-end -mt-12 mb-6">
                    <div className="flex items-end gap-5">
                      <div className="relative">
                        <img src={engineer.photo || 'http://localhost:8000/media/profiles/default.png'} alt={engineer.name} className="w-24 h-24 rounded-2xl border-4 border-[#050010] shadow-xl bg-slate-800 object-cover" onError={(e: any) => { e.target.src = 'http://localhost:8000/media/profiles/default.png' }} />
                        <div className="absolute -bottom-2 -right-2 bg-[#050010] rounded-full p-1">
                          <div className={`w-4 h-4 rounded-full ${engineer.status === 'Available' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]' : engineer.status === 'Busy' ? 'bg-amber-500' : 'bg-slate-500'}`} />
                        </div>
                      </div>
                      <div className="pb-2">
                        <h2 className="text-2xl font-extrabold text-white tracking-tight" style={{ fontFamily: 'var(--font-oswald)' }}>{engineer.name}</h2>
                        <p className="text-[#a855f7] text-sm font-bold tracking-widest uppercase">{engineer.specialty}</p>
                      </div>
                    </div>
                    <Badge variant={engineer.status === 'Available' ? 'success' : 'warning'} className="mb-2">
                      {engineer.status === 'Available' ? 'Disponible' : 'Ocupado'}
                    </Badge>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-[#110121] border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                      <Wrench className="w-6 h-6 text-[#a855f7] mb-2" />
                      <p className="text-3xl font-bold text-white">{engineer.stats.reparations}</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Reparaciones</p>
                    </div>
                    <div className="bg-[#110121] border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center relative overflow-hidden">
                      <TrendingUp className="w-6 h-6 text-emerald-400 mb-2 relative z-10" />
                      <p className="text-3xl font-bold text-white relative z-10">{engineer.stats.efficiency}%</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1 relative z-10">Eficacia</p>
                      {/* Progress background */}
                      <div className="absolute bottom-0 left-0 w-full bg-emerald-500/10" style={{ height: `${engineer.stats.efficiency}%` }} />
                    </div>
                    <div className="bg-[#110121] border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                      <Clock className="w-6 h-6 text-amber-400 mb-2" />
                      <p className="text-2xl font-bold text-white">{engineer.stats.avgTime}</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Tiempo Promedio</p>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-slate-800 pb-2">
                      <Award className="w-4 h-4 text-amber-400" /> Rendimiento y Reconocimientos
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-end mb-2">
                          <span className="text-xs text-slate-400 uppercase tracking-widest font-bold">Satisfacción de Jefatura</span>
                          <span className="text-xs text-emerald-400 font-bold">Excelente</span>
                        </div>
                        <ProgressBar progress={95} colorClass="bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                      </div>
                      <div>
                        <div className="flex justify-between items-end mb-2">
                          <span className="text-xs text-slate-400 uppercase tracking-widest font-bold">Resolución en primer intento</span>
                          <span className="text-xs text-[#a855f7] font-bold">88%</span>
                        </div>
                        <ProgressBar progress={88} colorClass="bg-gradient-to-r from-[#7e22ce] to-[#a855f7] shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                      </div>
                    </div>
                  </div>

                </div>
              </>
            ) : (
              <div className="p-12 flex flex-col items-center justify-center text-slate-500">
                <UserIcon className="w-16 h-16 opacity-20 mb-4" />
                <p>No se encontraron datos del ingeniero.</p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

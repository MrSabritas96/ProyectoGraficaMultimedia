"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wrench, Calendar, MapPin, Save, AlertCircle } from 'lucide-react';
import { Input } from '../Input';
import { Badge } from '../Badge';

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: any) => void;
}

export const CreateOrderModal: React.FC<CreateOrderModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => setMounted(true), []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      if (onSubmit) onSubmit({});
      onClose();
    }, 1500);
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#020005]/90 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="bg-[#0a001a] border border-[#a855f7]/50 rounded-2xl w-full max-w-lg shadow-[0_0_40px_rgba(126,34,206,0.3)] overflow-hidden relative"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#110121] to-[#312e81]/30 p-6 border-b border-[#a855f7]/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-[#a855f7]/20 p-2 rounded-lg border border-[#a855f7]/50">
                  <Wrench className="w-5 h-5 text-[#d8b4fe]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white tracking-wide" style={{ fontFamily: 'var(--font-oswald)' }}>Generar Orden</h2>
                  <p className="text-xs text-slate-400 uppercase tracking-widest">Mantenimiento de Equipo</p>
                </div>
              </div>
              <button onClick={onClose} className="text-slate-400 hover:text-white hover:bg-rose-500/20 hover:border-rose-500/50 p-2 rounded-full transition-all border border-transparent">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Equipo Afectado</label>
                  <select className="w-full bg-[#110121] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:border-[#a855f7] outline-none transition-colors appearance-none cursor-pointer">
                    <option value="">Selecciona un equipo...</option>
                    <option value="1">Tomógrafo Axial Computarizado (TAC)</option>
                    <option value="2">Bomba de Infusión Continua</option>
                    <option value="3">Monitor de Signos Vitales</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Tipo de Mantenimiento</label>
                    <select className="w-full bg-[#110121] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:border-[#a855f7] outline-none transition-colors appearance-none cursor-pointer">
                      <option value="preventivo">Preventivo</option>
                      <option value="correctivo">Correctivo</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Prioridad</label>
                    <select className="w-full bg-[#110121] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:border-[#a855f7] outline-none transition-colors appearance-none cursor-pointer">
                      <option value="baja">Baja</option>
                      <option value="media">Media</option>
                      <option value="alta">Alta</option>
                      <option value="critica">Crítica</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Descripción del Problema / Tarea</label>
                  <textarea 
                    className="w-full bg-[#110121] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:border-[#a855f7] outline-none transition-colors min-h-[100px] resize-none"
                    placeholder="Detalla la situación actual del equipo..."
                    required
                  ></textarea>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-[#a855f7]/20">
                <button type="button" onClick={onClose} className="px-5 py-2 rounded-xl text-sm font-bold text-slate-300 hover:text-white transition-colors">
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="bg-[#a855f7] hover:bg-[#9333ea] text-white px-6 py-2 rounded-xl text-sm font-bold shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <Save className="w-4 h-4" />}
                  {loading ? 'Guardando...' : 'Crear Orden'}
                </button>
              </div>

            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

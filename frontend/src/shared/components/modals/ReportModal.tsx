"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, CheckCircle2, ShieldCheck, Printer, Calendar as CalendarIcon, Tag, PenTool, Wrench, Package, AlertTriangle, Search } from 'lucide-react';
import { Badge } from '../Badge';
import Cookies from 'js-cookie';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportId?: string | number; 
}

export const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, reportId }) => {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [event, setEvent] = useState<any>(null);
  
  useEffect(() => {
    setMounted(true);
    if (isOpen && reportId) {
      fetchReport();
    }
  }, [isOpen, reportId]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const token = Cookies.get('token');
      const res = await fetch('http://localhost:8000/api/work-orders/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      const order = data.find((o: any) => o.id.toString() === reportId?.toString());
      if (order) setEvent(order);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

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
            className="bg-[#050010] border border-slate-700 rounded-xl w-full max-w-4xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden relative flex flex-col max-h-[90vh]"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-[#110121] p-6 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="bg-[#a855f7]/10 p-2 rounded border border-[#a855f7]/30">
                  <FileText className="w-6 h-6 text-[#a855f7]" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-wide" style={{ fontFamily: 'var(--font-oswald)' }}>Reporte Técnico Histórico</h2>
                  <p className="text-xs text-slate-500 uppercase tracking-widest font-mono">DOC-REP-{event?.id || '0000'}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="text-[#a855f7] hover:text-[#d8b4fe] hover:bg-[#a855f7]/10 p-2 rounded transition-all">
                  <Printer className="w-5 h-5" />
                </button>
                <button onClick={onClose} className="text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 p-2 rounded transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="w-10 h-10 border-4 border-slate-800 border-t-[#a855f7] rounded-full animate-spin"></div>
                </div>
              ) : event ? (
                <div className="space-y-8 max-w-3xl mx-auto">
                  
                  {/* Status Banner */}
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 flex items-center gap-4 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                    <div>
                      <h4 className="text-emerald-400 font-bold uppercase tracking-wider text-sm">Mantenimiento Completado Exitosamente</h4>
                      <p className="text-xs text-emerald-500/70">Equipo operando bajo parámetros normales.</p>
                    </div>
                  </div>

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-[#110121] p-6 rounded-xl border border-slate-800 shadow-lg">
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1"><CalendarIcon className="w-3 h-3"/> Fecha Inicio</p>
                      <p className="text-sm font-bold text-slate-200">{event.fecha_inicio ? new Date(event.fecha_inicio).toLocaleDateString() : 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1"><CalendarIcon className="w-3 h-3"/> Fecha Fin</p>
                      <p className="text-sm font-bold text-slate-200">{event.fecha_fin ? new Date(event.fecha_fin).toLocaleDateString() : 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1"><Tag className="w-3 h-3"/> Tipo Mantenimiento</p>
                      <Badge variant={event.tipo_mantenimiento === 'Preventivo' ? 'info' : 'warning'}>{event.tipo_mantenimiento}</Badge>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1"><ShieldCheck className="w-3 h-3"/> Costo Total</p>
                      <p className="text-sm font-bold text-emerald-400">${event.costo_reparacion || '0.00'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-xs font-bold text-[#a855f7] uppercase tracking-widest mb-3 flex items-center gap-2 border-b border-[#a855f7]/20 pb-2">
                          <AlertTriangle className="w-4 h-4" /> Falla Reportada Inicialmente
                        </h4>
                        <p className="text-sm text-slate-300 leading-relaxed bg-[#110121]/50 p-4 rounded-xl border border-rose-500/20">
                          {event.descripcion}
                        </p>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-[#a855f7] uppercase tracking-widest mb-3 flex items-center gap-2 border-b border-[#a855f7]/20 pb-2">
                          <Search className="w-4 h-4" /> Problema Real Encontrado
                        </h4>
                        <p className="text-sm text-slate-300 leading-relaxed bg-[#110121]/50 p-4 rounded-xl border border-amber-500/20">
                          {event.problema_real_encontrado || 'No se registraron detalles técnicos del problema real.'}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h4 className="text-xs font-bold text-[#a855f7] uppercase tracking-widest mb-3 flex items-center gap-2 border-b border-[#a855f7]/20 pb-2">
                          <PenTool className="w-4 h-4" /> Acciones Realizadas
                        </h4>
                        <p className="text-sm text-slate-300 leading-relaxed bg-[#110121]/50 p-4 rounded-xl border border-emerald-500/20">
                          {event.acciones_realizadas || 'Limpieza y ajuste general.'}
                        </p>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-[#a855f7] uppercase tracking-widest mb-3 flex items-center gap-2 border-b border-[#a855f7]/20 pb-2">
                          <Wrench className="w-4 h-4" /> Recomendaciones
                        </h4>
                        <p className="text-sm text-slate-300 leading-relaxed bg-[#110121]/50 p-4 rounded-xl border border-blue-500/20">
                          {event.recomendaciones || 'Realizar mantenimiento preventivo según cronograma.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Repuestos Usados */}
                  {event.repuestos_usados && event.repuestos_usados.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold text-[#a855f7] uppercase tracking-widest mb-3 flex items-center gap-2 border-b border-[#a855f7]/20 pb-2">
                        <Package className="w-4 h-4" /> Repuestos y Materiales
                      </h4>
                      <div className="bg-[#110121] rounded-xl border border-slate-800 overflow-hidden">
                        <table className="w-full text-left text-sm text-slate-300">
                          <thead className="bg-[#050010] text-xs uppercase text-slate-500 border-b border-slate-800">
                            <tr>
                              <th className="px-4 py-3">Repuesto</th>
                              <th className="px-4 py-3 text-center">Cantidad</th>
                              <th className="px-4 py-3 text-right">Costo Unit.</th>
                              <th className="px-4 py-3 text-right">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {event.repuestos_usados.map((rep: any, idx: number) => (
                              <tr key={idx} className="border-b border-slate-800/50 hover:bg-slate-800/20">
                                <td className="px-4 py-3">{rep.nombre}</td>
                                <td className="px-4 py-3 text-center">{rep.cantidad}</td>
                                <td className="px-4 py-3 text-right">${rep.costo}</td>
                                <td className="px-4 py-3 text-right text-emerald-400">${(rep.cantidad * rep.costo).toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Signatures */}
                  <div className="flex justify-between items-end pt-12 mt-12 border-t border-slate-800">
                    <div className="text-center">
                      <div className="w-48 border-b border-slate-600 mb-2 pb-1">
                        <span className="text-sm text-white font-medium italic">{event.ingeniero_nombre}</span>
                      </div>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Ingeniero Responsable</p>
                      <p className="text-[10px] text-slate-500">{new Date(event.fecha_fin || event.fecha_creacion).toLocaleDateString()}</p>
                    </div>
                    <div className="text-center">
                      <div className="w-48 border-b border-slate-600 mb-2 pb-1"></div>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Aprobación Jefe Unidad</p>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500 flex-col gap-4">
                  <FileText className="w-12 h-12 opacity-20" />
                  <p>No se encontró el reporte.</p>
                </div>
              )}
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

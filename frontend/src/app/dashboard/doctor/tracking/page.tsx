
"use client";
import React, { useState, useEffect } from 'react';
import { ClipboardList, Clock, ShieldAlert, CheckCircle, Wrench, Activity } from 'lucide-react';
import { CalendarView } from '@/shared/components/CalendarView';
import Cookies from 'js-cookie';

export default function TrackingPage() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<any>(null);

  useEffect(() => {
    const fetchInc = async () => {
      const token = Cookies.get('token');
      const res = await fetch('http://localhost:8000/api/incidents/', { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) setIncidents(await res.json());
    };
    fetchInc();
  }, []);

  const activeIncidents = incidents.filter(i => i.estado !== 'Resuelto' && i.estado !== 'Rechazado');

  const getPriorityColor = (priority: string) => {
    if(priority === 'Critica') return 'text-rose-500 font-bold';
    if(priority === 'Alta') return 'text-orange-500';
    if(priority === 'Media') return 'text-amber-400';
    return 'text-emerald-400';
  };

  return (
    <div className="p-8 max-w-7xl mx-auto animate-fade-in">
      <h1 className="text-3xl font-bold text-white font-oswald flex items-center gap-3 mb-8">
        <ClipboardList className="text-blue-500" /> Seguimiento Kanban
      </h1>
      
      {activeIncidents.length === 0 ? (
        <div className="text-center py-12 border border-slate-800 rounded-2xl">
          <p className="text-slate-400">No hay incidentes activos en seguimiento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pendiente */}
          <div className="bg-[#050010]/50 border border-amber-500/20 rounded-2xl p-4">
            <h2 className="text-amber-400 font-bold mb-4 flex items-center gap-2"><Clock className="w-4 h-4"/> Pendiente Inspección</h2>
            {activeIncidents.filter(i => i.estado === 'Pendiente de Inspeccion').map(i => (
              <div key={i.id} className="bg-[#110121] border border-amber-500/30 p-4 rounded-xl mb-4">
                <p className="font-bold text-white text-sm">{i.equipo_nombre}</p>
                <p className="text-xs text-slate-400 mt-1">{i.problema_visible}</p>
                <div className="mt-3 text-[10px] uppercase tracking-widest text-slate-500 flex justify-between">
                  <span className={getPriorityColor(i.prioridad)}>{i.prioridad}</span>
                  <span>Ing: {i.ingeniero_asignado_nombre || 'Buscando...'}</span>
                </div>
              </div>
            ))}
          </div>
          {/* Inspeccionado */}
          <div className="bg-[#050010]/50 border border-blue-500/20 rounded-2xl p-4">
            <h2 className="text-blue-400 font-bold mb-4 flex items-center gap-2"><ShieldAlert className="w-4 h-4"/> Inspeccionado</h2>
            {activeIncidents.filter(i => i.estado === 'Inspeccionado').map(i => (
              <div key={i.id} className="bg-[#110121] border border-blue-500/30 p-4 rounded-xl mb-4">
                <p className="font-bold text-white text-sm">{i.equipo_nombre}</p>
                <p className="text-[10px] text-blue-300 mt-2 bg-blue-500/10 p-2 rounded">
                  Rep. Ing: {i.reporte_preliminar_ingeniero}
                </p>
              </div>
            ))}
          </div>
          {/* Orden Generada / En Progreso */}
          <div className="bg-[#050010]/50 border border-purple-500/20 rounded-2xl p-4">
            <h2 className="text-purple-400 font-bold mb-4 flex items-center gap-2"><CheckCircle className="w-4 h-4"/> En Mantenimiento</h2>
            {activeIncidents.filter(i => i.estado === 'Orden Generada' || i.estado === 'En Progreso').map(i => (
              <div key={i.id} className="bg-[#110121] border border-purple-500/30 p-4 rounded-xl mb-4 shadow-[0_0_15px_rgba(168,85,247,0.1)]">
                <p className="font-bold text-white text-sm">{i.equipo_nombre}</p>
                <p className="text-xs text-slate-400 mt-1 mb-3">
                  {i.estado === 'En Progreso' ? 'Reparación activa.' : 'En cola de mantenimiento.'}
                </p>
                <button 
                  onClick={() => setSelectedIncident(i)}
                  className="w-full mt-2 py-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 rounded-lg text-xs font-bold transition-all"
                >
                  Ver Detalles
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal de Detalles */}
      {selectedIncident && selectedIncident.orden_trabajo_info && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050010]/80 backdrop-blur-sm">
          <div className="bg-[#110121] border border-purple-500/30 p-6 rounded-2xl w-full max-w-md shadow-2xl relative">
            <h2 className="text-xl font-bold text-white mb-1">{selectedIncident.equipo_nombre}</h2>
            <p className="text-sm text-slate-400 mb-6">Detalles de la Orden de Trabajo</p>
            
            <div className="space-y-4">
              <div className="bg-[#0a001a] border border-purple-500/20 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Ingeniero a Cargo</p>
                  <p className="text-sm text-white font-bold">{selectedIncident.orden_trabajo_info.ingeniero}</p>
                </div>
                <Wrench className="w-5 h-5 text-purple-400" />
              </div>
              
              <div className="bg-[#0a001a] border border-purple-500/20 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Estado Actual</p>
                  <p className="text-sm text-emerald-400 font-bold">{selectedIncident.orden_trabajo_info.estado}</p>
                </div>
                <Activity className="w-5 h-5 text-emerald-400" />
              </div>

              <div className="bg-[#0a001a] border border-purple-500/20 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Duración Estimada</p>
                  <p className="text-sm text-amber-400 font-bold">{selectedIncident.orden_trabajo_info.tiempo_estimado || 'Por definir'}</p>
                </div>
                <Clock className="w-5 h-5 text-amber-400" />
              </div>
            </div>

            <button 
              onClick={() => setSelectedIncident(null)}
              className="mt-6 w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Trazabilidad Visual: Calendario */}
      <div className="mt-12 mb-8">
        <h3 className="text-xl font-bold text-white mb-6 tracking-widest uppercase flex items-center gap-3" style={{ fontFamily: 'var(--font-oswald)' }}>
          <Clock className="w-6 h-6 text-[#a855f7]" /> 
          Línea de Tiempo Estimada
        </h3>
        <CalendarView />
      </div>

    </div>
  );
}

"use client";
import React, { useState, useEffect } from 'react';
import { Bell, ShieldAlert, CheckCircle2, ChevronRight, Activity, Zap, History } from 'lucide-react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function AlertsPage() {
  const router = useRouter();
  const [incidents, setIncidents] = useState<any[]>([]);
  const [assignedIncidents, setAssignedIncidents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState<number | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'nuevas' | 'historial'>('nuevas');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const token = Cookies.get('token');
      
      const [resUnassigned, resAssigned] = await Promise.all([
        fetch('http://localhost:8000/api/incidents/unassigned/', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('http://localhost:8000/api/incidents/assigned/', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      
      if (resUnassigned.ok) setIncidents(await resUnassigned.json());
      if (resAssigned.ok) setAssignedIncidents(await resAssigned.json());
      
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async (id: number, equipo_id: number) => {
    setIsAccepting(id);
    try {
      const token = Cookies.get('token');
      const res = await fetch(`http://localhost:8000/api/incidents/${id}/accept/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        // Redirigir directamente al equipo
        router.push(`/dashboard/engineer/equipment/${equipo_id}`);
      } else {
        const error = await res.json();
        alert(error.error || "Error al aceptar el reporte.");
        setSelectedIncident(null);
        fetchData();
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión.");
    } finally {
      setIsAccepting(null);
    }
  };

  const getPriorityColor = (priority: string) => {
    if(priority === 'Critica') return 'text-rose-500 bg-rose-500/10 border-rose-500/30 shadow-[0_0_15px_rgba(225,29,72,0.3)]';
    if(priority === 'Alta') return 'text-orange-500 bg-orange-500/10 border-orange-500/30 shadow-[0_0_10px_rgba(249,115,22,0.2)]';
    if(priority === 'Media') return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
  };

  const displayList = activeTab === 'nuevas' ? incidents : assignedIncidents;

  return (
    <div className="p-8 max-w-7xl mx-auto relative min-h-screen">
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-[120px] -z-10 rounded-full" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-rose-500/5 blur-[120px] -z-10 rounded-full" />
      
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-6"
      >
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-400 font-oswald tracking-wide flex items-center gap-3">
            <Bell className="w-8 h-8 text-indigo-500" />
            Centro de Alertas Técnicas
          </h1>
          <p className="text-slate-400 mt-2 font-medium">Emergencias reportadas por los médicos que requieren inspección inmediata.</p>
          
          <div className="flex gap-4 mt-6">
            <button 
              onClick={() => setActiveTab('nuevas')}
              className={`pb-2 px-1 text-sm font-bold uppercase tracking-widest transition-colors ${activeTab === 'nuevas' ? 'text-white border-b-2 border-indigo-500' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Nuevas Alertas {incidents.length > 0 && <span className="ml-2 bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full">{incidents.length}</span>}
            </button>
            <button 
              onClick={() => setActiveTab('historial')}
              className={`pb-2 px-1 text-sm font-bold uppercase tracking-widest transition-colors ${activeTab === 'historial' ? 'text-white border-b-2 border-indigo-500' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <History className="w-4 h-4 inline-block mr-2" /> Historial (Mis Asignados)
            </button>
          </div>
        </div>
        
        <button onClick={fetchData} className="px-6 py-2.5 border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 rounded-xl hover:text-white hover:bg-indigo-500/30 hover:border-indigo-500/50 transition-all text-sm font-bold tracking-widest uppercase flex items-center gap-2">
          <Zap className="w-4 h-4" /> Actualizar Radar
        </button>
      </motion.header>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : displayList.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center h-64 bg-[#0a0118]/80 backdrop-blur-xl border border-indigo-500/20 rounded-3xl"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-500 blur-xl opacity-20 rounded-full" />
            <CheckCircle2 className="w-20 h-20 text-emerald-500 mb-6 relative z-10" />
          </div>
          <h2 className="text-2xl font-bold text-white font-oswald tracking-widest">
            {activeTab === 'nuevas' ? 'TODO EN ORDEN' : 'HISTORIAL LIMPIO'}
          </h2>
          <p className="text-slate-400 mt-2 font-medium">
            {activeTab === 'nuevas' ? 'No hay equipos en la unidad esperando asignación.' : 'No tienes incidentes asignados a ti.'}
          </p>
        </motion.div>
      ) : (
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {displayList.map((inc) => (
              <motion.div 
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
                exit={{ opacity: 0, scale: 0.9 }}
                key={inc.id} 
                onClick={() => activeTab === 'nuevas' ? setSelectedIncident(inc) : router.push(`/dashboard/engineer/equipment/${inc.equipo_id}`)}
                className={`cursor-pointer bg-[#0a0118]/80 backdrop-blur-md border rounded-2xl p-6 transition-all duration-300 ${getPriorityColor(inc.prioridad).split(' ').filter(c => c.startsWith('border') || c.startsWith('shadow')).join(' ')} hover:-translate-y-2 relative overflow-hidden group`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${getPriorityColor(inc.prioridad).split(' ').filter(c => !c.startsWith('border') && !c.startsWith('shadow')).join(' ')}`}>
                    {inc.prioridad}
                  </span>
                  <span className="text-xs font-mono text-slate-500 bg-slate-900 px-2 py-1 rounded-lg">#{inc.id}</span>
                </div>
                
                <h3 className="text-lg font-bold text-white mb-2 line-clamp-1 relative z-10">{inc.equipo_nombre}</h3>
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="w-4 h-4 text-slate-500" />
                  <p className="text-sm text-slate-400 line-clamp-1 flex-1 relative z-10">{inc.problema_visible}</p>
                </div>
                
                <div className="flex items-center justify-between mt-6 relative z-10">
                  <p className="text-xs text-slate-500 font-mono">
                    Hace {Math.floor((new Date().getTime() - new Date(inc.fecha_reporte).getTime()) / 60000)} min
                  </p>
                  <span className="text-indigo-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 group-hover:text-indigo-300">
                    {activeTab === 'nuevas' ? 'Ver Detalles' : 'Ir al Equipo'} <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Modal Interactivo de Detalles para Nuevas Alertas */}
      <AnimatePresence>
        {selectedIncident && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`bg-[#0a0118] border-2 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl ${getPriorityColor(selectedIncident.prioridad).split(' ').find(c => c.startsWith('border')) || 'border-slate-800'}`}
            >
              <div className="p-6 border-b border-slate-800/50 flex justify-between items-center bg-white/5">
                <h3 className="text-xl font-bold text-white font-oswald tracking-wide">Detalle de Emergencia</h3>
                <button onClick={() => setSelectedIncident(null)} className="text-slate-500 hover:text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
              </div>
              
              <div className="p-8 space-y-6">
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Equipo Afectado</p>
                  <p className="text-2xl font-bold text-white">{selectedIncident.equipo_nombre}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#110121] p-4 rounded-2xl border border-slate-800">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Prioridad</p>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest inline-block ${getPriorityColor(selectedIncident.prioridad).split(' ').filter(c => !c.startsWith('border') && !c.startsWith('shadow')).join(' ')}`}>
                      {selectedIncident.prioridad}
                    </span>
                  </div>
                  <div className="bg-[#110121] p-4 rounded-2xl border border-slate-800">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Reportado por</p>
                    <p className="text-sm text-slate-300 flex items-center gap-2 font-medium">
                      <ShieldAlert className="w-4 h-4 text-indigo-400" />
                      {selectedIncident.doctor_nombre}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Síntoma / Diagnóstico Inicial</p>
                  <p className="text-slate-300 text-sm leading-relaxed bg-[#110121] p-4 rounded-2xl border border-slate-800">
                    {selectedIncident.problema_visible}
                  </p>
                </div>
                
                {selectedIncident.descripcion && (
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Información Adicional</p>
                    <p className="text-slate-400 text-sm italic border-l-2 border-indigo-500/50 pl-4 py-1">
                      "{selectedIncident.descripcion}"
                    </p>
                  </div>
                )}
              </div>

              <div className="p-6 bg-white/5 border-t border-slate-800 flex gap-4">
                <button 
                  onClick={() => setSelectedIncident(null)}
                  className="flex-1 py-3 text-slate-400 font-bold uppercase tracking-widest text-xs hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={() => handleAccept(selectedIncident.id, selectedIncident.equipo_id)}
                  disabled={isAccepting === selectedIncident.id}
                  className="flex-[2] py-3 bg-indigo-600 text-white rounded-xl font-bold uppercase tracking-widest text-xs shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:-translate-y-1 transition-all disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  {isAccepting === selectedIncident.id ? 'ASIGNANDO...' : 'RECLAMAR E IR AL EQUIPO'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

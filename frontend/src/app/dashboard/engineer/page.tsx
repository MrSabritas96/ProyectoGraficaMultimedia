"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/shared/components/Card';
import { Badge } from '@/shared/components/Badge';
import { Activity, Wrench, ShieldAlert, ChevronLeft, ChevronRight, Loader2, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function EngineerDashboard() {
  const router = useRouter();
  
  const [equipmentList, setEquipmentList] = useState<any[]>([]);
  const [unidades, setUnidades] = useState<string[]>(['CARGANDO...']);
  const [activeUnidad, setActiveUnidad] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [estadoOperativo, setEstadoOperativo] = useState<string>('Desconectado');
  const [isToggling, setIsToggling] = useState(false);

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const token = Cookies.get('token');
        const res = await fetch('http://localhost:8000/api/users/me/', { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) {
          const data = await res.json();
          setEstadoOperativo(data.role_name === 'Doctor' ? 'N/A' : (data.estado_operativo || 'Desconectado'));
        }
      } catch (e) { console.error(e); }
    };
    fetchAvailability();

    const fetchEquipment = async () => {
      setIsLoading(true);
      try {
        const url = activeUnidad 
          ? `http://localhost:8000/api/equipment/?unidad=${encodeURIComponent(activeUnidad)}&page=${page}&limit=12`
          : `http://localhost:8000/api/equipment/?page=1&limit=12`;
          
        const token = Cookies.get('token');
        
        const response = await fetch(url, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        
        if (data.unidades && data.unidades.length > 0) {
          setUnidades(data.unidades);
          if (!activeUnidad) {
            setActiveUnidad(data.unidades[0]);
            return;
          }
        }

        if (data.results) {
          setEquipmentList(data.results);
          setTotalPages(Math.ceil(data.total / data.limit));
        }
      } catch (error) {
        console.error("Error fetching equipment:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEquipment();
  }, [activeUnidad, page]);

  const toggleAvailability = async () => {
    if (estadoOperativo === 'Ocupado' || isToggling) return;
    setIsToggling(true);
    try {
      const token = Cookies.get('token');
      const newState = estadoOperativo === 'Disponible' ? 'Fuera de Unidad' : 'Disponible';
      const res = await fetch('http://localhost:8000/api/users/me/availability/', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ estado: newState })
      });
      if (res.ok) {
        const data = await res.json();
        setEstadoOperativo(data.estado);
      } else {
        const err = await res.json();
        alert(err.error || 'Error al cambiar estado');
      }
    } catch (e) { console.error(e); }
    setIsToggling(false);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-[#10b981] tracking-tight uppercase" style={{ fontFamily: 'var(--font-oswald)' }}>
            Inventario de Equipos Médicos
          </h1>
          <p className="text-slate-400 mt-2 font-medium flex items-center gap-2 tracking-widest uppercase text-xs">
            <Wrench className="w-4 h-4 text-[#10b981]" />
            Selecciona un equipo para revisar su estado o reportar una falla
          </p>
        </motion.div>
        
        <div className="flex flex-col items-end gap-2 bg-[#050010] p-4 rounded-2xl border border-slate-800">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Estado Actual Operativo</p>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-bold uppercase tracking-widest ${
              estadoOperativo === 'Disponible' ? 'text-emerald-400' :
              estadoOperativo === 'Ocupado' ? 'text-rose-500' :
              'text-amber-500'
            }`}>
              {estadoOperativo === 'Disponible' ? 'EN ÁREA (DISPONIBLE)' :
               estadoOperativo === 'Ocupado' ? 'EN MANTENIMIENTO' :
               'FUERA DE ÁREA (OFF)'}
            </span>
            <button 
              onClick={toggleAvailability}
              disabled={estadoOperativo === 'Ocupado' || isToggling}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                estadoOperativo === 'Disponible' ? 'bg-emerald-500/20 border border-emerald-500' :
                estadoOperativo === 'Ocupado' ? 'bg-rose-500/20 border border-rose-500 opacity-50 cursor-not-allowed' :
                'bg-slate-800 border border-slate-700'
              }`}
            >
              <div className={`absolute top-1 left-1 w-5 h-5 rounded-full transition-transform ${
                estadoOperativo === 'Disponible' ? 'translate-x-7 bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.8)]' :
                estadoOperativo === 'Ocupado' ? 'translate-x-3.5 bg-rose-500' :
                'translate-x-0 bg-slate-500'
              }`} />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="w-full relative">
        <div className="flex items-center justify-between px-2 mb-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Áreas Hospitalarias</h3>
        </div>
        <div className="w-full flex overflow-x-auto pb-4 gap-2 scrollbar-hide snap-x">
          {unidades.map((unidad) => (
            <button
              key={unidad}
              onClick={() => { setActiveUnidad(unidad); setPage(1); }}
              className={`snap-start px-6 py-2.5 rounded-full text-xs font-bold tracking-widest uppercase whitespace-nowrap transition-all duration-300 ${
                activeUnidad === unidad 
                  ? 'bg-gradient-to-r from-[#10b981] to-[#059669] text-white shadow-[0_0_20px_rgba(16,185,129,0.5)] border border-transparent' 
                  : 'bg-[#110121] text-slate-400 border border-slate-800 hover:border-[#10b981]/50 hover:text-white'
              }`}
            >
              {unidad}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-12 h-12 text-[#10b981] animate-spin" />
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {equipmentList.map((eq) => (
            <Card key={eq.id} className="p-0 overflow-hidden group border border-slate-800 hover:border-[#10b981]/50 transition-colors bg-[#050010] flex flex-col h-full cursor-pointer" onClick={() => router.push(`/dashboard/engineer/equipment/${eq.id}`)}>
              <div className="relative h-48 bg-slate-900 w-full overflow-hidden">
                <img 
                  src={'https://images.unsplash.com/photo-1519494026892-80bbd2d6f0d8?auto=format&fit=crop&w=600&q=80'} 
                  alt={eq.nombre} 
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050010] to-transparent" />
                
                <div className="absolute top-4 left-4">
                  <Badge variant={eq.estado === 'Activo' ? 'success' : eq.estado === 'En Mantenimiento' ? 'warning' : 'error'}>
                    {eq.estado}
                  </Badge>
                </div>
                {eq.falla_activa && (
                  <div className="absolute top-4 right-4">
                    <Badge variant="error" pulse>ALERTA</Badge>
                  </div>
                )}
              </div>
              <div className="p-5 flex-1 flex flex-col relative z-10 -mt-8">
                <h3 className="text-lg font-bold text-white mb-1 line-clamp-1">{eq.nombre}</h3>
                <p className="text-[10px] text-slate-400 font-mono mb-4">{eq.codigo_interno}</p>
                <div className="flex-1">
                  <p className="text-xs text-slate-400 line-clamp-2">{eq.descripcion}</p>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{eq.marca || 'GENERIC'}</span>
                  <div className="text-[#10b981] flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                    Revisar <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </motion.div>
      )}

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <button 
            onClick={() => setPage(p => p - 1)}
            disabled={page === 1}
            className="w-10 h-10 rounded-xl bg-[#110121] border border-slate-700 flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#10b981] hover:border-[#10b981] transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-slate-400 text-sm font-bold">Página {page} de {totalPages}</span>
          <button 
            onClick={() => setPage(p => p + 1)}
            disabled={page === totalPages}
            className="w-10 h-10 rounded-xl bg-[#110121] border border-slate-700 flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#10b981] hover:border-[#10b981] transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}

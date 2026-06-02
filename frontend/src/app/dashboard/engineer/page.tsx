"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/shared/components/Card';
import { Badge } from '@/shared/components/Badge';
import { Activity, Wrench, ShieldAlert, ChevronLeft, ChevronRight, Loader2, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { Carousel3D, Carousel3DItem } from '@/shared/components/Carousel3D';

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
          ? `http://localhost:8000/api/equipment/?unidad=${encodeURIComponent(activeUnidad)}&page=${page}&limit=8`
          : `http://localhost:8000/api/equipment/?page=${page}&limit=8`;
          
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

      {/* Carousel */}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-12 h-12 text-[#10b981] animate-spin" />
        </div>
      ) : (
        <div className="w-full relative min-h-[500px]">
          {(() => {
            const getImageUrlForArea = (area: string) => {
              const map: Record<string, string> = {
                'QUIROFANO': 'https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=1000&q=80',
                'IMAGENOLOGIA': 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1000&q=80',
                'CARDIOLOGIA': 'https://images.unsplash.com/photo-1584982751601-97dcc096659c?auto=format&fit=crop&w=1000&q=80',
                'TERAPIA INTENSIVA': 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1000&q=80',
                'EMERGENCIAS': 'https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?auto=format&fit=crop&w=1000&q=80',
                'LABORATORIO': 'https://images.unsplash.com/photo-1579154204601-e1588bc41f47?auto=format&fit=crop&w=1000&q=80'
              };
              return map[area?.toUpperCase()] || 'https://images.unsplash.com/photo-1519494026892-80bbd2d6f0d8?auto=format&fit=crop&w=1000&q=80';
            };

            const carouselItems = equipmentList.map((eq: any) => ({
              id: eq.id,
              image: eq.foto ? `http://localhost:8000${eq.foto}` : getImageUrlForArea(eq.area),
              title: eq.nombre,
              description: eq.modelo ? `Modelo: ${eq.modelo} | Marca: ${eq.marca || 'N/A'}` : (eq.descripcion || 'Sin descripción disponible'),
              status: eq.estado === 'Activo' ? 'Active' : eq.estado === 'En Mantenimiento' ? 'Warning' : 'Critical',
              ...eq
            }));

            return carouselItems.length > 0 ? (
              <Carousel3D 
                items={carouselItems} 
                onViewEquipment={(item) => router.push(`/dashboard/engineer/equipment/${item.id}`)} 
                autoPlayInterval={6000} 
              />
            ) : (
              <div className="flex items-center justify-center w-full h-[400px] text-slate-500 font-medium tracking-widest uppercase">
                No hay equipos registrados en esta unidad.
              </div>
            );
          })()}
        </div>
      )}

      {/* Carousel Pagination Controls */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-6 relative z-10 -mt-10 mb-10">
          <button 
            onClick={() => setPage(p => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-[#110121] border border-[#a855f7]/30 text-[#a855f7] hover:bg-[#a855f7]/20 hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-[#110121]"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }).map((_, i) => (
              <span 
                key={i} 
                className={`transition-all duration-300 rounded-full ${page === i + 1 ? 'w-8 h-2 bg-[#a855f7] shadow-[0_0_10px_rgba(168,85,247,0.8)]' : 'w-2 h-2 bg-slate-700'}`} 
              />
            ))}
          </div>

          <button 
            onClick={() => setPage(p => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-[#110121] border border-[#a855f7]/30 text-[#a855f7] hover:bg-[#a855f7]/20 hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-[#110121]"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}

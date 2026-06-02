"use client";

import React, { useState, useEffect } from 'react';
import { Activity, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import Cookies from 'js-cookie';
import { Carousel3D, Carousel3DItem } from '@/shared/components/Carousel3D';
import { EquipmentDetailModal } from '@/shared/components/EquipmentDetailModal';
import { ReportModal } from '@/shared/components/modals/ReportModal';
import { EngineerProfileModal } from '@/shared/components/modals/EngineerProfileModal';

export default function EquipmentsPage() {
  const [allEquipments, setAllEquipments] = useState<any[]>([]);
  const [unidades, setUnidades] = useState<string[]>([]);
  const [activeUnidad, setActiveUnidad] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [selectedEquipment, setSelectedEquipment] = useState<Carousel3DItem | null>(null);
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);
  const [selectedEngineer, setSelectedEngineer] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const token = Cookies.get('token');
      
      // 1. Fetch current doctor profile to find their assigned area(s)
      const profileRes = await fetch('http://localhost:8000/api/users/me/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      let doctorAreas: string[] = [];
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        if (profileData.especialidades && Array.isArray(profileData.especialidades)) {
          doctorAreas = profileData.especialidades.map((e: any) => e.nombre?.toUpperCase() || '').filter(Boolean);
        }
      }
      
      // 2. Fetch equipments
      const res = await fetch('http://localhost:8000/api/equipment/?limit=200', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        const list = data.results || data || [];
        
        // 3. Filter equipments by doctor's area(s)
        const filteredList = list.filter((eq: any) => {
          if (doctorAreas.length === 0) return true; // fallback if doctor has no areas assigned
          return eq.area && doctorAreas.includes(eq.area.toUpperCase());
        });
        
        setAllEquipments(filteredList);

        // 4. Extract unique areas from the filtered list
        const uniqueAreas = Array.from(new Set(filteredList.map((eq: any) => eq.area))).filter(Boolean) as string[];
        setUnidades(uniqueAreas);
        if (uniqueAreas.length > 0) {
          setActiveUnidad(uniqueAreas[0]);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

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

  const filtered = allEquipments.filter(eq => 
    activeUnidad ? eq.area.toLowerCase() === activeUnidad.toLowerCase() : true
  );

  const limit = 8;
  const totalPages = Math.ceil(filtered.length / limit);
  const paginated = filtered.slice((page - 1) * limit, page * limit);

  const carouselItems = paginated.map((eq: any) => ({
    id: eq.id,
    image: eq.foto ? `http://localhost:8000${eq.foto}` : getImageUrlForArea(eq.area),
    title: eq.nombre,
    description: eq.modelo ? `Modelo: ${eq.modelo} | Marca: ${eq.marca || 'N/A'}` : (eq.descripcion || 'Sin descripción disponible'),
    status: eq.estado === 'Activo' ? 'Active' : eq.estado === 'En Mantenimiento' ? 'Warning' : 'Critical',
    ...eq
  }));

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in relative text-white">
      {/* Modals Container */}
      <EquipmentDetailModal 
        item={selectedEquipment} 
        onClose={() => setSelectedEquipment(null)} 
        onViewReport={(id) => setSelectedReportId(id)}
        onViewEngineerProfile={(name) => setSelectedEngineer(name)}
      />
      <ReportModal 
        isOpen={selectedReportId !== null} 
        onClose={() => setSelectedReportId(null)} 
        reportId={selectedReportId || undefined} 
      />
      <EngineerProfileModal 
        isOpen={selectedEngineer !== null} 
        onClose={() => setSelectedEngineer(null)} 
        engineerName={selectedEngineer || undefined} 
      />

      <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500/5 blur-[120px] -z-10 rounded-full" />
      
      {/* Header */}
      <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-emerald-400 tracking-tight uppercase flex items-center gap-3 font-oswald" style={{ fontFamily: 'var(--font-oswald)' }}>
        <Activity className="text-emerald-500 w-8 h-8 animate-pulse" /> Mis Equipos y Áreas
      </h1>

      {/* Categories Tabs */}
      {unidades.length > 0 && (
        <div className="w-full relative">
          <div className="flex items-center justify-between px-2 mb-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Áreas Hospitalarias</h3>
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest flex items-center gap-1 bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-400/20">
              <ChevronLeft className="w-3 h-3" /> Desliza para ver más <ChevronRight className="w-3 h-3" />
            </span>
          </div>
          <div className="w-full flex overflow-x-auto pb-4 gap-2 scrollbar-hide snap-x">
            {unidades.map((unidad) => (
              <button
                key={unidad}
                type="button"
                onClick={() => { setActiveUnidad(unidad); setPage(1); }}
                className={`snap-start px-6 py-2.5 rounded-full text-xs font-bold tracking-widest uppercase whitespace-nowrap transition-all duration-300 ${
                  activeUnidad === unidad 
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.5)] border border-transparent' 
                    : 'bg-[#110121] text-slate-400 border border-slate-800 hover:border-emerald-500/50 hover:text-white'
                }`}
              >
                {unidad}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Carousel */}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-12 h-12 text-emerald-400 animate-spin" />
        </div>
      ) : (
        <div className="w-full relative min-h-[500px]">
          {carouselItems.length > 0 ? (
            <Carousel3D 
              items={carouselItems} 
              onViewEquipment={setSelectedEquipment} 
              autoPlayInterval={6000} 
            />
          ) : (
            <div className="flex items-center justify-center w-full h-[400px] text-slate-500 font-medium tracking-widest uppercase">
              No hay equipos registrados en esta unidad.
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-6 mt-4">
          <button 
            type="button"
            onClick={() => setPage(p => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-[#110121] border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-[#110121]"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }).map((_, i) => (
              <span 
                key={i} 
                className={`transition-all duration-300 rounded-full ${page === i + 1 ? 'w-8 h-2 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]' : 'w-2 h-2 bg-slate-700'}`} 
              />
            ))}
          </div>

          <button 
            type="button"
            onClick={() => setPage(p => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-[#110121] border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-[#110121]"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}

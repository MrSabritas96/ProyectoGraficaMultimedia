"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, Activity, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { Carousel3D, Carousel3DItem } from '@/shared/components/Carousel3D';

export default function EquipmentPage() {
  const router = useRouter();
  const role = Cookies.get('role');
  const canCreate = role === 'Administrador' || role === 'Secretario';

  const [allEquipments, setAllEquipments] = useState<any[]>([]);
  const [unidades, setUnidades] = useState<string[]>([]);
  const [activeUnidad, setActiveUnidad] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEquipment = async () => {
      setIsLoading(true);
      try {
        const token = Cookies.get('token');
        const response = await fetch('http://localhost:8000/api/equipment/?limit=200', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        const equipmentsList = data.results || [];
        setAllEquipments(equipmentsList);

        // Extract areas
        const uniqueAreas = Array.from(new Set(equipmentsList.map((eq: any) => eq.area))).filter(Boolean) as string[];
        setUnidades(uniqueAreas);
        if (uniqueAreas.length > 0) {
          setActiveUnidad(uniqueAreas[0]);
        }
      } catch (error) {
        console.error("Error fetching equipment:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEquipment();
  }, []);

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

  const filtered = allEquipments.filter(eq => {
    const matchesSearch = eq.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (eq.codigo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          eq.area.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesArea = activeUnidad ? eq.area.toLowerCase() === activeUnidad.toLowerCase() : true;
    return matchesSearch && matchesArea;
  });

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
    <div className="space-y-8 animate-fade-in pb-12 max-w-[1600px] mx-auto text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-[#a855f7] tracking-tight uppercase" style={{ fontFamily: 'var(--font-oswald)' }}>
            Inventario de Equipos
          </h1>
          <p className="text-slate-400 mt-2 font-medium flex items-center gap-2 tracking-widest uppercase text-xs">
            <Activity className="w-4 h-4 text-[#a855f7]" />
            Gestión y trazabilidad de activos médicos del hospital
          </p>
        </div>
        
        {canCreate && (
          <Link 
            href="/dashboard/equipment/new"
            className="px-6 py-3 bg-gradient-to-r from-[#7e22ce] to-[#4c1d95] text-white rounded-xl font-bold text-sm shadow-[0_0_20px_rgba(126,34,206,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] hover:-translate-y-1 transition-all duration-300 flex items-center gap-2 uppercase tracking-wider"
          >
            <Plus className="w-5 h-5" />
            Registrar Equipo
          </Link>
        )}
      </div>

      {/* Search Bar */}
      <div className="max-w-2xl relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
        <input 
          type="text" 
          placeholder="Buscar por nombre, modelo, código o área..." 
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
          className="w-full bg-[#050010] border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-[#a855f7] focus:ring-1 focus:ring-[#a855f7] transition-all"
        />
      </div>

      {/* Categories Tabs */}
      {unidades.length > 0 && (
        <div className="w-full relative">
          <div className="flex items-center justify-between px-2 mb-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Áreas Hospitalarias</h3>
            <span className="text-[10px] text-[#a855f7] font-bold uppercase tracking-widest flex items-center gap-1 bg-[#a855f7]/10 px-3 py-1 rounded-full border border-[#a855f7]/20">
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
                    ? 'bg-gradient-to-r from-[#a855f7] to-[#7e22ce] text-white shadow-[0_0_20px_rgba(168,85,247,0.5)] border border-transparent' 
                    : 'bg-[#110121] text-slate-400 border border-slate-800 hover:border-[#a855f7]/50 hover:text-white'
                }`}
              >
                {unidad}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Carousel or Loader */}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-12 h-12 text-[#a855f7] animate-spin" />
        </div>
      ) : (
        <div className="w-full relative min-h-[500px]">
          {carouselItems.length > 0 ? (
            <Carousel3D 
              items={carouselItems} 
              onViewEquipment={(item) => router.push(`/dashboard/equipment/${item.id}`)} 
              autoPlayInterval={6000} 
            />
          ) : (
            <div className="flex items-center justify-center w-full h-[400px] text-slate-500 font-medium tracking-widest uppercase">
              No se encontraron equipos registrados
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
            type="button"
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

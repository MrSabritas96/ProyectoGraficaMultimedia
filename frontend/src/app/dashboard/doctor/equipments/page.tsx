
"use client";
import React, { useState, useEffect } from 'react';
import { Activity, Monitor } from 'lucide-react';
import Cookies from 'js-cookie';

export default function EquipmentsPage() {
  const [equipments, setEquipments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const token = Cookies.get('token');
      const res = await fetch('http://localhost:8000/api/equipment/', { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setEquipments(data.results || data || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <h1 className="text-3xl font-bold text-white font-oswald flex items-center gap-3">
        <Activity className="text-emerald-500" /> Mis Equipos y Áreas
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {equipments.map(eq => (
          <div key={eq.id} className="bg-[#050010] border border-slate-800 rounded-2xl p-6 hover:border-emerald-500/50 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <Monitor className="w-8 h-8 text-slate-500" />
              <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${eq.estado === 'Activo' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                {eq.estado}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white">{eq.nombre}</h3>
            <p className="text-slate-500 text-xs font-mono mb-2">CÓD: {eq.codigo_interno || 'N/A'}</p>
            <p className="text-slate-400 text-sm line-clamp-2">{eq.descripcion}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

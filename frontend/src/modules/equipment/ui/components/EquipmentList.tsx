"use client";

import React, { useEffect, useState } from 'react';
import { MedicalEquipment } from '../../domain/types';
import { HttpEquipmentRepository } from '../../infrastructure/HttpEquipmentRepository';
import { MapPin, Tag, Activity, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export const EquipmentList: React.FC = () => {
  const [equipment, setEquipment] = useState<MedicalEquipment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const repo = new HttpEquipmentRepository();
        const data = await repo.getAll();
        setEquipment(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchEquipment();
  }, []);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Activo': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'En Mantenimiento': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'Fuera de Servicio': return 'bg-red-50 text-red-600 border-red-100';
      case 'Dado de Baja': return 'bg-slate-100 text-slate-500 border-slate-200';
      default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  if (loading) return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-64 bg-slate-100 rounded-3xl animate-pulse" />
      ))}
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {equipment.map((item) => (
        <Link 
          key={item.id} 
          href={`/dashboard/equipment/${item.id}`}
          className="group relative bg-white border border-slate-200 rounded-3xl p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 block overflow-hidden"
        >
          {/* Decorative element */}
          <div className="absolute -top-12 -right-12 w-24 h-24 bg-indigo-500/5 rounded-full group-hover:scale-150 transition-transform duration-700" />
          
          <div className="flex justify-between items-start mb-6 relative z-10">
            <div className="w-14 h-14 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shadow-sm">
              <Activity className="w-7 h-7" />
            </div>
            <span className={`px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getStatusStyle(item.estado)}`}>
              {item.estado}
            </span>
          </div>

          <div className="relative z-10">
            <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">{item.nombre}</h3>
            <p className="text-sm text-slate-500 mb-6 line-clamp-2 leading-relaxed">{item.descripcion}</p>

            <div className="space-y-3 pt-6 border-t border-slate-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Tag className="w-3.5 h-3.5 text-slate-300" />
                  <span className="font-semibold text-slate-400">ID:</span> {item.codigo_interno}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-slate-300" />
                  {item.area}
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex items-center gap-1 text-[10px] font-bold text-indigo-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-[-10px] group-hover:translate-x-0">
              Ver Trazabilidad <ChevronRight className="w-3 h-3" />
            </div>
          </div>
        </Link>
      ))}
      
      {equipment.length === 0 && (
        <div className="col-span-full py-20 flex flex-col items-center justify-center bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem] text-slate-400">
          <Activity className="w-12 h-12 mb-4 opacity-20" />
          <p className="font-medium">No se encontraron equipos registrados</p>
        </div>
      )}
    </div>
  );
};

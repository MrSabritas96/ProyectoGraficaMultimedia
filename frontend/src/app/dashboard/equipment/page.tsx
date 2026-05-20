"use client";

import React from 'react';
import { EquipmentList } from '@/modules/equipment/ui/components/EquipmentList';
import Link from 'next/link';
import { Plus, Search } from 'lucide-react';
import Cookies from 'js-cookie';

export default function EquipmentPage() {
  const role = Cookies.get('role');
  const canCreate = role === 'Administrador' || role === 'Secretario';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Inventario de Equipos</h1>
          <p className="text-slate-500">Gestión de activos médicos del hospital</p>
        </div>
        
        {canCreate && (
          <Link 
            href="/dashboard/equipment/new"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-indigo-100"
          >
            <Plus className="w-5 h-5" />
            Registrar Equipo
          </Link>
        )}
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar por nombre o código..." 
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
          />
        </div>
      </div>

      <EquipmentList />
    </div>
  );
}

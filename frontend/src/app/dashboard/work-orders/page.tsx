"use client";

import React from 'react';
import { WorkOrderList } from '@/modules/work-orders/ui/components/WorkOrderList';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import Cookies from 'js-cookie';

export default function WorkOrdersPage() {
  const [isMounted, setIsMounted] = React.useState(false);
  const [role, setRole] = React.useState<string | undefined>(undefined);

  React.useEffect(() => {
    setIsMounted(true);
    setRole(Cookies.get('role'));
  }, []);

  const canCreate = role === 'Jefe de Unidad' || role === 'Administrador';

  if (!isMounted) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Órdenes de Trabajo</h1>
          <p className="text-slate-500">Gestión y seguimiento de mantenimientos</p>
        </div>
        
        {canCreate && (
          <Link 
            href="/dashboard/work-orders/new"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-indigo-100"
          >
            <Plus className="w-5 h-5" />
            Nueva Orden
          </Link>
        )}
      </div>

      <WorkOrderList />
    </div>
  );
}

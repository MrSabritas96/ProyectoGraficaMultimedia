"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { HttpEquipmentRepository } from '@/modules/equipment/infrastructure/HttpEquipmentRepository';
import { EntityTimeline } from '@/modules/dashboard/ui/components/EntityTimeline';
import { ArrowLeft, Activity, MapPin, Tag } from 'lucide-react';
import Link from 'next/link';

export default function EquipmentDetailPage() {
  const { id } = useParams();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const repo = new HttpEquipmentRepository();
        const data = await repo.getHistory(Number(id));
        setHistory(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [id]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/equipment" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <h1 className="text-2xl font-bold text-slate-800">Trazabilidad del Equipo</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <EntityTimeline logs={history} title="Historial Técnico y Operativo" />
        </div>
        
        <div className="space-y-6">
          <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-100">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" /> Información
            </h3>
            <div className="space-y-3 opacity-90 text-sm">
              <p>Consulta aquí todos los movimientos, mantenimientos y cambios de estado registrados para este activo médico.</p>
              <p>Cada entrada está auditada con el usuario responsable y la fecha exacta del evento.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from 'react';
import { HttpWorkOrderRepository } from '../../infrastructure/HttpWorkOrderRepository';
import { MaintenanceType } from '../../domain/types';
import { HttpEquipmentRepository } from '@/modules/equipment/infrastructure/HttpEquipmentRepository';
import { MedicalEquipment } from '@/modules/equipment/domain/types';
import Cookies from 'js-cookie';
import { Save, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const CreateWorkOrderForm: React.FC = () => {
  const [tipo, setTipo] = useState<MaintenanceType>('Preventivo');
  const [descripcion, setDescripcion] = useState('');
  const [equipoId, setEquipoId] = useState<string>('');
  const [ingenieroId, setIngenieroId] = useState<string>('');
  const [equipments, setEquipments] = useState<MedicalEquipment[]>([]);
  const [engineers, setEngineers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const eqRepo = new HttpEquipmentRepository();
        const woRepo = new HttpWorkOrderRepository();
        const [eqData, engData] = await Promise.all([
          eqRepo.getAll(),
          woRepo.getEngineers()
        ]);
        setEquipments(eqData);
        setEngineers(engData);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!equipoId) {
      setError('Debes seleccionar un equipo médico');
      return;
    }
    setLoading(true);
    setError(null);

    const userId = Cookies.get('user_id');
    const repo = new HttpWorkOrderRepository();

    try {
      await repo.create({
        tipo_mantenimiento: tipo,
        descripcion,
        equipo_id: Number(equipoId),
        creado_por_id: Number(userId),
        ingeniero_asignado_id: ingenieroId ? Number(ingenieroId) : null,
      });
      window.location.href = '/dashboard/work-orders';
    } catch (err: any) {
      setError(err.message || 'Error al crear la orden');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">Nueva Orden de Trabajo</h2>
        <Link href="/dashboard/work-orders" className="text-slate-500 hover:text-slate-800 flex items-center gap-1 text-sm transition-colors">
          <ArrowLeft className="w-4 h-4" /> Volver
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {error && (
          <div className="p-4 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Tipo de Mantenimiento</label>
          <div className="grid grid-cols-2 gap-4">
            {(['Preventivo', 'Correctivo'] as MaintenanceType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTipo(t)}
                className={`py-3 px-4 rounded-xl border text-sm font-medium transition-all ${
                  tipo === t 
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm' 
                    : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Equipo Médico</label>
          <select
            value={equipoId}
            onChange={(e) => setEquipoId(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
            required
          >
            <option value="">Selecciona un equipo...</option>
            {equipments.map((eq) => (
              <option key={eq.id} value={eq.id}>
                {eq.nombre} ({eq.codigo_interno}) - {eq.area}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Asignar Ingeniero (Opcional)</label>
          <select
            value={ingenieroId}
            onChange={(e) => setIngenieroId(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
          >
            <option value="">Dejar sin asignar (Pendiente)</option>
            {engineers.map((eng) => (
              <option key={eng.id} value={eng.id}>
                {eng.email} ({eng.codigo})
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Descripción del Problema/Tarea</label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="w-full h-32 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none"
            placeholder="Describe detalladamente el requerimiento..."
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Save className="w-5 h-5" />
              Crear Orden de Trabajo
            </>
          )}
        </button>
      </form>
    </div>
  );
};

"use client";

import React, { useEffect, useState } from 'react';
import { HttpReportRepository } from '@/modules/reports/infrastructure/HttpReportRepository';
import { MetricCard } from '@/modules/reports/ui/components/MetricCard';
import { SimpleBarChart } from '@/modules/reports/ui/components/SimpleBarChart';
import { Clock, TrendingUp, AlertTriangle, UserCheck } from 'lucide-react';

export default function ReportsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const repo = new HttpReportRepository();
        const [status, time, failures, performance] = await Promise.all([
          repo.getStatusStats(),
          repo.getRepairTime(),
          repo.getTopFailures(),
          repo.getEngineerPerformance()
        ]);

        setStats({
          status,
          repairTime: time.average_hours,
          topFailures: failures,
          performance
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-500">Analizando datos del hospital...</div>;

  const statusData = [
    { label: 'Finalizado', value: stats.status.Finalizado, color: 'bg-emerald-500' },
    { label: 'En Proceso', value: stats.status['En Proceso'], color: 'bg-amber-500' },
    { label: 'Pendiente', value: stats.status.Pendiente, color: 'bg-slate-400' },
  ];

  const failureData = Array.isArray(stats.topFailures) ? stats.topFailures.map((f: any) => ({
    label: f.nombre,
    value: f.count,
    color: 'bg-red-500'
  })) : [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Panel de Métricas</h1>
        <p className="text-slate-500">Indicadores de rendimiento y mantenimiento</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Tiempo Prom. Reparación" 
          value={`${(stats.repairTime || 0).toFixed(1)}h`} 
          icon={Clock} 
          color="bg-blue-50 text-blue-600" 
        />
        <MetricCard 
          title="Órdenes Finalizadas" 
          value={stats.status.Finalizado} 
          icon={TrendingUp} 
          color="bg-emerald-50 text-emerald-600" 
        />
        <MetricCard 
          title="Equipos Críticos" 
          value={Array.isArray(stats.topFailures) ? stats.topFailures.length : 0} 
          icon={AlertTriangle} 
          color="bg-red-50 text-red-600" 
        />
        <MetricCard 
          title="Ingenieros Activos" 
          value={Array.isArray(stats.performance) ? stats.performance.length : 0} 
          icon={UserCheck} 
          color="bg-indigo-50 text-indigo-600" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <SimpleBarChart 
          title="Estado de Órdenes de Trabajo" 
          data={statusData} 
        />
        <SimpleBarChart 
          title="Equipos con Mayor Incidencia (Fallas)" 
          data={failureData} 
        />
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="font-bold text-slate-800 mb-6">Rendimiento por Ingeniero</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <th className="pb-3">Ingeniero</th>
                <th className="pb-3 text-right">Órdenes Atendidas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {Array.isArray(stats.performance) ? stats.performance.map((p: any, idx: number) => (
                <tr key={idx} className="text-sm">
                  <td className="py-4 text-slate-700 font-medium">{p.engineer}</td>
                  <td className="py-4 text-right font-bold text-indigo-600">{p.count}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={2} className="py-4 text-center text-slate-400">No hay datos de ingenieros</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

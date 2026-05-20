"use client";

import React from 'react';
import { Zap, GitMerge, Clock, Play, Pause, Plus } from 'lucide-react';

const mockAutomations = [
  { id: 1, name: 'Asignación Automática', trigger: 'Nueva Orden (Alta Prioridad)', action: 'Asignar a Ingeniero Disponible', status: 'Activo', type: 'Workflow' },
  { id: 2, name: 'Alerta de Mantenimiento', trigger: 'Fecha Mantenimiento < 7 días', action: 'Generar Orden Preventiva', status: 'Activo', type: 'Cron Job' },
  { id: 3, name: 'Backup Diario DB', trigger: 'Todos los días 03:00 AM', action: 'Ejecutar script pg_dump', status: 'Pausado', type: 'Tarea Programada' },
];

export default function AdminAutomationsPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in relative">
      <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-[#a855f7]/5 blur-[120px] -z-10 rounded-full" />

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-[#a855f7] font-oswald tracking-wide flex items-center gap-3">
            <Zap className="w-8 h-8 text-[#a855f7]" />
            Automatizaciones
          </h1>
          <p className="text-slate-400 mt-2">Workflows, reglas IF/THEN y tareas programadas del sistema.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-[#110121] border border-[#a855f7]/50 hover:bg-[#a855f7]/10 text-[#a855f7] rounded-xl font-medium transition-all shadow-[0_0_15px_rgba(168,85,247,0.1)] hover:shadow-[0_0_25px_rgba(168,85,247,0.2)] active:scale-95">
          <Plus className="w-5 h-5" />
          Crear Workflow
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mockAutomations.map((auto) => (
          <div key={auto.id} className="bg-[#050010]/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 hover:border-[#a855f7]/30 transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl ${auto.status === 'Activo' ? 'bg-[#a855f7]/10 text-[#a855f7]' : 'bg-slate-800 text-slate-400'}`}>
                  {auto.type === 'Workflow' ? <GitMerge className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white">{auto.name}</h3>
                  <p className="text-xs text-slate-500">{auto.type}</p>
                </div>
              </div>
              <button className={`p-2 rounded-lg transition-colors ${auto.status === 'Activo' ? 'hover:bg-amber-500/10 text-amber-500' : 'hover:bg-emerald-500/10 text-emerald-500'}`}>
                {auto.status === 'Activo' ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>
            </div>
            
            <div className="space-y-3 bg-[#110121] rounded-xl p-4 border border-slate-800/50">
              <div className="flex items-start gap-2">
                <div className="mt-1 w-2 h-2 rounded-full bg-rose-500" />
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">IF (Trigger)</p>
                  <p className="text-sm text-slate-300">{auto.trigger}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="mt-1 w-2 h-2 rounded-full bg-emerald-500" />
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">THEN (Action)</p>
                  <p className="text-sm text-slate-300">{auto.action}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

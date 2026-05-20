"use client";

import React from 'react';
import { Server, Database, HardDrive, Cpu, RefreshCw, DownloadCloud } from 'lucide-react';

export default function AdminInfrastructurePage() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in relative">
      <div className="absolute top-1/2 right-1/2 w-96 h-96 bg-cyan-500/5 blur-[120px] -z-10 rounded-full" />

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-cyan-400 font-oswald tracking-wide flex items-center gap-3">
            <Server className="w-8 h-8 text-cyan-500" />
            Infraestructura Base de Datos
          </h1>
          <p className="text-slate-400 mt-2">Monitoreo de salud del servidor, backups y consultas.</p>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 px-6 py-3 bg-[#110121] border border-cyan-500/50 hover:bg-cyan-500/10 text-cyan-500 rounded-xl font-medium transition-all shadow-[0_0_15px_rgba(6,182,212,0.1)] active:scale-95">
            <RefreshCw className="w-5 h-5" />
            Sincronizar
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl font-medium transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] active:scale-95">
            <DownloadCloud className="w-5 h-5" />
            Backup Manual
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-[#050010]/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Database className="w-5 h-5 text-cyan-500" />
            <h3 className="text-slate-400 font-medium">Estado BD</h3>
          </div>
          <p className="text-2xl font-bold text-emerald-400">Saludable</p>
          <p className="text-xs text-slate-500 mt-1">Latencia: 12ms</p>
        </div>
        <div className="bg-[#050010]/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <HardDrive className="w-5 h-5 text-cyan-500" />
            <h3 className="text-slate-400 font-medium">Almacenamiento</h3>
          </div>
          <p className="text-2xl font-bold text-white">45 GB <span className="text-sm font-normal text-slate-500">/ 500 GB</span></p>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-cyan-500 h-full w-[9%]" />
          </div>
        </div>
        <div className="bg-[#050010]/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Cpu className="w-5 h-5 text-cyan-500" />
            <h3 className="text-slate-400 font-medium">Carga CPU</h3>
          </div>
          <p className="text-2xl font-bold text-white">18%</p>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-cyan-500 h-full w-[18%]" />
          </div>
        </div>
        <div className="bg-[#050010]/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Server className="w-5 h-5 text-cyan-500" />
            <h3 className="text-slate-400 font-medium">Réplicas Activas</h3>
          </div>
          <p className="text-2xl font-bold text-white">2 <span className="text-sm font-normal text-slate-500">Nodos</span></p>
          <p className="text-xs text-slate-500 mt-1">Sincronización al 100%</p>
        </div>
      </div>

      <div className="bg-[#050010]/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6">
        <h2 className="text-xl font-oswald text-white mb-6">Historial de Backups</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 text-sm tracking-wider">
                <th className="p-4 font-medium">Fecha y Hora</th>
                <th className="p-4 font-medium">Tipo</th>
                <th className="p-4 font-medium">Tamaño</th>
                <th className="p-4 font-medium">Estado</th>
                <th className="p-4 font-medium text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {[
                { date: '19/05/2026 03:00 AM', type: 'Automático', size: '2.1 GB', status: 'Completado' },
                { date: '18/05/2026 03:00 AM', type: 'Automático', size: '2.0 GB', status: 'Completado' },
                { date: '17/05/2026 15:45 PM', type: 'Manual', size: '1.9 GB', status: 'Completado' },
              ].map((b, i) => (
                <tr key={i} className="hover:bg-[#110121]/50 transition-colors">
                  <td className="p-4 text-slate-300 text-sm">{b.date}</td>
                  <td className="p-4 text-slate-400 text-sm">{b.type}</td>
                  <td className="p-4 text-slate-400 font-mono text-sm">{b.size}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-xs font-medium">
                      {b.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button className="text-cyan-500 hover:text-cyan-400 text-sm font-medium transition-colors">Descargar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

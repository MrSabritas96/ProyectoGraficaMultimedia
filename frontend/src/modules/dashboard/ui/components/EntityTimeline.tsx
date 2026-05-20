"use client";

import React from 'react';
import { Clock, User as UserIcon, CheckCircle2, AlertCircle } from 'lucide-react';

interface HistoryItem {
  id: number;
  usuario: string;
  accion: string;
  descripcion: string;
  fecha: string;
}

interface Props {
  logs: HistoryItem[];
  title?: string;
}

export const EntityTimeline: React.FC<Props> = ({ logs, title = "Historial de Eventos" }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
        <Clock className="w-5 h-5 text-indigo-500" />
        {title}
      </h3>

      <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
        {logs.map((log) => (
          <div key={log.id} className="relative pl-8">
            <div className="absolute left-0 top-1 w-6 h-6 bg-white border-2 border-indigo-500 rounded-full flex items-center justify-center z-10">
              <div className="w-2 h-2 bg-indigo-500 rounded-full" />
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded">
                  {log.accion}
                </span>
                <span className="text-xs text-slate-400">
                  {new Date(log.fecha).toLocaleString()}
                </span>
              </div>
              
              <p className="text-sm text-slate-700 font-medium">
                {log.descripcion}
              </p>
              
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <UserIcon className="w-3.5 h-3.5" />
                <span>Realizado por: <span className="font-semibold">{log.usuario}</span></span>
              </div>
            </div>
          </div>
        ))}
        {logs.length === 0 && (
          <p className="text-center text-sm text-slate-400 py-4">No hay registros en el historial todavía.</p>
        )}
      </div>
    </div>
  );
};

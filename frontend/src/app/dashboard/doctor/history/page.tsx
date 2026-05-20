
"use client";
import React, { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';
import Cookies from 'js-cookie';

export default function HistoryPage() {
  const [incidents, setIncidents] = useState<any[]>([]);

  useEffect(() => {
    const fetchInc = async () => {
      const token = Cookies.get('token');
      const res = await fetch('http://localhost:8000/api/incidents/', { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) setIncidents(await res.json());
    };
    fetchInc();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto animate-fade-in">
      <h1 className="text-3xl font-bold text-white font-oswald flex items-center gap-3 mb-8">
        <FileText className="text-slate-400" /> Historial de Reportes
      </h1>
      <div className="bg-[#0a0118] border border-slate-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left text-sm text-slate-400">
          <thead className="bg-[#110121] border-b border-slate-800 text-xs uppercase tracking-widest">
            <tr>
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Fecha</th>
              <th className="px-6 py-4">Equipo</th>
              <th className="px-6 py-4">Problema</th>
              <th className="px-6 py-4">Estado</th>
            </tr>
          </thead>
          <tbody>
            {incidents.map(inc => (
              <tr key={inc.id} className="border-b border-slate-800/50 hover:bg-[#110121]/50">
                <td className="px-6 py-4 font-mono">#{inc.id}</td>
                <td className="px-6 py-4">{new Date(inc.fecha_reporte).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-white">{inc.equipo_nombre}</td>
                <td className="px-6 py-4">{inc.problema_visible}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold tracking-widest ${
                    inc.estado === 'Pendiente de Inspeccion' ? 'bg-amber-500/10 text-amber-500' :
                    inc.estado === 'Inspeccionado' ? 'bg-blue-500/10 text-blue-400' :
                    inc.estado === 'Orden Generada' ? 'bg-purple-500/10 text-purple-400' :
                    'bg-slate-500/10 text-slate-400'
                  }`}>
                    {inc.estado}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

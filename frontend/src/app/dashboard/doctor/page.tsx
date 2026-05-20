
"use client";
import React, { useState, useEffect } from 'react';
import { Stethoscope, Activity, Monitor, Clock, ShieldAlert, FileText } from 'lucide-react';
import Cookies from 'js-cookie';

export default function DoctorDashboard() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [equipments, setEquipments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const token = Cookies.get('token');
      const [incRes, eqRes] = await Promise.all([
        fetch('http://localhost:8000/api/incidents/', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('http://localhost:8000/api/equipment/', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      if (incRes.ok) setIncidents(await incRes.json());
      if (eqRes.ok) {
        const data = await eqRes.json();
        setEquipments(data.results || data || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in relative">
      <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500/5 blur-[120px] -z-10 rounded-full" />
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#050010]/80 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 p-[2px]">
            <div className="w-full h-full bg-[#050010] rounded-2xl flex items-center justify-center">
              <Stethoscope className="w-8 h-8 text-emerald-400" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 font-oswald tracking-wide">
              Resumen General Médico
            </h1>
            <p className="text-slate-400 mt-1 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-500" /> Estado global de su área operativa
            </p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-[#050010] border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Total Equipos Activos</p>
          <p className="text-3xl font-bold text-white font-oswald">{equipments.filter(e => e.estado === 'Activo').length}</p>
          <Monitor className="absolute -right-4 -bottom-4 w-24 h-24 text-slate-800/50" />
        </div>
        <div className="bg-[#050010] border border-rose-500/20 rounded-2xl p-6 relative overflow-hidden">
          <p className="text-rose-400 text-xs font-bold uppercase tracking-widest mb-2">Mis Reportes Pendientes</p>
          <p className="text-3xl font-bold text-white font-oswald">{incidents.filter(i => i.estado === 'Pendiente de Inspeccion').length}</p>
          <Clock className="absolute -right-4 -bottom-4 w-24 h-24 text-rose-500/10" />
        </div>
        <div className="bg-[#050010] border border-blue-500/20 rounded-2xl p-6 relative overflow-hidden">
          <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-2">En Inspección</p>
          <p className="text-3xl font-bold text-white font-oswald">{incidents.filter(i => i.estado === 'Inspeccionado').length}</p>
          <ShieldAlert className="absolute -right-4 -bottom-4 w-24 h-24 text-blue-500/10" />
        </div>
        <div className="bg-[#050010] border border-purple-500/20 rounded-2xl p-6 relative overflow-hidden">
          <p className="text-purple-400 text-xs font-bold uppercase tracking-widest mb-2">Órdenes Generadas</p>
          <p className="text-3xl font-bold text-white font-oswald">{incidents.filter(i => i.estado === 'Orden Generada').length}</p>
          <FileText className="absolute -right-4 -bottom-4 w-24 h-24 text-purple-500/10" />
        </div>
      </div>
    </div>
  );
}

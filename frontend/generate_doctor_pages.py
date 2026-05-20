import os

base_dir = "src/app/dashboard/doctor"

pages = {
    "page.tsx": """
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
""",
    "equipments/page.tsx": """
"use client";
import React, { useState, useEffect } from 'react';
import { Activity, Monitor } from 'lucide-react';
import Cookies from 'js-cookie';

export default function EquipmentsPage() {
  const [equipments, setEquipments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const token = Cookies.get('token');
      const res = await fetch('http://localhost:8000/api/equipment/', { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setEquipments(data.results || data || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <h1 className="text-3xl font-bold text-white font-oswald flex items-center gap-3">
        <Activity className="text-emerald-500" /> Mis Equipos y Áreas
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {equipments.map(eq => (
          <div key={eq.id} className="bg-[#050010] border border-slate-800 rounded-2xl p-6 hover:border-emerald-500/50 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <Monitor className="w-8 h-8 text-slate-500" />
              <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${eq.estado === 'Activo' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                {eq.estado}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white">{eq.nombre}</h3>
            <p className="text-slate-500 text-xs font-mono mb-2">CÓD: {eq.codigo_interno || 'N/A'}</p>
            <p className="text-slate-400 text-sm line-clamp-2">{eq.descripcion}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
""",
    "report/page.tsx": """
"use client";
import React, { useState, useEffect } from 'react';
import { AlertTriangle, ShieldAlert } from 'lucide-react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

export default function ReportIncidentPage() {
  const router = useRouter();
  const [equipments, setEquipments] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    equipo_id: '', prioridad: 'Media', problema_visible: '', descripcion: ''
  });

  useEffect(() => {
    const fetchEq = async () => {
      const token = Cookies.get('token');
      const res = await fetch('http://localhost:8000/api/equipment/', { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setEquipments(data.results || data || []);
      }
    };
    fetchEq();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = Cookies.get('token');
      const res = await fetch('http://localhost:8000/api/incidents/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        router.push('/dashboard/doctor/tracking');
      } else {
        alert("Error al reportar el incidente.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto animate-fade-in">
      <div className="bg-[#0a0118] border border-rose-500/30 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(225,29,72,0.1)]">
        <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-rose-950/40 to-[#0a0118]">
          <h2 className="text-2xl font-bold text-white tracking-wide font-oswald flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-rose-500" /> Reportar Falla de Equipo
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Equipo Afectado <span className="text-rose-500">*</span></label>
            <select required value={formData.equipo_id} onChange={e => setFormData({...formData, equipo_id: e.target.value})} className="w-full bg-[#110121] border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-rose-500 outline-none">
              <option value="" disabled>Seleccione un equipo...</option>
              {equipments.map(eq => <option key={eq.id} value={eq.id}>{eq.nombre} ({eq.codigo_interno})</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Prioridad Percibida <span className="text-rose-500">*</span></label>
              <select required value={formData.prioridad} onChange={e => setFormData({...formData, prioridad: e.target.value})} className="w-full bg-[#110121] border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-rose-500 outline-none">
                <option value="Baja">Baja (Funciona con detalles)</option>
                <option value="Media">Media (Falla intermitente)</option>
                <option value="Alta">Alta (Afecta paciente)</option>
                <option value="Critica">Crítica (Riesgo vital)</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Síntoma Visible <span className="text-rose-500">*</span></label>
              <input type="text" required placeholder="Ej: Pantalla no enciende" value={formData.problema_visible} onChange={e => setFormData({...formData, problema_visible: e.target.value})} className="w-full bg-[#110121] border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-rose-500 outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Detalles Adicionales</label>
            <textarea rows={3} value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})} className="w-full bg-[#110121] border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-rose-500 outline-none resize-none" />
          </div>
          <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl flex gap-3">
            <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0" />
            <p className="text-xs text-rose-200">El sistema buscará inmediatamente al ingeniero más cercano para realizar una inspección. No intente reparar el equipo usted mismo.</p>
          </div>
          <button disabled={isSubmitting} type="submit" className="w-full py-4 bg-gradient-to-r from-rose-600 to-red-700 text-white rounded-xl font-bold shadow-[0_0_20px_rgba(225,29,72,0.4)] hover:-translate-y-1 transition-all disabled:opacity-50">
            {isSubmitting ? 'ENVIANDO...' : 'ENVIAR REPORTE URGENTE'}
          </button>
        </form>
      </div>
    </div>
  );
}
""",
    "tracking/page.tsx": """
"use client";
import React, { useState, useEffect } from 'react';
import { ClipboardList, Clock, ShieldAlert, CheckCircle } from 'lucide-react';
import Cookies from 'js-cookie';

export default function TrackingPage() {
  const [incidents, setIncidents] = useState<any[]>([]);

  useEffect(() => {
    const fetchInc = async () => {
      const token = Cookies.get('token');
      const res = await fetch('http://localhost:8000/api/incidents/', { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) setIncidents(await res.json());
    };
    fetchInc();
  }, []);

  const activeIncidents = incidents.filter(i => i.estado !== 'Resuelto' && i.estado !== 'Rechazado');

  const getPriorityColor = (priority: string) => {
    if(priority === 'Critica') return 'text-rose-500 font-bold';
    if(priority === 'Alta') return 'text-orange-500';
    if(priority === 'Media') return 'text-amber-400';
    return 'text-emerald-400';
  };

  return (
    <div className="p-8 max-w-7xl mx-auto animate-fade-in">
      <h1 className="text-3xl font-bold text-white font-oswald flex items-center gap-3 mb-8">
        <ClipboardList className="text-blue-500" /> Seguimiento Kanban
      </h1>
      
      {activeIncidents.length === 0 ? (
        <div className="text-center py-12 border border-slate-800 rounded-2xl">
          <p className="text-slate-400">No hay incidentes activos en seguimiento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pendiente */}
          <div className="bg-[#050010]/50 border border-amber-500/20 rounded-2xl p-4">
            <h2 className="text-amber-400 font-bold mb-4 flex items-center gap-2"><Clock className="w-4 h-4"/> Pendiente Inspección</h2>
            {activeIncidents.filter(i => i.estado === 'Pendiente de Inspeccion').map(i => (
              <div key={i.id} className="bg-[#110121] border border-amber-500/30 p-4 rounded-xl mb-4">
                <p className="font-bold text-white text-sm">{i.equipo_nombre}</p>
                <p className="text-xs text-slate-400 mt-1">{i.problema_visible}</p>
                <div className="mt-3 text-[10px] uppercase tracking-widest text-slate-500 flex justify-between">
                  <span className={getPriorityColor(i.prioridad)}>{i.prioridad}</span>
                  <span>Ing: {i.ingeniero_asignado_nombre || 'Buscando...'}</span>
                </div>
              </div>
            ))}
          </div>
          {/* Inspeccionado */}
          <div className="bg-[#050010]/50 border border-blue-500/20 rounded-2xl p-4">
            <h2 className="text-blue-400 font-bold mb-4 flex items-center gap-2"><ShieldAlert className="w-4 h-4"/> Inspeccionado</h2>
            {activeIncidents.filter(i => i.estado === 'Inspeccionado').map(i => (
              <div key={i.id} className="bg-[#110121] border border-blue-500/30 p-4 rounded-xl mb-4">
                <p className="font-bold text-white text-sm">{i.equipo_nombre}</p>
                <p className="text-[10px] text-blue-300 mt-2 bg-blue-500/10 p-2 rounded">
                  Rep. Ing: {i.reporte_preliminar_ingeniero}
                </p>
              </div>
            ))}
          </div>
          {/* Orden Generada */}
          <div className="bg-[#050010]/50 border border-purple-500/20 rounded-2xl p-4">
            <h2 className="text-purple-400 font-bold mb-4 flex items-center gap-2"><CheckCircle className="w-4 h-4"/> Orden Generada</h2>
            {activeIncidents.filter(i => i.estado === 'Orden Generada').map(i => (
              <div key={i.id} className="bg-[#110121] border border-purple-500/30 p-4 rounded-xl mb-4">
                <p className="font-bold text-white text-sm">{i.equipo_nombre}</p>
                <p className="text-xs text-slate-400 mt-1">Aprobado por Jefatura. Reparación en curso.</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
""",
    "history/page.tsx": """
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
"""
}

for folder, content in pages.items():
    if '/' in folder:
        os.makedirs(os.path.join(base_dir, os.path.dirname(folder)), exist_ok=True)
    with open(os.path.join(base_dir, folder), "w", encoding="utf-8") as f:
        f.write(content)

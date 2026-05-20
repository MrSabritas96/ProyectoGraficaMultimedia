
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

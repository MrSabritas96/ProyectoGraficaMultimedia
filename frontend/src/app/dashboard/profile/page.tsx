"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserCircle, Save, Camera, Lock, Mail, Phone, Hash, Shield, Briefcase, ChevronRight, Activity, Award } from 'lucide-react';
import { Badge } from '@/shared/components/Badge';
import Cookies from 'js-cookie';

export default function ProfilePage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  // Form State
  const [cellphone, setCellphone] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [password, setPassword] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');

  useEffect(() => {
    setMounted(true);
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const token = Cookies.get('token');
      const res = await fetch('http://localhost:8000/api/users/me/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setProfile(data);
      setCellphone(data.cellphone || '');
      setDescripcion(data.descripcion_perfil || '');
      setPhotoPreview(data.photo ? (data.photo.startsWith('http') ? data.photo : `http://localhost:8000${data.photo}`) : 'http://localhost:8000/media/profiles/default.png');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = Cookies.get('token');
      const formData = new FormData();
      if (cellphone) formData.append('cellphone', cellphone);
      if (descripcion) formData.append('descripcion_perfil', descripcion);
      if (password) formData.append('password', password);
      if (photoFile) formData.append('photo', photoFile);

      const res = await fetch('http://localhost:8000/api/users/me/', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      
      if (res.ok) {
        setPassword('');
        fetchProfile();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (!mounted) return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="w-12 h-12 rounded-full border-4 border-[#a855f7] border-t-transparent animate-spin shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-[1200px] mx-auto pb-12 space-y-8"
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-[#a855f7] tracking-tight uppercase" style={{ fontFamily: 'var(--font-oswald)' }}>
            Mi Perfil Profesional
          </h1>
          <p className="text-slate-400 mt-2">Gestiona tu información personal e institucional.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna Izquierda: Foto y Resumen */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gradient-to-b from-[#110121] to-[#2b084d] rounded-3xl p-8 border border-[#a855f7]/30 shadow-[0_0_30px_rgba(126,34,206,0.15)] flex flex-col items-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#a855f7]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            
            <div className="relative group cursor-pointer mb-6 z-10">
              <div className="w-40 h-40 rounded-full border-4 border-[#a855f7] overflow-hidden bg-slate-900 shadow-[0_0_30px_rgba(168,85,247,0.4)]">
                {photoPreview ? (
                  <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" onError={(e: any) => { e.target.src = 'http://localhost:8000/media/profiles/default.png' }} />
                ) : (
                  <img src="http://localhost:8000/media/profiles/default.png" alt="Profile Default" className="w-full h-full object-cover" />
                )}
              </div>
              <label className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
                <Camera className="w-8 h-8 mb-2" />
                Actualizar Foto
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              </label>
            </div>

            <Badge variant="primary" className="mb-3 uppercase tracking-widest px-4 py-1.5 text-xs">{profile?.role_name || 'Cargando...'}</Badge>
            <h3 className="text-2xl font-bold text-white text-center tracking-tight">{profile?.first_name} {profile?.last_name}</h3>
            <p className="text-sm text-[#d8b4fe] font-mono mt-2 bg-[#050010] px-3 py-1 rounded-full border border-[#a855f7]/30">{profile?.codigo_unico}</p>
          </div>

          <div className="bg-[#110121] rounded-3xl p-6 border border-slate-800 shadow-xl">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#a855f7]" /> Actividad Reciente
            </h4>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#a855f7]/10 border border-[#a855f7]/20 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-[#a855f7]" />
                </div>
                <div>
                  <p className="text-sm text-white font-medium">Cuenta Creada</p>
                  <p className="text-xs text-slate-500">{profile?.date_joined ? new Date(profile.date_joined).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Fecha Desconocida'}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <span className="text-emerald-400 font-bold text-sm">✓</span>
                </div>
                <div>
                  <p className="text-sm text-white font-medium">Estado del Sistema</p>
                  <p className="text-xs text-slate-500">{profile?.is_active ? 'Activo y Operativo' : 'Cuenta Suspendida'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Formulario de Datos */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-[#110121] rounded-3xl p-8 border border-slate-800 shadow-xl space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-b from-[#a855f7]/5 to-transparent rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/4" />
            
            {/* Institucional */}
            <div className="relative z-10">
              <h4 className="text-sm font-bold text-[#a855f7] uppercase tracking-widest mb-6 flex items-center gap-2 border-b border-slate-800 pb-4">
                <Shield className="w-5 h-5" /> Información Institucional (Solo Lectura)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-[#050010] p-5 rounded-2xl border border-slate-800 hover:border-[#a855f7]/50 transition-colors group">
                  <p className="text-[10px] text-slate-500 uppercase flex items-center gap-2 mb-2"><Mail className="w-3 h-3 text-[#a855f7]"/> Correo Electrónico</p>
                  <p className="text-sm font-medium text-slate-200 break-all">{profile?.email || 'N/A'}</p>
                </div>
                <div className="bg-[#050010] p-5 rounded-2xl border border-slate-800 hover:border-[#a855f7]/50 transition-colors group">
                  <p className="text-[10px] text-slate-500 uppercase flex items-center gap-2 mb-2"><Hash className="w-3 h-3 text-[#a855f7]"/> C.I.</p>
                  <p className="text-sm font-medium text-slate-200">{profile?.ci || 'No registrado'}</p>
                </div>
                <div className="bg-[#050010] p-5 rounded-2xl border border-slate-800 hover:border-[#a855f7]/50 transition-colors group">
                  <p className="text-[10px] text-slate-500 uppercase flex items-center gap-2 mb-2"><Award className="w-3 h-3 text-[#a855f7]"/> Matrícula Profesional</p>
                  <p className="text-sm font-medium text-[#d8b4fe] bg-[#a855f7]/10 px-2 py-1 rounded inline-block">{profile?.matricula || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Especialidades */}
            {profile?.especialidades && profile.especialidades.length > 0 && (
              <div className="relative z-10">
                <h4 className="text-sm font-bold text-[#a855f7] uppercase tracking-widest mb-6 flex items-center gap-2 border-b border-slate-800 pb-4">
                  <Award className="w-5 h-5" /> Especialidades Técnicas
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {profile.especialidades.map((esp: any, idx: number) => (
                    <div key={idx} className="bg-gradient-to-r from-[#110121] to-[#1e1b4b]/30 p-5 rounded-2xl border border-[#a855f7]/20 group hover:border-[#a855f7]/50 transition-colors">
                      <h5 className="text-base font-bold text-white mb-2 flex items-center justify-between">
                        {esp.nombre}
                        <ChevronRight className="w-4 h-4 text-[#a855f7] opacity-0 group-hover:opacity-100 transition-opacity" />
                      </h5>
                      <p className="text-sm text-slate-400 leading-relaxed">{esp.descripcion}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Editables */}
            <div className="relative z-10">
              <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-widest mb-6 flex items-center gap-2 border-b border-slate-800 pb-4">
                <UserCircle className="w-5 h-5" /> Datos Editables
              </h4>
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Phone className="w-4 h-4 text-emerald-500"/> Celular</label>
                  <input 
                    type="text" 
                    value={cellphone} 
                    onChange={e => setCellphone(e.target.value)}
                    className="w-full bg-[#050010] border border-slate-700 rounded-xl px-5 py-4 text-base text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all shadow-inner"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Descripción Breve de Perfil</label>
                  <textarea 
                    value={descripcion}
                    onChange={e => setDescripcion(e.target.value)}
                    className="w-full bg-[#050010] border border-slate-700 rounded-xl px-5 py-4 text-base text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all resize-none h-32 shadow-inner"
                    placeholder="Escribe algo sobre ti, tu experiencia y áreas de enfoque..."
                  />
                </div>
              </div>
            </div>

            {/* Seguridad */}
            <div className="bg-rose-500/5 p-6 rounded-3xl border border-rose-500/20 relative z-10">
              <h4 className="text-sm font-bold text-rose-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Lock className="w-5 h-5" /> Seguridad
              </h4>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Nueva Contraseña (Opcional)</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-[#050010] border border-rose-500/30 rounded-xl px-5 py-4 text-base text-white focus:border-rose-500 focus:ring-1 focus:ring-rose-500/50 outline-none transition-all shadow-inner"
                  placeholder="Dejar en blanco para mantener la actual"
                />
              </div>
            </div>

            {/* Acciones */}
            <div className="flex justify-end pt-4 relative z-10">
              <button 
                type="submit" 
                disabled={saving}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white px-10 py-4 rounded-xl text-sm font-bold shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] hover:-translate-y-1 transition-all flex items-center gap-3 disabled:opacity-50 disabled:hover:translate-y-0 uppercase tracking-wider"
              >
                {saving ? <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" /> : <Save className="w-5 h-5" />}
                {saving ? 'Guardando Perfil...' : 'Guardar Todos los Cambios'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
}

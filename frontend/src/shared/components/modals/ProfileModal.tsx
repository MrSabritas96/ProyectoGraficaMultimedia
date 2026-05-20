"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserCircle, Save, Camera, Lock, Mail, Phone, Hash, Shield, Briefcase, ChevronRight } from 'lucide-react';
import { Input } from '../Input';
import { Badge } from '../Badge';
import Cookies from 'js-cookie';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
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
    if (isOpen) fetchProfile();
  }, [isOpen]);

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
      setPhotoPreview(data.photo ? `http://localhost:8000${data.photo}` : 'http://localhost:8000/media/profiles/default.png');
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
        onClose();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#020005]/95 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="bg-[#050010] border border-[#a855f7]/30 rounded-3xl w-full max-w-4xl shadow-[0_0_50px_rgba(126,34,206,0.2)] overflow-hidden relative flex flex-col md:flex-row"
            onClick={e => e.stopPropagation()}
          >
            {/* Header / Left Panel */}
            <div className="w-full md:w-[35%] bg-gradient-to-b from-[#110121] to-[#2b084d] p-8 border-b md:border-b-0 md:border-r border-[#a855f7]/20 flex flex-col items-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#a855f7]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              
              <button onClick={onClose} className="absolute top-4 left-4 md:hidden text-slate-400 hover:text-white bg-black/20 p-2 rounded-full">
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-2xl font-bold text-white mb-8 tracking-widest uppercase text-center relative z-10" style={{ fontFamily: 'var(--font-oswald)' }}>
                Perfil Profesional
              </h2>

              {loading ? (
                <div className="w-32 h-32 rounded-full border-4 border-slate-800 border-t-[#a855f7] animate-spin mb-6" />
              ) : (
                <div className="relative group cursor-pointer mb-6 z-10">
                  <div className="w-32 h-32 rounded-full border-4 border-[#a855f7] overflow-hidden bg-slate-900 shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                    {photoPreview ? (
                      <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" onError={(e: any) => { e.target.src = 'http://localhost:8000/media/profiles/default.png' }} />
                    ) : (
                      <img src="http://localhost:8000/media/profiles/default.png" alt="Profile Default" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <label className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white text-xs font-bold uppercase tracking-wider">
                    <Camera className="w-6 h-6 mb-1" />
                    Cambiar
                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                  </label>
                </div>
              )}

              <Badge variant="primary" className="mb-2 uppercase tracking-widest">{profile?.role_name || 'Cargando...'}</Badge>
              <h3 className="text-xl font-bold text-white text-center">{profile?.first_name} {profile?.last_name}</h3>
              <p className="text-xs text-[#d8b4fe] font-mono mt-1">{profile?.codigo_unico}</p>
            </div>

            {/* Body / Form */}
            <div className="flex-1 p-8 relative overflow-y-auto max-h-[85vh] custom-scrollbar bg-[#0a001a]">
              <button onClick={onClose} className="hidden md:flex absolute top-6 right-6 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 p-2 rounded-full transition-all border border-transparent">
                <X className="w-5 h-5" />
              </button>

              <form onSubmit={handleSubmit} className="space-y-8 pt-4">
                {/* Datos de Solo Lectura */}
                <div>
                  <h4 className="text-xs font-bold text-[#a855f7] uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-[#a855f7]/20 pb-2">
                    <Shield className="w-4 h-4" /> Información Institucional (Solo Lectura)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-[#110121] p-3 rounded-xl border border-slate-800">
                      <p className="text-[10px] text-slate-500 uppercase flex items-center gap-1 mb-1"><Mail className="w-3 h-3"/> Correo Electrónico</p>
                      <p className="text-sm font-medium text-slate-300">{profile?.email || 'N/A'}</p>
                    </div>
                    <div className="bg-[#110121] p-3 rounded-xl border border-slate-800">
                      <p className="text-[10px] text-slate-500 uppercase flex items-center gap-1 mb-1"><Hash className="w-3 h-3"/> C.I. / Matrícula</p>
                      <p className="text-sm font-medium text-slate-300">{profile?.ci} | {profile?.matricula}</p>
                    </div>
                  </div>
                </div>

                {/* Especialidades */}
                {profile?.especialidades && profile.especialidades.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-[#a855f7] uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-[#a855f7]/20 pb-2">
                      <Briefcase className="w-4 h-4" /> Especialidades Técnicas
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {profile.especialidades.map((esp: any, idx: number) => (
                        <div key={idx} className="bg-gradient-to-r from-[#110121] to-[#1e1b4b]/30 p-3 rounded-xl border border-[#a855f7]/20 group">
                          <h5 className="text-sm font-bold text-white mb-1 flex items-center justify-between">
                            {esp.nombre}
                            <ChevronRight className="w-4 h-4 text-[#a855f7] opacity-0 group-hover:opacity-100 transition-opacity" />
                          </h5>
                          <p className="text-xs text-slate-400">{esp.descripcion}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Datos Editables */}
                <div>
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-emerald-500/20 pb-2">
                    <UserCircle className="w-4 h-4" /> Datos Editables
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2"><Phone className="w-3 h-3"/> Celular</label>
                      <input 
                        type="text" 
                        value={cellphone} 
                        onChange={e => setCellphone(e.target.value)}
                        className="w-full bg-[#110121] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:border-[#a855f7] outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Descripción Breve de Perfil</label>
                      <textarea 
                        value={descripcion}
                        onChange={e => setDescripcion(e.target.value)}
                        className="w-full bg-[#110121] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:border-[#a855f7] outline-none transition-colors resize-none h-24"
                        placeholder="Escribe algo sobre ti..."
                      />
                    </div>
                  </div>
                </div>

                {/* Seguridad */}
                <div className="bg-rose-500/5 p-5 rounded-2xl border border-rose-500/20">
                  <h4 className="text-xs font-bold text-rose-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Lock className="w-4 h-4" /> Seguridad
                  </h4>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Nueva Contraseña (Opcional)</label>
                    <input 
                      type="password" 
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full bg-[#110121] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:border-rose-500 outline-none transition-colors"
                      placeholder="Dejar en blanco para mantener la actual"
                    />
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={onClose} className="px-5 py-2 rounded-xl text-sm font-bold text-slate-400 hover:text-white bg-[#110121] border border-slate-700 transition-colors">
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    disabled={saving}
                    className="bg-gradient-to-r from-[#a855f7] to-[#7e22ce] hover:from-[#9333ea] hover:to-[#6b21a8] text-white px-8 py-2 rounded-xl text-sm font-bold shadow-[0_0_15px_rgba(168,85,247,0.4)] hover:shadow-[0_0_25px_rgba(168,85,247,0.6)] transition-all flex items-center gap-2 disabled:opacity-50 uppercase tracking-wider"
                  >
                    {saving ? <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <Save className="w-4 h-4" />}
                    {saving ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </div>

              </form>
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

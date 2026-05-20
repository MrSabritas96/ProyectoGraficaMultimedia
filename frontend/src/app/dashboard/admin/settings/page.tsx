"use client";

import React from 'react';
import { Settings, Globe, Palette, Clock, Save, Sliders } from 'lucide-react';

export default function AdminSettingsPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in relative">
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-rose-500/5 blur-[120px] -z-10 rounded-full" />

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-rose-400 font-oswald tracking-wide flex items-center gap-3">
            <Settings className="w-8 h-8 text-rose-500" />
            Configuración General
          </h1>
          <p className="text-slate-400 mt-2">Ajustes globales de la plataforma MedTrack.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-600 to-rose-500 text-white rounded-xl font-medium transition-all shadow-[0_0_15px_rgba(244,63,94,0.3)] hover:shadow-[0_0_25px_rgba(244,63,94,0.5)] active:scale-95">
          <Save className="w-5 h-5" />
          Guardar Cambios
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* General Info */}
        <div className="bg-[#050010]/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6">
          <h2 className="text-xl font-oswald text-white flex items-center gap-2 mb-6">
            <Globe className="w-5 h-5 text-rose-500" />
            Información Institucional
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Nombre de la Institución</label>
              <input type="text" defaultValue="Hospital Central" className="w-full px-4 py-2 bg-[#110121] border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-rose-500 transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Nombre de la Plataforma</label>
              <input type="text" defaultValue="MedTrack" className="w-full px-4 py-2 bg-[#110121] border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-rose-500 transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Idioma por Defecto</label>
              <select className="w-full px-4 py-2 bg-[#110121] border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-rose-500 transition-colors">
                <option>Español (Latinoamérica)</option>
                <option>Inglés (US)</option>
              </select>
            </div>
          </div>
        </div>

        {/* System Params */}
        <div className="bg-[#050010]/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6">
          <h2 className="text-xl font-oswald text-white flex items-center gap-2 mb-6">
            <Sliders className="w-5 h-5 text-rose-500" />
            Parámetros Internos
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Límite de Archivos (Subida MB)</label>
              <input type="number" defaultValue={50} className="w-full px-4 py-2 bg-[#110121] border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-rose-500 transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Modo de Mantenimiento</label>
              <div className="flex items-center gap-3 mt-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"></div>
                  <span className="ml-3 text-sm font-medium text-slate-400">Desactivado</span>
                </label>
              </div>
              <p className="text-xs text-slate-500 mt-2">Si se activa, solo los Administradores podrán iniciar sesión.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

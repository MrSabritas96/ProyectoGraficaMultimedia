"use client";

import React from 'react';
import { MessageSquare, Bell, Mail, Smartphone, Send, Plus } from 'lucide-react';

export default function AdminCommunicationsPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in relative">
      <div className="absolute top-1/4 left-1/2 w-96 h-96 bg-[#3b82f6]/5 blur-[120px] -z-10 rounded-full" />

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-[#3b82f6] font-oswald tracking-wide flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-[#3b82f6]" />
            Comunicaciones
          </h1>
          <p className="text-slate-400 mt-2">Configuración de notificaciones, plantillas de email y chat interno.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-[#110121] border border-[#3b82f6]/50 hover:bg-[#3b82f6]/10 text-[#3b82f6] rounded-xl font-medium transition-all shadow-[0_0_15px_rgba(59,130,246,0.1)] active:scale-95">
          <Send className="w-5 h-5" />
          Enviar Anuncio Global
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-[#050010]/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 hover:border-[#3b82f6]/30 transition-all cursor-pointer">
            <div className="flex items-center gap-4 mb-2">
              <Bell className="w-6 h-6 text-[#3b82f6]" />
              <h3 className="text-lg font-medium text-white">Notificaciones Push</h3>
            </div>
            <p className="text-sm text-slate-400">Alertas en tiempo real dentro de la plataforma (WebSockets).</p>
          </div>
          
          <div className="bg-[#050010]/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 hover:border-[#a855f7]/30 transition-all cursor-pointer border-[#a855f7]/30 shadow-[0_0_15px_rgba(168,85,247,0.05)]">
            <div className="flex items-center gap-4 mb-2">
              <Mail className="w-6 h-6 text-[#a855f7]" />
              <h3 className="text-lg font-medium text-white">Plantillas de Email</h3>
            </div>
            <p className="text-sm text-slate-400">Correos automatizados para creación de órdenes, asignaciones, etc.</p>
          </div>

          <div className="bg-[#050010]/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 hover:border-emerald-500/30 transition-all cursor-pointer">
            <div className="flex items-center gap-4 mb-2">
              <Smartphone className="w-6 h-6 text-emerald-500" />
              <h3 className="text-lg font-medium text-white">Integración SMS/WhatsApp</h3>
            </div>
            <p className="text-sm text-slate-400">Notificaciones críticas enviadas al celular del personal. (Desactivado)</p>
          </div>
        </div>

        <div className="lg:col-span-2 bg-[#050010]/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-oswald text-white">Plantillas de Email Activas</h2>
            <button className="p-2 bg-[#110121] border border-slate-700 rounded-lg text-slate-300 hover:text-white hover:border-slate-500 transition-colors">
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            {[
              { title: 'Nueva Orden Creada', subject: '[MedTrack] Nueva Orden de Trabajo #{ID}', type: 'Automático' },
              { title: 'Asignación de Orden', subject: '[MedTrack] Se te ha asignado la Orden #{ID}', type: 'Automático' },
              { title: 'Bienvenida Nuevo Usuario', subject: 'Bienvenido al Sistema MedTrack', type: 'Administrativo' },
            ].map((tpl, i) => (
              <div key={i} className="bg-[#110121] border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 group">
                <div>
                  <h4 className="text-slate-200 font-medium">{tpl.title}</h4>
                  <p className="text-sm text-slate-400 font-mono mt-1">{tpl.subject}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded-full">{tpl.type}</span>
                  <button className="text-sm text-[#a855f7] hover:underline opacity-0 group-hover:opacity-100 transition-opacity">Editar Plantilla</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

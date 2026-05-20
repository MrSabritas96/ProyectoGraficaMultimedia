"use client";

import React from 'react';
import { ShieldCheck, Lock, Eye, AlertTriangle, Fingerprint, ActivitySquare } from 'lucide-react';

const mockLogs = [
  { id: 1, user: 'jefe@gmail.com', action: 'LOGIN', detail: 'Inicio de sesión exitoso', ip: '192.168.1.105', time: 'Hace 5 min', type: 'info' },
  { id: 2, user: 'admin@gmail.com', action: 'UPDATE_USER', detail: 'Cambio de rol a Ana Ramos', ip: '10.0.0.5', time: 'Hace 12 min', type: 'warning' },
  { id: 3, user: 'ingeniero@gmail.com', action: 'DELETE_ORDER', detail: 'Eliminó Orden #145', ip: '192.168.1.112', time: 'Hace 1 hora', type: 'danger' },
  { id: 4, user: 'Desconocido', action: 'FAILED_LOGIN', detail: 'Intento fallido (Contraseña incorrecta)', ip: '45.22.19.102', time: 'Hace 2 horas', type: 'danger' },
];

export default function AdminSecurityPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in relative">
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 blur-[120px] -z-10 rounded-full" />

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-emerald-400 font-oswald tracking-wide flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-emerald-500" />
            Seguridad y Auditoría
          </h1>
          <p className="text-slate-400 mt-2">Monitoreo de actividad, políticas de contraseñas y accesos.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-[#110121] border border-emerald-500/50 hover:bg-emerald-500/10 text-emerald-500 rounded-xl font-medium transition-all shadow-[0_0_15px_rgba(16,185,129,0.1)] hover:shadow-[0_0_25px_rgba(16,185,129,0.2)] active:scale-95">
          <Fingerprint className="w-5 h-5" />
          Forzar 2FA Global
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Security Settings Cards */}
        <div className="bg-[#050010]/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 hover:border-emerald-500/30 transition-all group">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Lock className="w-6 h-6 text-emerald-500" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">Políticas de Contraseña</h3>
          <p className="text-sm text-slate-400 mb-4">Requiere min 12 caracteres, alfanumérico y símbolos.</p>
          <div className="flex items-center justify-between mt-auto">
            <span className="text-xs text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">Estricto</span>
            <button className="text-xs text-slate-300 hover:text-white underline">Configurar</button>
          </div>
        </div>

        <div className="bg-[#050010]/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 hover:border-emerald-500/30 transition-all group">
          <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <ActivitySquare className="w-6 h-6 text-blue-500" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">Tiempo de Sesión</h3>
          <p className="text-sm text-slate-400 mb-4">Cierre automático por inactividad tras 30 minutos.</p>
          <div className="flex items-center justify-between mt-auto">
            <span className="text-xs text-blue-400 bg-blue-400/10 px-2 py-1 rounded">Activado</span>
            <button className="text-xs text-slate-300 hover:text-white underline">Configurar</button>
          </div>
        </div>

        <div className="bg-[#050010]/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 hover:border-rose-500/30 transition-all group">
          <div className="w-12 h-12 bg-rose-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <AlertTriangle className="w-6 h-6 text-rose-500" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">Bloqueo de Cuentas</h3>
          <p className="text-sm text-slate-400 mb-4">Bloqueo automático tras 5 intentos fallidos.</p>
          <div className="flex items-center justify-between mt-auto">
            <span className="text-xs text-rose-400 bg-rose-400/10 px-2 py-1 rounded">Activo (5 intentos)</span>
            <button className="text-xs text-slate-300 hover:text-white underline">Configurar</button>
          </div>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-[#050010]/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 mt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-oswald text-white flex items-center gap-2">
            <Eye className="w-5 h-5 text-emerald-500" />
            Logs Recientes del Sistema
          </h2>
          <button className="text-sm text-emerald-500 hover:text-emerald-400 transition-colors">Exportar CSV</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 text-xs tracking-wider uppercase">
                <th className="p-3 font-medium">Tiempo</th>
                <th className="p-3 font-medium">Usuario</th>
                <th className="p-3 font-medium">Acción</th>
                <th className="p-3 font-medium">Detalle</th>
                <th className="p-3 font-medium">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {mockLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#110121]/50 transition-colors text-sm">
                  <td className="p-3 text-slate-400">{log.time}</td>
                  <td className="p-3 text-slate-200">{log.user}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      log.type === 'info' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      log.type === 'warning' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="p-3 text-slate-300">{log.detail}</td>
                  <td className="p-3 text-slate-500 font-mono text-xs">{log.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

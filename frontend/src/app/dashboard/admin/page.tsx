"use client";

import React, { useState, useEffect } from 'react';
import { Card } from '@/shared/components/Card';
import { Badge } from '@/shared/components/Badge';
import { ProgressBar } from '@/shared/components/ProgressBar';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Server, Activity, ShieldCheck, Database, Zap, HardDrive, Cpu, Network } from 'lucide-react';

export default function AdminDashboard() {
  const [isMounted, setIsMounted] = useState(false);
  const [liveMetrics, setLiveMetrics] = useState({ cpu: 18, bandwidth: 42, reqs: Array.from({ length: 24 }).map(() => 0) });

  // Simulate live data updates
  useEffect(() => {
    setIsMounted(true);
    setLiveMetrics({ cpu: 18, bandwidth: 42, reqs: Array.from({ length: 24 }).map(() => Math.floor(Math.random() * 60) + 20) });
    const timer = setInterval(() => {
      setLiveMetrics(prev => ({
        cpu: Math.max(10, Math.min(95, prev.cpu + (Math.random() * 10 - 5))),
        bandwidth: Math.max(20, Math.min(90, prev.bandwidth + (Math.random() * 15 - 7.5))),
        reqs: [...prev.reqs.slice(1), Math.floor(Math.random() * 80) + 10]
      }));
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const stats = [
    { label: 'Usuarios Activos', value: '24', icon: <Users className="w-5 h-5 text-[#a855f7]" />, trend: '+3 este mes', color: 'purple' },
    { label: 'Equipos Registrados', value: '152', icon: <Server className="w-5 h-5 text-emerald-400" />, trend: '100% Sincronizados', color: 'emerald' },
    { label: 'Carga del Sistema', value: `${Math.round(liveMetrics.cpu)}%`, icon: <Activity className="w-5 h-5 text-amber-400" />, trend: liveMetrics.cpu > 80 ? 'Crítico' : 'Estable', color: 'amber' },
  ];

  const recentActivity = [
    { id: 1, user: 'Dr. Mendoza', action: 'Inició sesión en Terminal 3', time: 'Hace 2 min', type: 'info' },
    { id: 2, user: 'Ing. Ruiz', action: 'Actualizó estado de Bomba de Infusión', time: 'Hace 15 min', type: 'success' },
    { id: 3, user: 'Sistema Central', action: 'Backup diario completado (2.4GB)', time: 'Hace 1 hora', type: 'default' },
    { id: 4, user: 'Admin', action: 'Registró nuevo equipo: Ecógrafo Portátil', time: 'Hace 3 horas', type: 'info' },
    { id: 5, user: 'Red de Sensores', action: 'Alerta de conectividad en Sala 3', time: 'Hace 4 horas', type: 'error' },
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-[#a855f7] tracking-tight uppercase" style={{ fontFamily: 'var(--font-oswald)' }}>
            Panel de Administración
          </h1>
          <p className="text-slate-400 mt-2 font-medium flex items-center gap-2 text-xs tracking-widest uppercase">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Control general del sistema y métricas
          </p>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}
        >
          <div className="bg-[#110121] text-emerald-400 px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.2)] uppercase tracking-widest">
            <Database className="w-4 h-4 animate-pulse" /> Base de Datos Online
          </div>
        </motion.div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
          >
            <Card className={`hover:shadow-[0_0_30px_rgba(168,85,247,0.2)] transition-all duration-500 bg-[#050010] border border-[#a855f7]/20 relative overflow-hidden group`}>
              {/* Glowing orb background effect */}
              <div className={`absolute -top-10 -right-10 w-32 h-32 bg-${stat.color}-500/20 rounded-full blur-[40px] group-hover:bg-${stat.color}-500/40 transition-colors duration-500`} />
              
              <div className="flex items-start justify-between mb-6">
                <div className="p-3 bg-[#110121] border border-[#a855f7]/30 rounded-xl shadow-inner relative z-10">
                  {stat.icon}
                </div>
                <span className={`text-[9px] font-bold uppercase tracking-widest bg-[#110121] border border-${stat.color}-500/30 text-${stat.color}-400 px-3 py-1.5 rounded relative z-10`}>
                  {stat.trend}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{stat.label}</p>
              <p className="text-4xl font-extrabold text-white mt-2 tracking-tight">{stat.value}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* System Load & Metrics */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="shadow-[0_0_30px_rgba(126,34,206,0.1)] border border-[#a855f7]/20 bg-[#050010]/80 backdrop-blur-xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-full h-full bg-[linear-gradient(to_right,#a855f710_1px,transparent_1px),linear-gradient(to_bottom,#a855f710_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

            <div className="flex items-center gap-3 mb-10 relative z-10">
              <div className="p-2 bg-[#110121] rounded-lg border border-indigo-500/30">
                <Zap className="w-6 h-6 text-indigo-400 animate-pulse" />
              </div>
              <h2 className="text-xl font-bold text-white uppercase tracking-wider" style={{ fontFamily: 'var(--font-oswald)' }}>Diagnóstico de Servidores</h2>
            </div>
            
            <div className="space-y-8 relative z-10">
              <div className="bg-[#110121] p-5 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-3 mb-3">
                  <HardDrive className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Almacenamiento Global</span>
                </div>
                <ProgressBar progress={85} showValue colorClass="bg-gradient-to-r from-indigo-600 to-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.5)]" heightClass="h-3" />
              </div>

              <div className="bg-[#110121] p-5 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-3 mb-3">
                  <Network className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Consumo de Red (I/O)</span>
                </div>
                <ProgressBar progress={liveMetrics.bandwidth} showValue colorClass="bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]" heightClass="h-3" />
              </div>

              <div className="bg-[#110121] p-5 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-3 mb-3">
                  <Cpu className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Carga de Procesadores</span>
                </div>
                <ProgressBar progress={liveMetrics.cpu} showValue colorClass={`bg-gradient-to-r shadow-[0_0_10px_currentColor] ${liveMetrics.cpu > 80 ? 'from-rose-600 to-rose-400 text-rose-500' : 'from-amber-600 to-amber-400 text-amber-500'}`} heightClass="h-3" />
              </div>
            </div>

            <div className="mt-10 pt-10 border-t border-[#a855f7]/20 relative z-10">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Peticiones por Minuto (TR)</h3>
                <span className="flex items-center gap-2 text-[10px] text-emerald-400 font-bold tracking-widest"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" /> EN VIVO</span>
              </div>
              
              <div className="h-40 flex items-end justify-between gap-[2px] md:gap-1 bg-[#110121] p-4 rounded-xl border border-slate-800">
                {liveMetrics.reqs.map((height, i) => (
                  <motion.div
                    key={i}
                    layout
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="w-full bg-gradient-to-t from-[#7e22ce] to-[#d8b4fe] rounded-t-sm opacity-80 hover:opacity-100 transition-opacity cursor-crosshair relative group"
                  >
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white text-[#110121] text-[9px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                      {height}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Activity Feed */}
        <Card className="shadow-[0_0_30px_rgba(126,34,206,0.1)] border border-[#a855f7]/20 bg-[#050010] relative overflow-hidden h-[600px] flex flex-col">
          {/* Top fade gradient */}
          <div className="absolute top-20 left-0 w-full h-12 bg-gradient-to-b from-[#050010] to-transparent z-10 pointer-events-none" />
          {/* Bottom fade gradient */}
          <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[#050010] to-transparent z-10 pointer-events-none" />
          
          <div className="relative z-20 flex justify-between items-center mb-6 border-b border-[#a855f7]/20 pb-4">
            <h2 className="text-lg font-bold text-white uppercase tracking-wider" style={{ fontFamily: 'var(--font-oswald)' }}>Feed del Sistema</h2>
            <Badge variant="info" pulse>En vivo</Badge>
          </div>

          <div className="relative flex-1 overflow-y-auto no-scrollbar pb-24 space-y-4">
            <AnimatePresence>
              {recentActivity.map((act, i) => (
                <motion.div
                  key={act.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.15 }}
                  className="flex gap-4 p-4 rounded-2xl bg-[#110121] border border-slate-800 hover:border-[#a855f7]/40 transition-colors group cursor-default"
                >
                  <div className="mt-1">
                    <span className={`w-2.5 h-2.5 rounded-full block ${
                      act.type === 'success' ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.6)]' :
                      act.type === 'error' ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.6)]' :
                      act.type === 'info' ? 'bg-[#a855f7] shadow-[0_0_10px_rgba(168,85,247,0.6)]' :
                      'bg-slate-400 shadow-[0_0_10px_rgba(148,163,184,0.6)]'
                    }`} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-200 group-hover:text-[#d8b4fe] transition-colors">
                      {act.user}
                    </p>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{act.action}</p>
                    <p className="text-[9px] font-bold text-slate-600 mt-2 uppercase tracking-[0.2em]">{act.time}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </Card>

      </div>
    </div>
  );
}

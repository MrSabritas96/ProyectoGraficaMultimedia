"use client";

import React, { useState } from 'react';
import { Card } from '@/shared/components/Card';
import { Carousel3D, Carousel3DItem } from '@/shared/components/Carousel3D';
import { EquipmentDetailModal } from '@/shared/components/EquipmentDetailModal';
import { ProgressBar } from '@/shared/components/ProgressBar';
import { Badge } from '@/shared/components/Badge';
import { Activity, AlertCircle, CheckCircle2, Clock, Wrench, ShieldAlert, Calendar, Users, ChevronLeft, ChevronRight, Loader2, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// New Components
import { CalendarView } from '@/shared/components/CalendarView';
import { CreateOrderModal } from '@/shared/components/modals/CreateOrderModal';
import { ReportModal } from '@/shared/components/modals/ReportModal';
import { EngineerProfileModal } from '@/shared/components/modals/EngineerProfileModal';
import { ProfileModal } from '@/shared/components/modals/ProfileModal';
import { mockDatabase } from '@/shared/data/mockDatabase';

export function JefeDashboard() {
  const [selectedEquipment, setSelectedEquipment] = useState<Carousel3DItem | null>(null);
  
  // Modal states
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);
  const [selectedEngineer, setSelectedEngineer] = useState<string | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);

  // Equipment Data States
  const [equipmentItems, setEquipmentItems] = useState<Carousel3DItem[]>([]);
  const [unidades, setUnidades] = useState<string[]>(['CARGANDO...']);
  const [unidadesStats, setUnidadesStats] = useState<Record<string, number>>({});
  const [activeUnidad, setActiveUnidad] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);

  const getImageUrlForArea = (area: string) => {
    const map: Record<string, string> = {
      'QUIROFANO': 'https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=1000&q=80',
      'IMAGENOLOGIA': 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1000&q=80',
      'CARDIOLOGIA': 'https://images.unsplash.com/photo-1584982751601-97dcc096659c?auto=format&fit=crop&w=1000&q=80',
      'TERAPIA INTENSIVA': 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1000&q=80',
      'EMERGENCIAS': 'https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?auto=format&fit=crop&w=1000&q=80',
      'LABORATORIO': 'https://images.unsplash.com/photo-1579154204601-e1588bc41f47?auto=format&fit=crop&w=1000&q=80'
    };
    return map[area?.toUpperCase()] || 'https://images.unsplash.com/photo-1519494026892-80bbd2d6f0d8?auto=format&fit=crop&w=1000&q=80';
  };

  React.useEffect(() => {
    const fetchEquipment = async () => {
      setIsLoading(true);
      try {
        const url = activeUnidad 
          ? `http://localhost:8000/api/equipment/?unidad=${encodeURIComponent(activeUnidad)}&page=${page}&limit=8`
          : `http://localhost:8000/api/equipment/?page=1&limit=8`;
          
        const { default: Cookies } = await import('js-cookie');
        const token = Cookies.get('token');
        
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        
        if (data.unidades && data.unidades.length > 0) {
          setUnidades(data.unidades);
          if (data.unidades_stats) setUnidadesStats(data.unidades_stats);
          
          if (!activeUnidad) {
            setActiveUnidad(data.unidades[0]);
            return;
          }
        }

        if (data.results) {
          const formattedItems: Carousel3DItem[] = data.results.map((eq: any) => ({
            id: eq.id,
            image: getImageUrlForArea(eq.area),
            title: eq.nombre,
            description: eq.modelo ? `Modelo: ${eq.modelo} | Marca: ${eq.marca || 'N/A'}` : (eq.descripcion || 'Sin descripción disponible'),
            status: eq.estado === 'Activo' ? 'Active' : eq.estado === 'En Mantenimiento' ? 'Warning' : 'Critical',
            ...eq
          }));
          
          formattedItems.sort((a: any, b: any) => (b.falla_activa ? 1 : 0) - (a.falla_activa ? 1 : 0));
          setEquipmentItems(formattedItems);
          setTotalPages(Math.ceil(data.total / data.limit));
        }
      } catch (error) {
        console.error("Error fetching equipment:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    const fetchNotifications = async () => {
      try {
        const { default: Cookies } = await import('js-cookie');
        const token = Cookies.get('token');
        const res = await fetch('http://localhost:8000/api/notifications/', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setNotifications(data.filter((n: any) => !n.leida));
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };
    
    fetchEquipment();
    fetchNotifications();
  }, [activeUnidad, page]);

  const handleNextPage = () => {
    if (page < totalPages) setPage(p => p + 1);
  };

  const handlePrevPage = () => {
    if (page > 1) setPage(p => p - 1);
  };

  const stats = [
    { label: 'Órdenes Activas', value: '12', icon: <Activity className="w-6 h-6 text-[#a855f7]" />, trend: '+2 hoy', color: 'purple' },
    { label: 'Pendientes', value: '5', icon: <Clock className="w-6 h-6 text-amber-500" />, trend: 'Prioridad Alta', color: 'amber' },
    { label: 'Completadas', value: '48', icon: <CheckCircle2 className="w-6 h-6 text-emerald-500" />, trend: 'Este mes', color: 'emerald' },
    { label: 'Urgentes', value: '2', icon: <AlertCircle className="w-6 h-6 text-rose-500" />, trend: 'Crítico', color: 'rose' },
  ];

  // Carousel items now fetched dynamically

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Modals Container */}
      <CreateOrderModal isOpen={isOrderModalOpen} onClose={() => setIsOrderModalOpen(false)} />
      <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
      <ReportModal isOpen={selectedReportId !== null} onClose={() => setSelectedReportId(null)} reportId={selectedReportId || undefined} />
      <EngineerProfileModal isOpen={selectedEngineer !== null} onClose={() => setSelectedEngineer(null)} engineerName={selectedEngineer || undefined} />
      
      {/* Equipment Detail wrapped in our logical state handlers */}
      <EquipmentDetailModal 
        item={selectedEquipment} 
        onClose={() => setSelectedEquipment(null)} 
        onViewReport={(id) => setSelectedReportId(id)}
        onViewEngineerProfile={(name) => setSelectedEngineer(name)}
      />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-[#a855f7] tracking-tight uppercase" style={{ fontFamily: 'var(--font-oswald)' }}>
            Panel de Control Central
          </h1>
          <p className="text-slate-400 mt-2 font-medium flex items-center gap-2 tracking-widest uppercase text-xs">
            <ShieldAlert className="w-4 h-4 text-[#a855f7]" />
            Visión general del estado del equipamiento hospitalario
          </p>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}
          className="flex gap-3"
        >
          <div className="relative">
            <button className="w-12 h-12 rounded-xl bg-[#110121] border border-slate-700 hover:border-[#a855f7]/50 text-slate-300 hover:text-white flex items-center justify-center transition-all shadow-md">
              <Bell className="w-5 h-5" />
            </button>
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center border-2 border-[#050010] shadow-[0_0_10px_rgba(244,63,94,0.6)] animate-pulse">
                {notifications.length}
              </span>
            )}
          </div>
          <button 
            onClick={() => setIsProfileModalOpen(true)}
            className="px-5 py-3 bg-[#110121] border border-slate-700 hover:border-[#a855f7]/50 text-slate-300 hover:text-white rounded-xl font-bold text-sm shadow-md hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all duration-300 flex items-center gap-2 uppercase tracking-wider"
          >
            <Users className="w-4 h-4" /> Mi Perfil
          </button>
          <button 
            onClick={() => window.location.href='/dashboard/jefe/work-orders/new'}
            className="px-6 py-3 bg-gradient-to-r from-[#7e22ce] to-[#4c1d95] text-white rounded-xl font-bold text-sm shadow-[0_0_20px_rgba(126,34,206,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] hover:-translate-y-1 transition-all duration-300 flex items-center gap-2 uppercase tracking-wider"
          >
            <Wrench className="w-4 h-4" /> Generar Orden
          </button>
        </motion.div>
      </div>

      {/* Units Navigation Tabs */}
      <div className="w-full relative">
        <div className="flex items-center justify-between px-2 mb-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Áreas Hospitalarias</h3>
          <span className="text-[10px] text-[#a855f7] font-bold uppercase tracking-widest flex items-center gap-1 bg-[#a855f7]/10 px-3 py-1 rounded-full border border-[#a855f7]/20">
            <ChevronLeft className="w-3 h-3" /> Desliza para ver más <ChevronRight className="w-3 h-3" />
          </span>
        </div>
        <div className="w-full flex overflow-x-auto pb-4 gap-2 scrollbar-hide snap-x">
          {unidades.map((unidad) => (
            <button
              key={unidad}
              onClick={() => { setActiveUnidad(unidad); setPage(1); }}
              className={`snap-start px-6 py-2.5 rounded-full text-xs font-bold tracking-widest uppercase whitespace-nowrap transition-all duration-300 flex items-center gap-2 ${
                activeUnidad === unidad 
                  ? 'bg-gradient-to-r from-[#a855f7] to-[#7e22ce] text-white shadow-[0_0_20px_rgba(168,85,247,0.5)] border border-transparent' 
                  : 'bg-[#110121] text-slate-400 border border-slate-800 hover:border-[#a855f7]/50 hover:text-white'
              }`}
            >
              {unidad}
              {unidadesStats[unidad] > 0 && (
                <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] flex items-center justify-center">
                  {unidadesStats[unidad]}
                </span>
              )}
            </button>
          ))}
        </div>
        {/* Subtle gradient to indicate overflow */}
        <div className="absolute right-0 top-10 bottom-4 w-12 bg-gradient-to-l from-[#020005] to-transparent pointer-events-none" />
      </div>

      {/* Top 3D Carousel Section */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
        className="w-full relative z-10 min-h-[500px]"
      >
        {isLoading ? (
          <div className="flex items-center justify-center w-full h-[500px]">
            <Loader2 className="w-12 h-12 text-[#a855f7] animate-spin" />
          </div>
        ) : equipmentItems.length > 0 ? (
          <Carousel3D items={equipmentItems} onViewEquipment={setSelectedEquipment} autoPlayInterval={6000} />
        ) : (
          <div className="flex items-center justify-center w-full h-[500px] text-slate-500 font-medium tracking-widest uppercase">
            No hay equipos registrados en esta unidad.
          </div>
        )}
      </motion.div>

      {/* Carousel Pagination Controls */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-6 relative z-10 -mt-10 mb-10">
          <button 
            onClick={handlePrevPage}
            disabled={page === 1}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-[#110121] border border-[#a855f7]/30 text-[#a855f7] hover:bg-[#a855f7]/20 hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-[#110121] disabled:hover:text-[#a855f7]"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }).map((_, i) => (
              <span 
                key={i} 
                className={`transition-all duration-300 rounded-full ${page === i + 1 ? 'w-8 h-2 bg-[#a855f7] shadow-[0_0_10px_rgba(168,85,247,0.8)]' : 'w-2 h-2 bg-slate-700'}`} 
              />
            ))}
          </div>

          <button 
            onClick={handleNextPage}
            disabled={page === totalPages}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-[#110121] border border-[#a855f7]/30 text-[#a855f7] hover:bg-[#a855f7]/20 hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-[#110121] disabled:hover:text-[#a855f7]"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-0">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
          >
            <Card className="hover:translate-y-[-6px] transition-transform duration-300 bg-[#050010] border border-[#a855f7]/20 relative overflow-hidden group shadow-[0_0_20px_rgba(168,85,247,0.1)]">
              <div className={`absolute top-0 right-0 w-32 h-32 bg-${stat.color}-500/10 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500`} />
              
              <div className="flex items-start justify-between">
                <div className={`w-12 h-12 rounded-2xl bg-[#110121] border border-[#a855f7]/30 flex items-center justify-center shadow-inner`}>
                  {stat.icon}
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md bg-[#110121] text-${stat.color}-400 border border-${stat.color}-500/30`}>
                  {stat.trend}
                </span>
              </div>
              <div className="mt-6">
                <h3 className="text-4xl font-extrabold text-white tracking-tight">{stat.value}</h3>
                <p className="text-sm font-semibold text-slate-400 mt-1 uppercase tracking-wider">{stat.label}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Calendar & Timelines) */}
        <div className="lg:col-span-2 space-y-8">
          
          <Card className="overflow-hidden border border-[#a855f7]/20 shadow-[0_0_30px_rgba(126,34,206,0.1)] bg-[#050010] p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#110121] rounded-lg border border-[#a855f7]/30">
                  <Clock className="w-6 h-6 text-[#a855f7]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white uppercase tracking-wider">Cronograma Preventivo</h2>
                  <p className="text-xs text-slate-400 font-medium tracking-widest uppercase">Equipos próximos a mantenimiento</p>
                </div>
              </div>
              <button 
                onClick={() => setShowCalendar(!showCalendar)}
                className="text-white text-xs font-bold bg-[#a855f7] hover:bg-[#9333ea] px-4 py-2 rounded-lg transition-colors shadow-[0_0_15px_rgba(168,85,247,0.5)] flex items-center gap-2 uppercase tracking-wider"
              >
                <Calendar className="w-4 h-4" /> {showCalendar ? 'Ocultar Calendario' : 'Ver Calendario'}
              </button>
            </div>
            
            <AnimatePresence mode="wait">
              {showCalendar ? (
                <motion.div 
                  key="calendar"
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: 'auto' }} 
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-8"
                >
                  <CalendarView onEventClick={(id) => setSelectedReportId(id)} />
                </motion.div>
              ) : (
                <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                  {/* Maintenance Schedule Simple View */}
                  <div className="bg-[#110121] p-4 rounded-xl border border-slate-800">
                    <div className="flex justify-between items-end mb-3">
                      <div>
                        <h4 className="text-sm font-bold text-slate-200">Desfibriladores (Urgencias)</h4>
                        <p className="text-xs text-slate-500 font-medium">Faltan 2 días</p>
                      </div>
                      <Badge variant="error" pulse>Crítico</Badge>
                    </div>
                    <ProgressBar progress={85} heightClass="h-2" colorClass="bg-rose-500" />
                  </div>
                  
                  <div className="bg-[#110121] p-4 rounded-xl border border-slate-800">
                    <div className="flex justify-between items-end mb-3">
                      <div>
                        <h4 className="text-sm font-bold text-slate-200">Incubadoras (Neonatología)</h4>
                        <p className="text-xs text-slate-500 font-medium">Faltan 15 días</p>
                      </div>
                      <Badge variant="success">Normal</Badge>
                    </div>
                    <ProgressBar progress={40} heightClass="h-2" colorClass="bg-emerald-500" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>

          {/* New Engineers Efficacy Card */}
          <Card className="border border-[#a855f7]/20 shadow-[0_0_30px_rgba(126,34,206,0.1)] bg-[#050010] p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-[#110121] rounded-lg border border-[#a855f7]/30">
                <Users className="w-6 h-6 text-[#a855f7]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white uppercase tracking-wider">Eficacia de Ingenieros</h2>
                <p className="text-xs text-slate-400 font-medium tracking-widest uppercase">Métricas del personal técnico</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {mockDatabase.engineers.map((eng, idx) => (
                <div key={eng.id} className="bg-[#110121] border border-slate-800 rounded-2xl p-5 hover:border-[#a855f7]/50 transition-colors group cursor-pointer" onClick={() => setSelectedEngineer(eng.name)}>
                  <div className="flex items-center gap-3 mb-4">
                    <img src={eng.photo || 'http://localhost:8000/media/profiles/default.png'} alt={eng.name} className="w-10 h-10 rounded-full border-2 border-slate-700 group-hover:border-[#a855f7] transition-colors object-cover" onError={(e: any) => { e.target.src = 'http://localhost:8000/media/profiles/default.png' }} />
                    <div>
                      <h4 className="text-xs font-bold text-white">{eng.name}</h4>
                      <p className="text-[9px] text-[#a855f7] uppercase tracking-widest">{eng.status}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-[10px] text-slate-400 uppercase font-bold mb-1">
                        <span>Eficacia</span>
                        <span className="text-emerald-400">{eng.stats.efficiency}%</span>
                      </div>
                      <ProgressBar progress={eng.stats.efficiency} colorClass="bg-emerald-500" heightClass="h-1.5" />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 uppercase font-bold">
                      <span>T. Promedio</span>
                      <span className="text-white">{eng.stats.avgTime}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

        </div>

        {/* Right Column (Metrics & Alerts) */}
        <div className="space-y-8">
          <Card className="bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#4c1d95] border border-[#a855f7]/50 text-white overflow-hidden relative shadow-[0_0_40px_rgba(76,29,149,0.3)]">
            <div className="relative z-10 p-2">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-5 h-5 text-[#d8b4fe]" />
                <h3 className="text-lg font-bold uppercase tracking-wider">Rendimiento Operativo</h3>
              </div>
              <p className="text-[#e9d5ff] text-sm mb-6 leading-relaxed font-light">
                El tiempo de inactividad de los equipos se ha reducido un <strong className="text-white text-lg font-bold">15%</strong> este mes.
              </p>
              
              <div className="h-32 flex items-end justify-between gap-2">
                {[40, 55, 45, 90, 65, 80, 50].map((h, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ duration: 1, delay: 0.8 + i * 0.1, type: "spring" }}
                    className="w-full bg-gradient-to-t from-[#a855f7]/50 to-white/80 rounded-t-sm hover:to-white transition-all cursor-pointer relative group"
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-[#312e81] text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      {h}%
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Activity className="w-48 h-48 rotate-12 translate-x-10 -translate-y-10" />
            </div>
          </Card>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.0 }}
          >
            <h3 className="text-sm font-bold text-slate-300 mb-4 px-1 uppercase tracking-widest flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 animate-pulse" /> 
              Alertas en Tiempo Real
            </h3>
            <div className="space-y-4">
              <div className="flex gap-4 p-4 rounded-2xl bg-[#110121] border border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.1)] hover:shadow-[0_0_25px_rgba(244,63,94,0.2)] transition-shadow group cursor-pointer">
                <div className="bg-rose-500/20 p-2 rounded-xl h-fit group-hover:bg-rose-500/30 transition-colors">
                  <AlertCircle className="w-6 h-6 text-rose-500" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-rose-400">Fallo de Presión</h4>
                  <p className="text-xs text-slate-400 font-medium mt-1">Bomba de vacío sala 302 reporta anomalía crítica.</p>
                  <p className="text-[10px] text-rose-500 font-bold mt-2 uppercase tracking-widest">Hace 5 minutos</p>
                </div>
              </div>
              
              <div className="flex gap-4 p-4 rounded-2xl bg-[#110121] border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.1)] hover:shadow-[0_0_25px_rgba(245,158,11,0.2)] transition-shadow group cursor-pointer">
                <div className="bg-amber-500/20 p-2 rounded-xl h-fit group-hover:bg-amber-500/30 transition-colors">
                  <Clock className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-amber-400">Preventivo Vencido</h4>
                  <p className="text-xs text-slate-400 font-medium mt-1">El equipo de Rayos X móvil excedió su límite de uso mensual.</p>
                  <p className="text-[10px] text-amber-500 font-bold mt-2 uppercase tracking-widest">Hace 2 horas</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

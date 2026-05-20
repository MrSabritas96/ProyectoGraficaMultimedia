"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import { Calendar, UserCircle, Wrench, Clock, Search, ArrowLeft, CheckCircle2, ChevronRight, ChevronLeft, MapPin, Activity, Stethoscope, BriefcaseMedical, AlertTriangle, PenTool, ShieldAlert } from 'lucide-react';
import { Card } from '@/shared/components/Card';
import { Badge } from '@/shared/components/Badge';
import { ProgressBar } from '@/shared/components/ProgressBar';
import { Equipment3DViewer } from '@/shared/components/Equipment3DViewer';
import { BigCalendar } from '@/shared/components/BigCalendar';
import Cookies from 'js-cookie';

export default function WorkOrderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hotspotId = searchParams.get('hotspot');
  const equipmentId = searchParams.get('equipmentId');
  
  const [eventData, setEventData] = useState<any | null>(null);
  const [equipmentData, setEquipmentData] = useState<any | null>(null);
  const [availableEngineers, setAvailableEngineers] = useState<any[]>([]);
  const [allEngineers, setAllEngineers] = useState<any[]>([]);
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [allEquipments, setAllEquipments] = useState<any[]>([]);
  const [selectedEngineer, setSelectedEngineer] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [assigned, setAssigned] = useState(false);
  const [loading, setLoading] = useState(true);

  // Carousel state
  const [carouselOffset, setCarouselOffset] = useState(0);

  useEffect(() => {
    fetchInitialData();
  }, [hotspotId, equipmentId]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const token = Cookies.get('token');
      const headers = { 'Authorization': `Bearer ${token}` };
      
      // Fetch Incidents (to see who reported and inspected)
      const incRes = await fetch('http://localhost:8000/api/incidents/', { headers });
      const incData = await incRes.json();

      // Fetch Engineers
      const engRes = await fetch('http://localhost:8000/api/engineers/', { headers });
      const engData = await engRes.json();
      setAllEngineers(engData);
      setAvailableEngineers(engData); 

      // Fetch Equipment
      const eqRes = await fetch('http://localhost:8000/api/equipment/?limit=200', { headers });
      const eqData = await eqRes.json();
      setAllEquipments(eqData.results || []);
      
      let targetEq = null;
      let currentIncident = null;

      if (equipmentId) {
        targetEq = eqData.results.find((e: any) => e.id.toString() === equipmentId);
        // Find the active incident for this equipment
        currentIncident = incData.find((i: any) => i.equipo_id.toString() === equipmentId && (i.estado === 'Inspeccionado' || i.estado === 'Pendiente de Inspeccion'));
      } else if (hotspotId) {
        // If coming from somewhere else that uses hotspotId as incidentId
        currentIncident = incData.find((i: any) => i.id.toString() === hotspotId);
        if (currentIncident) {
          targetEq = eqData.results.find((e: any) => e.id === currentIncident.equipo_id);
        }
      }

      setEventData(currentIncident || null);

      if (targetEq) {
        setEquipmentData(targetEq);
      } else {
        setEquipmentData(null);
        setEventData(null);
      }
      
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleNextEngineers = () => {
    if (carouselOffset < availableEngineers.length - 4) {
      setCarouselOffset(prev => prev + 1);
    }
  };

  const handlePrevEngineers = () => {
    if (carouselOffset > 0) {
      setCarouselOffset(prev => prev - 1);
    }
  };

  const handleAssign = async () => {
    if (!selectedEngineer || (!eventData && !equipmentData)) return;
    setIsAssigning(true);
    
    try {
      const token = Cookies.get('token');
      
      const payload = {
        equipo_id: equipmentData.id,
        incident_id: eventData?.id || null,
        tipo_mantenimiento: 'Correctivo',
        descripcion: eventData?.descripcion || 'Asignación directa desde panel 3D',
        ingeniero_asignado_id: selectedEngineer,
        coordenada_3d_x: eventData?.coordenada_3d_x || 1.2,
        coordenada_3d_y: eventData?.coordenada_3d_y || 0.5,
        coordenada_3d_z: eventData?.coordenada_3d_z || -0.3
      };

      const res = await fetch('http://localhost:8000/api/work-orders/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        setAssigned(true);
        setTimeout(() => {
          router.push('/dashboard/jefe');
        }, 2000);
      } else {
        const errData = await res.json();
        alert('Error: ' + JSON.stringify(errData));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAssigning(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="w-8 h-8 rounded-full border-2 border-[#a855f7] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => equipmentData ? router.push('/dashboard/jefe/work-orders/new') : router.push('/dashboard/jefe')}
            className="w-12 h-12 rounded-full border border-slate-700 bg-[#110121] flex items-center justify-center hover:bg-[#a855f7] hover:border-[#a855f7] transition-all text-slate-300 hover:text-white shadow-[0_0_15px_rgba(168,85,247,0.2)]"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-[#a855f7] tracking-tight uppercase" style={{ fontFamily: 'var(--font-oswald)' }}>
              Ficha Técnica y Orden de Trabajo
              {eventData && <Badge variant="error" className="ml-4 animate-pulse align-middle">URGENTE</Badge>}
            </h1>
            <p className="text-[#d8b4fe] mt-1 font-medium tracking-widest uppercase text-xs">Sistema Central de Asignación • MedTrack</p>
          </div>
        </div>
      </div>

      {!equipmentData ? (
        <div className="bg-[#110121]/50 border border-slate-800 rounded-3xl p-8 min-h-[500px] flex flex-col">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-[#050010] rounded-full flex items-center justify-center mx-auto mb-6 border border-[#a855f7]/30 shadow-[0_0_30px_rgba(168,85,247,0.2)]">
              <Search className="w-8 h-8 text-[#a855f7]" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-oswald)' }}>Buscador de Equipos</h2>
            <p className="text-slate-400 max-w-md mx-auto">
              Selecciona un equipo para ver su ficha técnica, historial de mantenimiento y generar una orden de trabajo.
            </p>
          </div>
          
          <div className="max-w-2xl mx-auto mb-10 w-full relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-500" />
            <input 
              type="text" 
              placeholder="Buscar por nombre, modelo, código o área..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#050010] border border-[#a855f7]/50 rounded-full py-5 pl-16 pr-6 text-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#a855f7] focus:ring-2 focus:ring-[#a855f7] transition-all shadow-[0_0_20px_rgba(168,85,247,0.1)]"
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 flex-1">
            {allEquipments
              .filter(eq => 
                eq.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
                (eq.codigo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                eq.area.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .slice(0, 16)
              .map(eq => (
                <div 
                  key={eq.id} 
                  onClick={() => router.push(`?equipmentId=${eq.id}`)}
                  className="bg-[#050010] border border-slate-800 hover:border-[#a855f7] rounded-2xl p-6 cursor-pointer hover:shadow-[0_0_25px_rgba(168,85,247,0.3)] transition-all duration-300 group hover:-translate-y-1 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#a855f7]/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-[#a855f7]/20 transition-all" />
                  <div className="flex justify-between items-start mb-6 relative z-10">
                    <div className="w-12 h-12 rounded-full bg-[#110121] flex items-center justify-center border border-slate-700 group-hover:border-[#a855f7]/50 transition-colors">
                      <Wrench className="w-6 h-6 text-[#a855f7]" />
                    </div>
                    <Badge variant={eq.estado === 'Activo' ? 'success' : 'warning'}>{eq.estado}</Badge>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 line-clamp-1 relative z-10 group-hover:text-[#e9d5ff] transition-colors">{eq.nombre}</h3>
                  <p className="text-xs text-slate-400 mb-5 relative z-10">{eq.codigo || eq.numero_serie || 'Código N/A'}</p>
                  <div className="bg-[#110121] px-4 py-3 rounded-xl border border-slate-800 flex items-center gap-3 relative z-10">
                    <MapPin className="w-4 h-4 text-[#a855f7]" />
                    <span className="text-[11px] font-bold text-slate-300 uppercase tracking-widest">{eq.area}</span>
                  </div>
                </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* SECTION 1: FICHA TÉCNICA Y VISOR 3D */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Left: Ficha Técnica */}
            <Card className="p-0 overflow-hidden border-[#a855f7]/30 shadow-[0_0_30px_rgba(168,85,247,0.1)] flex flex-col relative">
              <div className="absolute top-0 right-0 w-96 h-96 bg-[#a855f7]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
              
              <div className="bg-[#110121] p-6 border-b border-slate-800 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3 tracking-widest uppercase" style={{ fontFamily: 'var(--font-oswald)' }}>
                  <Wrench className="w-6 h-6 text-[#a855f7]" />
                  Ficha Técnica del Equipo
                </h2>
                <Badge variant={equipmentData.salud_equipo < 40 ? 'error' : 'warning'}>SALUD {equipmentData.salud_equipo}%</Badge>
              </div>
              
              <div className="p-6 flex-1 flex flex-col gap-6 relative z-10">
                {eventData && (
                  <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-xl flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-widest">
                      <ShieldAlert className="w-4 h-4" /> Alerta Activa Relacionada
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-[#110121] p-3 rounded-xl border border-slate-800 shadow-inner">
                        <p className="text-[9px] text-slate-500 uppercase font-bold tracking-widest mb-1">Reportado Por</p>
                        <p className="text-sm font-bold text-white">{eventData.doctor_nombre || 'Sistema Externo'}</p>
                      </div>
                      <div className="bg-[#110121] p-3 rounded-xl border border-slate-800 shadow-inner">
                        <p className="text-[9px] text-slate-500 uppercase font-bold tracking-widest mb-1">Inspección Preliminar</p>
                        <p className="text-sm font-bold text-[#a855f7]">{eventData.ingeniero_asignado_nombre || 'No asignado / Directo'}</p>
                      </div>
                    </div>
                    {eventData.reporte_preliminar_ingeniero && (
                      <div className="bg-[#110121] p-3 rounded-xl border border-slate-800 shadow-inner">
                        <p className="text-[9px] text-slate-500 uppercase font-bold tracking-widest mb-1">Nota Técnica del Ingeniero</p>
                        <p className="text-sm text-slate-300 italic">"{eventData.reporte_preliminar_ingeniero}"</p>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="flex gap-6">
                  <div className="w-1/3">
                    <img src={equipmentData.image || 'https://images.unsplash.com/photo-1519494026892-80bbd2d6f0d8?auto=format&fit=crop&w=1000&q=80'} alt={equipmentData.nombre} className="w-full aspect-square object-cover rounded-xl border border-slate-700 shadow-lg" />
                  </div>
                  <div className="w-2/3 space-y-4">
                    <div>
                      <p className="text-[10px] text-[#a855f7] font-bold tracking-widest uppercase mb-1">Nombre y Modelo</p>
                      <p className="text-2xl font-bold text-white">{equipmentData.nombre}</p>
                      <p className="text-sm text-slate-400">{equipmentData.marca || 'N/A'} - {equipmentData.modelo || 'N/A'}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-[#110121] p-3 rounded-xl border border-slate-800">
                        <p className="text-[10px] text-slate-500 uppercase flex items-center gap-1 mb-1"><MapPin className="w-3 h-3"/> Ubicación</p>
                        <p className="text-sm font-bold text-white">{equipmentData.area}</p>
                      </div>
                      <div className="bg-[#110121] p-3 rounded-xl border border-slate-800">
                        <p className="text-[10px] text-slate-500 uppercase flex items-center gap-1 mb-1"><Stethoscope className="w-3 h-3"/> Estado Actual</p>
                        <p className="text-sm font-bold text-emerald-400">{equipmentData.estado}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 border-t border-b border-slate-800 py-6">
                  <div className="text-center">
                    <Clock className="w-6 h-6 text-[#a855f7] mx-auto mb-2 opacity-80" />
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Adquisición</p>
                    <p className="text-lg font-bold text-white mt-1">{equipmentData.fecha_adquisicion || 'Desconocido'}</p>
                    <p className="text-[9px] text-slate-500 mt-1">Costo: ${equipmentData.costo || 'N/A'}</p>
                  </div>
                  <div className="text-center border-l border-r border-slate-800 px-2">
                    <BriefcaseMedical className="w-6 h-6 text-[#a855f7] mx-auto mb-2 opacity-80" />
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Proveedor</p>
                    <p className="text-sm font-bold text-emerald-400 mt-2 line-clamp-2">{equipmentData.proveedor || 'N/A'}</p>
                  </div>
                  <div className="text-center">
                    <Activity className="w-6 h-6 text-[#a855f7] mx-auto mb-2 opacity-80" />
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Vida Útil</p>
                    <p className="text-lg font-bold text-white mt-1">{equipmentData.vida_util || 'N/A'}</p>
                    <ProgressBar progress={equipmentData.salud_equipo || 100} heightClass="h-1 mt-2" colorClass="bg-gradient-to-r from-emerald-500 to-amber-500" animated={false} />
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-[#d8b4fe] uppercase tracking-widest mb-3 flex items-center gap-2">
                    <PenTool className="w-4 h-4" />
                    Descripción de Falla Reportada
                  </h3>
                  <div className="bg-[#050010] p-4 rounded-xl border border-rose-500/30 text-slate-300 text-sm">
                    {eventData ? eventData.descripcion : (equipmentData.falla_descripcion || equipmentData.observaciones || 'No hay fallas reportadas activas.')}
                  </div>
                </div>

              </div>
            </Card>

            {/* Right: 3D Viewer */}
            <Card className="p-0 overflow-hidden border-[#a855f7]/30 shadow-[0_0_30px_rgba(168,85,247,0.1)] flex flex-col min-h-[600px]">
              <div className="bg-[#110121] p-6 border-b border-slate-800 flex items-center justify-between z-10 relative">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3 tracking-widest uppercase" style={{ fontFamily: 'var(--font-oswald)' }}>
                  <Activity className={`w-6 h-6 ${(eventData || equipmentData?.falla_activa) ? 'text-rose-500 animate-pulse' : 'text-[#a855f7]'}`} />
                  Visor de Falla 3D
                </h2>
                <span className="text-xs font-mono text-slate-400 bg-[#050010] px-3 py-1 rounded-full border border-slate-800">
                  COORD: X:{eventData?.coordenada_3d_x || equipmentData?.falla_coordenada_x || 0} Y:{eventData?.coordenada_3d_y || equipmentData?.falla_coordenada_y || 0} Z:{eventData?.coordenada_3d_z || equipmentData?.falla_coordenada_z || 0}
                </span>
              </div>
              <div className="flex-1 relative bg-black">
                {equipmentData.ruta_modelo_3d ? (
                  <Equipment3DViewer 
                    modelUrl={equipmentData.ruta_modelo_3d}
                    hotspots={[
                      ...((eventData || equipmentData?.falla_activa) ? [{
                        id: 1, 
                        position: [eventData?.coordenada_3d_x || equipmentData?.falla_coordenada_x || 0, eventData?.coordenada_3d_y || equipmentData?.falla_coordenada_y || 0, eventData?.coordenada_3d_z || equipmentData?.falla_coordenada_z || 0],
                        color: '#f43f5e',
                        pulse: true
                      }] : []),
                      ...(equipmentData?.mantenimientos_previos ? 
                        (typeof equipmentData.mantenimientos_previos === 'string' 
                          ? JSON.parse(equipmentData.mantenimientos_previos) 
                          : equipmentData.mantenimientos_previos)
                        .filter((h: any) => h.position3D && Array.isArray(h.position3D))
                        .map((h: any, index: number) => ({
                          id: -(index + 1),
                          position: [h.position3D[0], h.position3D[1], h.position3D[2]],
                          color: '#10b981',
                          pulse: false
                        })) 
                      : [])
                    ]}
                    isActive={true}
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 z-20">
                    <div className="w-24 h-24 border border-dashed border-[#a855f7]/50 rounded-full flex items-center justify-center mb-4 relative">
                      <div className="absolute inset-0 border border-[#a855f7]/20 rounded-full animate-ping" />
                      <AlertCircle className="w-8 h-8 text-[#a855f7]/50" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-300 uppercase tracking-widest" style={{ fontFamily: 'var(--font-oswald)' }}>
                      Modelo 3D no cargado
                    </h3>
                  </div>
                )}
              </div>
              <div className={`bg-[#110121] p-4 border-t text-sm font-medium flex items-start gap-3 ${(eventData || equipmentData?.falla_activa) ? 'border-rose-500/30 text-rose-200' : 'border-[#a855f7]/30 text-[#e9d5ff]'}`}>
                <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${(eventData || equipmentData?.falla_activa) ? 'text-rose-500' : 'text-[#a855f7]'}`} />
                <div>
                  <span className={`font-bold block mb-1 ${(eventData || equipmentData?.falla_activa) ? 'text-rose-400' : 'text-[#a855f7]'}`}>
                    {(eventData || equipmentData?.falla_activa) ? 'PUNTO DE FALLA MARCADO:' : 'ESTADO NORMAL:'}
                  </span>
                  {(eventData || equipmentData?.falla_activa) ? 'El área resaltada en rojo indica el componente donde se reportó la anomalía inicial.' : 'No hay fallas reportadas activas en el modelo digital.'}
                </div>
              </div>
            </Card>

          </div>

          {/* SECTION 2: BIG CALENDAR */}
          <div className="w-full">
            <BigCalendar 
              orders={allOrders} 
              engineers={allEngineers} 
              currentMonth={new Date().getMonth()}
              currentYear={new Date().getFullYear()}
            />
          </div>

          {/* SECTION 3: MULTI-CAROUSEL DE INGENIEROS */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-white flex items-center gap-3 tracking-tight" style={{ fontFamily: 'var(--font-oswald)' }}>
                  <UserCircle className="w-8 h-8 text-[#a855f7]" />
                  ASIGNACIÓN DE PERSONAL
                </h2>
                <p className="text-slate-400 mt-1">Selecciona al ingeniero de campo para procesar esta orden.</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={handlePrevEngineers}
                  disabled={carouselOffset === 0}
                  className="w-10 h-10 rounded-xl bg-[#110121] border border-slate-700 flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#a855f7] transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button 
                  onClick={handleNextEngineers}
                  disabled={carouselOffset >= availableEngineers.length - 4}
                  className="w-10 h-10 rounded-xl bg-[#110121] border border-slate-700 flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#a855f7] transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="relative w-full overflow-hidden">
              <motion.div 
                className="flex gap-6"
                initial={false}
                animate={{ x: `calc(-${carouselOffset * 25}% - ${carouselOffset * 1.5}rem)` }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                {availableEngineers.map((engineer, idx) => (
                  <div 
                    key={engineer.id || engineer.codigo_unico || idx}
                    className={`w-1/4 flex-shrink-0 cursor-pointer transition-all duration-300 ${
                      selectedEngineer === engineer.id ? 'scale-105' : 'hover:scale-105 opacity-80 hover:opacity-100'
                    }`}
                    onClick={() => setSelectedEngineer(engineer.id)}
                  >
                    <div className={`h-full bg-[#110121] border-2 rounded-2xl p-6 relative overflow-hidden flex flex-col items-center text-center shadow-xl ${
                      selectedEngineer === engineer.id 
                        ? 'border-[#a855f7] shadow-[0_0_30px_rgba(168,85,247,0.3)] bg-gradient-to-b from-[#110121] to-[#2b084d]' 
                        : 'border-slate-800'
                    }`}>
                      {selectedEngineer === engineer.id && (
                        <div className="absolute top-4 right-4 text-[#a855f7]">
                          <CheckCircle2 className="w-6 h-6 drop-shadow-[0_0_10px_rgba(168,85,247,0.8)]" />
                        </div>
                      )}
                      
                      <div className="relative mb-4">
                        <img 
                          src={engineer.photo ? (engineer.photo.startsWith('http') ? engineer.photo : `http://localhost:8000${engineer.photo}`) : 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'} 
                          alt={engineer.first_name || 'Ingeniero'} 
                          className={`w-28 h-28 rounded-full border-4 object-cover transition-colors ${
                            selectedEngineer === engineer.id ? 'border-[#a855f7]' : 'border-slate-700'
                          }`}
                        />
                        <div className="absolute bottom-1 right-1 w-6 h-6 bg-emerald-500 border-2 border-[#110121] rounded-full" />
                      </div>
                      
                      <Badge variant="primary" className="mb-2 font-mono text-xs">{engineer.codigo_unico}</Badge>
                      <h3 className="text-xl font-bold text-white mb-1 line-clamp-1">{engineer.first_name} {engineer.last_name}</h3>
                      <p className="text-sm text-[#d8b4fe] font-medium mb-6 line-clamp-1">{engineer.especialidades?.[0]?.nombre || 'Ingeniero Biomédico'}</p>

                      <div className="w-full grid grid-cols-2 gap-3 text-left mt-auto">
                        <div className="bg-[#050010] p-3 rounded-xl border border-slate-800/50">
                          <p className="text-[9px] text-slate-500 uppercase tracking-widest">Eficacia</p>
                          <p className="text-lg font-bold text-emerald-400">{90 + (engineer.id % 10)}%</p>
                        </div>
                        <div className="bg-[#050010] p-3 rounded-xl border border-slate-800/50">
                          <p className="text-[9px] text-slate-500 uppercase tracking-widest">Especialidades</p>
                          <p className="text-lg font-bold text-white">{engineer.especialidades?.length || 1}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Fill empty spots if less than 4 engineers to keep layout intact */}
                {availableEngineers.length < 4 && Array.from({ length: 4 - availableEngineers.length }).map((_, i) => (
                  <div key={`empty-${i}`} className="w-1/4 flex-shrink-0 opacity-20 pointer-events-none">
                    <div className="h-full border-2 border-dashed border-slate-700 rounded-2xl p-6 flex items-center justify-center min-h-[300px]">
                      <UserCircle className="w-16 h-16 text-slate-600" />
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Sticky Action Bar */}
            <div className={`fixed bottom-0 left-0 lg:left-64 right-0 p-6 z-50 transition-transform duration-500 ${
              selectedEngineer ? 'translate-y-0' : 'translate-y-full'
            }`}>
              <div className="max-w-[1600px] mx-auto bg-[#110121]/90 backdrop-blur-xl border border-[#a855f7]/50 rounded-2xl p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.8)] flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#a855f7]/20 flex items-center justify-center border border-[#a855f7]/50">
                    <CheckCircle2 className="w-6 h-6 text-[#a855f7]" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 font-medium">Ingeniero Seleccionado</p>
                    <p className="text-xl font-bold text-white">
                      {selectedEngineer ? (() => {
                        const eng = availableEngineers.find(e => e.id === selectedEngineer);
                        return eng ? `${eng.first_name} ${eng.last_name}` : '';
                      })() : ''}
                    </p>
                  </div>
                </div>
                <button
                  disabled={isAssigning || assigned}
                  onClick={handleAssign}
                  className={`px-12 py-4 rounded-xl font-bold text-lg flex items-center gap-3 transition-all ${
                    assigned 
                      ? 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                      : 'bg-[#a855f7] hover:bg-[#9333ea] text-white shadow-[0_0_30px_rgba(168,85,247,0.6)] hover:scale-105'
                  }`}
                >
                  {isAssigning ? (
                    <>
                      <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      Procesando...
                    </>
                  ) : assigned ? (
                    <>
                      <CheckCircle2 className="w-6 h-6" />
                      ¡Orden Asignada!
                    </>
                  ) : (
                    <>
                      Confirmar Asignación de Trabajo
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, User as UserIcon, Calendar, Clock, Wrench, AlertCircle, ChevronRight, CheckCircle2, ArrowLeft, Battery, Zap, ShieldAlert } from 'lucide-react';
import { Carousel3DItem } from './Carousel3D';
import { Badge } from './Badge';
import { Equipment3DViewer, Hotspot3D } from './Equipment3DViewer';

interface Hotspot {
  id: number;
  position3D: [number, number, number];
  title: string;
  description: string;
  date: string;
  engineer: string;
  engineerPhoto?: string;
  status: 'fixed' | 'pending';
  details?: {
    reportado_por?: string;
    fecha_ingreso?: string;
    fecha_resolucion?: string;
    accion_tomada?: string;
    aprobado_por?: string;
  };
}

interface EquipmentDetailModalProps {
  item: Carousel3DItem | null;
  onClose: () => void;
  onViewReport?: (hotspotId: number) => void;
  onViewEngineerProfile?: (engineerName: string) => void;
}

export const EquipmentDetailModal: React.FC<EquipmentDetailModalProps> = ({ item, onClose, onViewReport, onViewEngineerProfile }) => {
  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null);
  const [activeTab, setActiveTab] = useState<'ficha' | 'historial'>('ficha');
  const [selectedEngineer, setSelectedEngineer] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setActiveHotspot(null);
  }, [item]);
  
  const hotspots: Hotspot[] = useMemo(() => {
    if (!item?.mantenimientos_previos || !Array.isArray(item.mantenimientos_previos)) return [];
    return item.mantenimientos_previos;
  }, [item]);

  const hotspots3D: Hotspot3D[] = useMemo(() => {
    const list: Hotspot3D[] = hotspots.map(h => ({
      id: h.id,
      position: h.position3D,
      color: h.status === 'fixed' ? '#10b981' : '#f43f5e',
      pulse: h.status === 'pending'
    }));

    if (item?.falla_activa) {
      const alreadyHasPending = hotspots.some(h => h.status === 'pending');
      if (!alreadyHasPending) {
        list.push({
          id: 999,
          position: [item.falla_coordenada_x || 0, item.falla_coordenada_y || 0, item.falla_coordenada_z || 0],
          color: '#f43f5e',
          pulse: true
        });
      }
    }
    return list;
  }, [hotspots, item]);

  const handleHotspotClick = (hs: Hotspot) => {
    setActiveHotspot(hs === activeHotspot ? null : hs);
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setActiveHotspot(null);
    }
  };

  const handleOpenPdf = () => {
    const blob = new Blob(['Mock PDF Content - Manual de Instrucciones'], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {item && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-[#020005]/90 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-[#0a001a] border border-[#a855f7]/30 rounded-3xl shadow-[0_0_50px_rgba(126,34,206,0.3)] w-full max-w-6xl h-[85vh] flex flex-col md:flex-row overflow-hidden relative"
            onClick={e => e.stopPropagation()}
          >
            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 z-[999] w-10 h-10 bg-[#110121]/80 hover:bg-rose-500 hover:border-rose-400 border border-[#a855f7]/30 rounded-full flex items-center justify-center text-slate-300 hover:text-white transition-all backdrop-blur-md shadow-lg group"
              title="Cerrar (X)"
            >
              <X className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </button>

            {/* Left Side: 3D Interactive Viewer */}
            <div className="w-full md:w-[50%] h-[40vh] md:h-full relative bg-[#050010] border-b md:border-b-0 md:border-r border-[#a855f7]/20 overflow-hidden" onClick={handleContainerClick}>
              
              <AnimatePresence>
                {activeHotspot && (
                  <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    onClick={(e) => { e.stopPropagation(); setActiveHotspot(null); }}
                    className="absolute top-4 left-4 z-40 bg-[#110121]/80 hover:bg-[#a855f7] border border-[#a855f7]/50 px-4 py-2 rounded-full flex items-center gap-2 text-white font-bold text-xs tracking-wider uppercase transition-all backdrop-blur-md shadow-lg"
                  >
                    <ArrowLeft className="w-4 h-4" /> Volver
                  </motion.button>
                )}
              </AnimatePresence>

              <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-[#0a001a] to-[#110121]">
                {item.ruta_modelo_3d ? (
                  <Equipment3DViewer 
                    modelUrl={item.ruta_modelo_3d}
                    hotspots={hotspots3D} 
                    isActive={!!activeHotspot}
                    onHotspotClick={(id) => {
                      let hs = hotspots.find(h => h.id === id);
                      if (!hs && id === 999 && item) {
                        hs = {
                          id: 999,
                          position3D: [item.falla_coordenada_x || 0, item.falla_coordenada_y || 0, item.falla_coordenada_z || 0],
                          title: "Alerta de Sistema",
                          description: item.falla_descripcion || "Falla reportada en el equipo.",
                          date: "Reciente",
                          engineer: "Sistema Automático",
                          status: 'pending',
                          details: {
                            accion_tomada: "Requiere inspección urgente por un ingeniero.",
                            aprobado_por: "Pendiente"
                          }
                        };
                      }
                      if (hs) handleHotspotClick(hs);
                    }} 
                  />
                ) : (
                  <div className="absolute inset-0 w-full h-full">
                    <img 
                      src={item.foto ? `http://localhost:8000${item.foto}` : (item.image || 'https://images.unsplash.com/photo-1519494026892-80bbd2d6f0d8?auto=format&fit=crop&w=1000&q=80')} 
                      alt={item.nombre} 
                      className="w-full h-full object-cover opacity-60" 
                    />
                    <div className="absolute inset-0 bg-[#0a001a]/85 backdrop-blur-[2px] flex flex-col items-center justify-center text-center p-8 z-20">
                      <h3 className="text-2xl font-bold text-white uppercase tracking-widest font-oswald" style={{ fontFamily: 'var(--font-oswald)' }}>
                        Modelo 3D No Disponible
                      </h3>
                      <p className="text-slate-400 mt-2 max-w-md text-xs font-medium">
                        Visualizando imagen 2D de referencia. El gemelo digital de este equipo no está cargado en el sistema.
                      </p>
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#020005] via-transparent to-transparent pointer-events-none" />
              </div>

              <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none transition-opacity duration-300 ${activeHotspot ? 'opacity-0' : 'opacity-100'}`}>
                <div className="bg-[#110121]/80 backdrop-blur-md border border-[#a855f7]/30 px-6 py-2 rounded-full text-xs text-[#e9d5ff] font-medium tracking-widest flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  Interactúa con los puntos para ver detalles
                </div>
              </div>

              <AnimatePresence>
                {activeHotspot && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="absolute bottom-6 left-6 right-6 bg-[#110121]/90 backdrop-blur-xl border border-[#a855f7]/50 p-6 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)]"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        {activeHotspot.status === 'fixed' ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <AlertCircle className="w-5 h-5 text-rose-500" />}
                        {activeHotspot.title}
                      </h3>
                      <Badge variant={activeHotspot.status === 'fixed' ? 'success' : 'error'}>
                        {activeHotspot.status === 'fixed' ? 'Reparado' : 'Requiere Atención'}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-300 mb-4">{activeHotspot.description}</p>
                    
                    {activeHotspot.details && (
                      <div className="bg-[#050010]/50 border border-slate-700 p-3 rounded-lg mb-4 space-y-2">
                        {activeHotspot.details.reportado_por && (
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-500 uppercase font-bold">Reportado por:</span>
                            <span className="text-slate-300">{activeHotspot.details.reportado_por}</span>
                          </div>
                        )}
                        {activeHotspot.details.accion_tomada && (
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-500 uppercase font-bold">Acción Tomada:</span>
                            <span className="text-slate-300 text-right max-w-[60%]">{activeHotspot.details.accion_tomada}</span>
                          </div>
                        )}
                        {activeHotspot.details.aprobado_por && (
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-500 uppercase font-bold">Aprobado por:</span>
                            <span className="text-slate-300">{activeHotspot.details.aprobado_por}</span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between border-t border-slate-700 pt-4 mt-2">
                      <div className="flex items-center gap-3">
                        {activeHotspot.engineerPhoto ? (
                          <img src={activeHotspot.engineerPhoto} alt="Eng" className="w-8 h-8 rounded-full border border-slate-600" />
                        ) : (
                          <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center border border-slate-600"><UserIcon className="w-4 h-4 text-slate-400" /></div>
                        )}
                        <div>
                          <p className="text-xs font-bold text-slate-200">{activeHotspot.engineer}</p>
                          <p className="text-[10px] text-slate-500">{activeHotspot.date}</p>
                        </div>
                      </div>
                      {activeHotspot.status === 'fixed' ? (
                        <button 
                          onClick={() => onViewReport && onViewReport(activeHotspot.id)}
                          className="text-xs font-bold text-[#a855f7] hover:text-[#d8b4fe] transition-colors bg-[#a855f7]/10 px-3 py-1.5 rounded-lg border border-[#a855f7]/20"
                        >
                          Ver Reporte Completo
                        </button>
                      ) : (
                        <button 
                          onClick={() => window.location.href = `/dashboard/jefe/work-orders/new?equipmentId=${item.id}`}
                          className="text-xs font-bold text-white hover:text-white transition-all bg-gradient-to-r from-rose-600 to-rose-500 px-4 py-2 rounded-lg shadow-[0_0_15px_rgba(244,63,94,0.4)] hover:shadow-[0_0_25px_rgba(244,63,94,0.6)] hover:-translate-y-0.5 uppercase tracking-wider flex items-center gap-2"
                        >
                          Hacer Mantenimiento
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right Side: Information Panels */}
            <div className="w-full md:w-[50%] h-full flex flex-col bg-[#050010] relative">
              
              {/* Header / Tabs */}
              <div className="p-6 pb-0 border-b border-[#a855f7]/20 relative z-10 bg-[#050010]">
                <Badge variant={
                  item.estado === 'Activo' ? 'success' : item.estado === 'Dado de Baja' ? 'error' : 'warning'
                } className="mb-3">
                  Estado: {item.estado || item.status}
                </Badge>
                <h2 className="text-3xl font-extrabold text-white mb-6" style={{ fontFamily: 'var(--font-oswald)' }}>{item.nombre || item.title}</h2>
                
                <div className="flex gap-6">
                  <button 
                    onClick={() => setActiveTab('ficha')}
                    className={`pb-3 text-sm font-bold uppercase tracking-wider transition-colors relative ${activeTab === 'ficha' ? 'text-[#a855f7]' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    Ficha Técnica Completa
                    {activeTab === 'ficha' && <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 w-full h-0.5 bg-[#a855f7] shadow-[0_0_10px_rgba(168,85,247,0.5)]" />}
                  </button>
                  <button 
                    onClick={() => setActiveTab('historial')}
                    className={`pb-3 text-sm font-bold uppercase tracking-wider transition-colors relative ${activeTab === 'historial' ? 'text-[#a855f7]' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    Historial & Cronograma
                    {activeTab === 'historial' && <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 w-full h-0.5 bg-[#a855f7] shadow-[0_0_10px_rgba(168,85,247,0.5)]" />}
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar relative z-0">
                
                {/* Ficha Técnica Tab */}
                {activeTab === 'ficha' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                    
                    {/* General Specs */}
                    <div className="bg-[#110121] border border-slate-800 rounded-xl p-5">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Información General</h4>
                      <div className="grid grid-cols-2 gap-y-4 gap-x-4">
                        <div><p className="text-[10px] text-slate-500 uppercase">Marca</p><p className="text-sm text-slate-200 font-medium">{item.marca || 'No registrada'}</p></div>
                        <div><p className="text-[10px] text-slate-500 uppercase">Modelo</p><p className="text-sm text-slate-200 font-medium">{item.modelo || 'No registrado'}</p></div>
                        <div><p className="text-[10px] text-slate-500 uppercase">Número de Serie</p><p className="text-sm text-slate-200 font-medium">{item.numero_serie || item.codigo_interno || 'N/A'}</p></div>
                        <div><p className="text-[10px] text-slate-500 uppercase">Ubicación</p><p className="text-sm text-slate-200 font-medium">{item.area}</p></div>
                      </div>
                    </div>
                    
                    {/* Description */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Descripción del Equipo</h4>
                      <p className="text-sm text-slate-300 leading-relaxed bg-[#110121]/50 p-4 rounded-xl border border-slate-800/50">
                        {item.descripcion || item.description || 'Sin descripción disponible para este equipo.'}
                        {item.caracteristicas && item.caracteristicas !== 'NaN' && (
                          <span className="block mt-2 font-medium text-[#e9d5ff]">{item.caracteristicas}</span>
                        )}
                      </p>
                    </div>

                    {/* Financial & Lifecycle */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2"><Battery className="w-4 h-4 text-emerald-400" /> Ciclo de Vida y Finanzas</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="bg-[#110121] p-4 rounded-xl border border-slate-800">
                          <p className="text-[10px] text-slate-500 uppercase">Costo Adquisición</p>
                          <p className="text-lg text-emerald-400 font-bold">{item.costo ? `$${Number(item.costo).toLocaleString()}` : 'No Registrado'}</p>
                        </div>
                        <div className="bg-[#110121] p-4 rounded-xl border border-slate-800">
                          <p className="text-[10px] text-slate-500 uppercase">Fecha Adquisición</p>
                          <p className="text-sm text-slate-200 font-bold mt-1">{item.fecha_adquisicion ? new Date(item.fecha_adquisicion).toLocaleDateString() : 'Desconocida'}</p>
                        </div>
                        <div className="bg-[#110121] p-4 rounded-xl border border-slate-800">
                          <p className="text-[10px] text-slate-500 uppercase">Vida Útil Estimada</p>
                          <p className="text-sm text-slate-200 font-bold mt-1">{item.vida_util || '10 años (Estándar)'}</p>
                        </div>
                        <div className="col-span-2 md:col-span-3 bg-[#110121] p-4 rounded-xl border border-slate-800">
                          <p className="text-[10px] text-slate-500 uppercase">Proveedor Oficial</p>
                          <p className="text-sm text-[#e9d5ff] font-bold mt-1">{item.proveedor || 'Distribuidor Nacional Autorizado'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Technical Specifications */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2"><Zap className="w-4 h-4 text-amber-400" /> Especificaciones de Ingeniería</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#110121]/50 p-4 rounded-xl border border-slate-800/50">
                          <p className="text-[10px] text-slate-500 uppercase">Requisitos Eléctricos</p>
                          <p className="text-sm text-amber-300 font-medium mt-1">{item.requisitos_energia || '220V / 60Hz - Consumo Promedio 1.2kW/h'}</p>
                        </div>
                        <div className="bg-[#110121]/50 p-4 rounded-xl border border-slate-800/50">
                          <p className="text-[10px] text-slate-500 uppercase">Dimensiones & Peso</p>
                          <p className="text-sm text-slate-300 font-medium mt-1">{item.dimensiones || 'Estándar ISO-9001'} | {item.peso || 'N/A kg'}</p>
                        </div>
                        <div className="col-span-2 bg-[#110121]/50 p-4 rounded-xl border border-slate-800/50">
                          <p className="text-[10px] text-slate-500 uppercase">Materiales y Fabricación</p>
                          <p className="text-sm text-slate-300 font-medium mt-1">{item.materiales || 'Aleaciones de grado médico y polímeros antibacterianos de alta resistencia.'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Safety & Compliance */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-blue-400" /> Seguridad y Normativas</h4>
                      <div className="space-y-4">
                        <div className="flex gap-4 items-center bg-[#110121] p-4 rounded-xl border border-blue-900/50">
                          <div className="p-3 bg-blue-900/30 rounded-full"><CheckCircle2 className="w-6 h-6 text-blue-400" /></div>
                          <div>
                            <p className="text-sm font-bold text-blue-300">Certificaciones Clínicas Vigentes</p>
                            <p className="text-xs text-slate-400 mt-1">{item.certificaciones || 'FDA Approved, CE Mark (Class IIb), ISO 13485:2016'}</p>
                          </div>
                        </div>
                        <div className="flex gap-4 items-center bg-[#110121] p-4 rounded-xl border border-slate-800">
                          <div className="p-3 bg-slate-800 rounded-full"><AlertCircle className="w-6 h-6 text-slate-400" /></div>
                          <div>
                            <p className="text-sm font-bold text-slate-300">Condiciones Ambientales Requeridas</p>
                            <p className="text-xs text-slate-400 mt-1">{item.condiciones_uso || 'Temperatura: 15°C - 30°C | Humedad: 20% - 80% (sin condensación)'}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={handleOpenPdf}
                      className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-slate-800 to-slate-900 hover:from-[#7e22ce]/20 hover:to-[#4c1d95]/20 border border-slate-700 hover:border-[#a855f7]/50 text-white p-4 rounded-xl transition-all duration-300"
                    >
                      <FileText className="w-5 h-5 text-[#a855f7]" />
                      <span className="font-bold tracking-wide">Abrir Manual de Instrucciones (PDF)</span>
                    </button>
                  </motion.div>
                )}

                {/* Historial & Cronograma Tab */}
                {activeTab === 'historial' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                    
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2"><Calendar className="w-4 h-4" /> Cronograma de Mantenimiento</h4>
                        <span className="text-[10px] text-[#a855f7] font-bold bg-[#7e22ce]/20 px-2 py-1 rounded">2026</span>
                      </div>
                      
                      <div className="bg-[#110121] border border-slate-800 rounded-xl p-4">
                        <div className="flex justify-between text-[8px] text-slate-500 uppercase font-bold mb-2">
                          <span>Ene</span><span>Feb</span><span>Mar</span><span>Abr</span><span>May</span><span>Jun</span>
                        </div>
                        <div className="h-4 w-full bg-slate-900 rounded-full overflow-hidden flex relative">
                          <div className="h-full w-[15%] bg-emerald-500/20 border-r border-slate-800" />
                          <div className="h-full w-[18%] bg-[#a855f7]/80 relative group cursor-pointer">
                            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <div className="h-full w-[20%] bg-emerald-500/20 border-r border-slate-800 border-l" />
                          <div className="h-full w-[8%] bg-rose-500/80 animate-pulse relative group cursor-pointer" />
                          <div className="h-full flex-1 bg-slate-800/50" />
                          
                          <div className="absolute top-0 bottom-0 w-0.5 bg-white left-[45%] shadow-[0_0_5px_white] z-10" />
                        </div>
                        <div className="flex justify-center mt-3 gap-4 text-[10px] font-medium text-slate-400">
                          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#a855f7]" /> Preventivo</span>
                          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500" /> Correctivo</span>
                          <span className="flex items-center gap-1"><span className="w-0.5 h-2 bg-white" /> Hoy</span>
                        </div>
                      </div>
                    </div>

                    <div className="relative border-l border-slate-800 ml-3 pl-6 space-y-6">
                      {hotspots.length > 0 ? hotspots.map((hs, i) => (
                        <div key={i} className="relative">
                          <div className={`absolute -left-[29px] top-1 w-3 h-3 rounded-full border-2 border-[#050010] ${hs.status === 'fixed' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          <div className="mb-1 flex items-center justify-between">
                            <h5 className="text-sm font-bold text-slate-200">{hs.title}</h5>
                            <span className="text-[10px] text-slate-500 font-bold">{hs.date}</span>
                          </div>
                          <p className="text-xs text-slate-400 mb-3">{hs.description}</p>
                          <button 
                            onClick={() => setSelectedEngineer(selectedEngineer === hs.engineer ? null : hs.engineer)}
                            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-[#a855f7]/50 rounded-full pr-4 p-1 transition-colors"
                          >
                            {hs.engineerPhoto ? (
                              <img src={hs.engineerPhoto} alt={hs.engineer} className="w-6 h-6 rounded-full" />
                            ) : (
                              <div className="w-6 h-6 bg-slate-800 rounded-full flex items-center justify-center"><UserIcon className="w-3 h-3 text-slate-400" /></div>
                            )}
                            <span className="text-[10px] font-bold text-slate-300">{hs.engineer}</span>
                            <ChevronRight className={`w-3 h-3 text-slate-500 transition-transform ${selectedEngineer === hs.engineer ? 'rotate-90 text-[#a855f7]' : ''}`} />
                          </button>
                        </div>
                      )) : (
                        <p className="text-sm text-slate-500 italic">No hay mantenimientos previos registrados.</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Equipment3DViewer, Hotspot3D } from '@/shared/components/Equipment3DViewer';
import { Card } from '@/shared/components/Card';
import { Badge } from '@/shared/components/Badge';
import { ArrowLeft, AlertCircle, Save, Loader2, Activity, Settings2, Info, CheckCircle2 } from 'lucide-react';
import Cookies from 'js-cookie';

export default function EngineerEquipmentDetail({ params }: { params: any }) {
  const router = useRouter();
  const unwrappedParams = React.use(params) as { id: string };
  const equipmentId = unwrappedParams.id;
  
  const [equipment, setEquipment] = useState<any>(null);
  const [activeIncident, setActiveIncident] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Falla State
  const [selectedPoint, setSelectedPoint] = useState<[number, number, number] | null>(null);
  const [fallaDesc, setFallaDesc] = useState('');
  const [isReporting, setIsReporting] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, [equipmentId]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const token = Cookies.get('token');
      
      const [resEq, resInc] = await Promise.all([
        fetch(`http://localhost:8000/api/equipment/${equipmentId}/`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`http://localhost:8000/api/incidents/assigned/`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      
      if (resEq.ok) setEquipment(await resEq.json());
      if (resInc.ok) {
        const incidents = await resInc.json();
        const active = incidents.find((i: any) => i.equipo_id.toString() === equipmentId && i.estado === 'Pendiente de Inspeccion');
        setActiveIncident(active);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCoordinateSelect = (x: number, y: number, z: number) => {
    setSelectedPoint([x, y, z]);
    setShowReportModal(true);
  };

  const handleUpdateOrReport = async () => {
    if (!fallaDesc) return;
    
    setIsReporting(true);
    try {
      const token = Cookies.get('token');
      
      // SI TIENE UN INCIDENTE ASIGNADO (Flujo de Alerta)
      if (activeIncident) {
        const res = await fetch(`http://localhost:8000/api/incidents/${activeIncident.id}/`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            reporte_preliminar_ingeniero: fallaDesc,
            x: selectedPoint?.[0] || 0,
            y: selectedPoint?.[1] || 0,
            z: selectedPoint?.[2] || 0
          })
        });
        
        if (res.ok) {
          setShowReportModal(false);
          setFallaDesc('');
          alert("Reporte de revisión enviado. El Jefe ha sido notificado y el estado pasó a 'Inspeccionado'.");
          router.push('/dashboard/engineer');
        } else {
          alert("Error al actualizar el incidente.");
        }
      } 
      // SI ES UN REPORTE DIRECTO (El ingeniero descubrió la falla)
      else if (selectedPoint) {
        const res = await fetch(`http://localhost:8000/api/equipment/${equipmentId}/direct-report/`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            x: selectedPoint[0],
            y: selectedPoint[1],
            z: selectedPoint[2],
            descripcion: fallaDesc
          })
        });
        
        if (res.ok) {
          setShowReportModal(false);
          setFallaDesc('');
          alert("Reporte de anomalía directo enviado exitosamente al Jefe de Unidad.");
          fetchData(); // Recargar para ver el nuevo punto
        } else {
          alert("Error al generar el reporte directo.");
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsReporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Loader2 className="w-12 h-12 text-[#10b981] animate-spin" />
      </div>
    );
  }

  if (!equipment) return null;

  // Render active hotspots based on equipment data
  const hotspots: Hotspot3D[] = [];
  
  // Puntos verdes (mantenimientos previos del historial)
  if (equipment.mantenimientos_previos) {
    try {
      const history = typeof equipment.mantenimientos_previos === 'string' 
        ? JSON.parse(equipment.mantenimientos_previos) 
        : equipment.mantenimientos_previos;
        
      if (Array.isArray(history)) {
        history.forEach((h: any, index: number) => {
          if (h.position3D && Array.isArray(h.position3D)) {
            hotspots.push({
              id: -(index + 1), // ID negativo para diferenciarlos
              position: [h.position3D[0], h.position3D[1], h.position3D[2]],
              color: '#10b981',
              pulse: false
            });
          }
        });
      }
    } catch (e) { console.error("Error processing history", e); }
  }

  // Punto rojo (Falla actual)
  if (equipment.falla_activa) {
    hotspots.push({
      id: 1,
      position: [equipment.falla_coordenada_x || 0, equipment.falla_coordenada_y || 0, equipment.falla_coordenada_z || 0],
      color: '#f43f5e',
      pulse: true
    });
  }

  const noModelLoaded = equipment.ruta_modelo_3d === null;

  return (
    <div className="space-y-6 pb-12 animate-fade-in max-w-[1200px] mx-auto">
      <button 
        onClick={() => router.push('/dashboard/engineer')}
        className="flex items-center gap-2 text-slate-400 hover:text-[#10b981] transition-colors text-sm font-bold tracking-widest uppercase mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Volver al Inventario
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: 3D Viewer */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-1 bg-[#050010] border border-slate-800 rounded-3xl overflow-hidden shadow-[0_0_30px_rgba(16,185,129,0.1)]">
            <div className="bg-[#110121] p-4 flex justify-between items-center border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#10b981]" />
                <h3 className="font-bold text-white tracking-widest uppercase text-sm">Gemelo Digital 3D</h3>
              </div>
              <Badge variant="primary" className="bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/30">
                Interactivo
              </Badge>
            </div>
            
            <div className="h-[600px] relative w-full bg-gradient-to-b from-[#0a001a] to-[#110121]">
              {!noModelLoaded ? (
                <Equipment3DViewer 
                  modelUrl={equipment.ruta_modelo_3d}
                  hotspots={hotspots}
                  onCoordinateSelected={handleCoordinateSelect}
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 z-20">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-32 h-32 border-2 border-dashed border-[#10b981]/50 rounded-full flex items-center justify-center mb-6 relative"
                  >
                    <div className="absolute inset-0 border-2 border-[#10b981]/20 rounded-full animate-ping" />
                    <Settings2 className="w-12 h-12 text-[#10b981]/50" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-slate-300 uppercase tracking-widest" style={{ fontFamily: 'var(--font-oswald)' }}>
                    Modelo 3D aún no cargado
                  </h3>
                  <p className="text-slate-500 mt-2 max-w-md">
                    El gemelo digital de este equipo no se encuentra disponible en la base de datos actual.
                  </p>
                </div>
              )}
              
              {!noModelLoaded && (
                <div className="absolute top-4 right-4 bg-[#0a0118]/80 backdrop-blur-md p-4 rounded-xl border border-slate-700 z-10 max-w-xs pointer-events-none">
                  <h4 className="text-[10px] font-bold text-[#10b981] uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Info className="w-3 h-3" /> Instrucciones
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Haz clic en cualquier parte del modelo 3D para marcar la coordenada exacta de una falla y generar un reporte instantáneo directo al Jefe de Unidad.
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column: Info & Active Faults */}
        <div className="space-y-6">
          <Card className="bg-[#110121] border border-slate-800 shadow-xl p-6">
            <Badge variant={equipment.estado === 'Activo' ? 'success' : 'error'} className="mb-4">
              {equipment.estado}
            </Badge>
            <h1 className="text-2xl font-bold text-white mb-2">{equipment.nombre}</h1>
            <p className="text-xs text-[#10b981] font-mono mb-6 pb-4 border-b border-slate-800">{equipment.codigo_interno}</p>
            
            <div className="space-y-4">
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Área Asignada</p>
                <p className="text-sm text-slate-300">{equipment.area}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Marca / Modelo</p>
                <p className="text-sm text-slate-300">{equipment.marca || 'N/A'} / {equipment.modelo || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Descripción</p>
                <p className="text-sm text-slate-400">{equipment.descripcion}</p>
              </div>
            </div>
          </Card>

          {activeIncident && (
            <Card className="bg-indigo-500/10 border border-indigo-500/30 p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-bl-full -z-10 group-hover:scale-110 transition-transform" />
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-indigo-400 animate-pulse" />
                  <h3 className="text-sm font-bold text-indigo-300 uppercase tracking-widest">Incidente a Revisar</h3>
                </div>
                <span className="text-xs font-mono text-indigo-400 bg-indigo-500/20 px-2 py-1 rounded">#{activeIncident.id}</span>
              </div>
              <p className="text-sm text-white font-medium mb-2">Reportado por: {activeIncident.doctor_nombre}</p>
              <p className="text-sm text-slate-300 mb-4 bg-[#050010] p-3 rounded-lg border border-indigo-500/20">{activeIncident.problema_visible}</p>
              
              <button 
                onClick={() => setShowReportModal(true)}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors shadow-[0_0_15px_rgba(79,70,229,0.4)] flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" /> Enviar Reporte de Revisión
              </button>
            </Card>
          )}

          {!activeIncident && equipment.falla_activa && (
             <Card className="bg-rose-500/10 border border-rose-500/30 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle className="w-5 h-5 text-rose-500 animate-pulse" />
                  <h3 className="text-sm font-bold text-rose-400 uppercase tracking-widest">Falla Reportada Directamente</h3>
                </div>
                <p className="text-sm text-slate-300 mb-2">{equipment.falla_descripcion}</p>
                <div className="bg-[#050010] rounded-lg p-2 font-mono text-[10px] text-slate-400">
                  X:{equipment.falla_coordenada_x?.toFixed(2)} Y:{equipment.falla_coordenada_y?.toFixed(2)} Z:{equipment.falla_coordenada_z?.toFixed(2)}
                </div>
             </Card>
          )}
        </div>
      </div>

      {/* Report Modal */}
      <AnimatePresence>
        {showReportModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#110121] border border-[#10b981]/30 rounded-2xl w-full max-w-md shadow-[0_0_40px_rgba(16,185,129,0.2)] overflow-hidden"
            >
              <div className="p-6 border-b border-slate-800">
                <h3 className="text-lg font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                  <Activity className="w-5 h-5 text-[#10b981]" /> {activeIncident ? 'Revisión Técnica' : 'Reportar Anomalía Directa'}
                </h3>
              </div>
              <div className="p-6 space-y-4">
                {activeIncident ? (
                  <div className="bg-[#050010] p-4 rounded-xl border border-slate-800">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Síntoma Reportado por Doctor</p>
                    <p className="text-sm text-slate-300">{activeIncident.problema_visible}</p>
                  </div>
                ) : (
                  <div className="bg-[#050010] p-3 rounded-xl border border-slate-800 font-mono text-[10px] text-slate-400">
                    Marcaste la coordenada: X:{selectedPoint?.[0].toFixed(2)} Y:{selectedPoint?.[1].toFixed(2)} Z:{selectedPoint?.[2].toFixed(2)}
                  </div>
                )}
                
                <div>
                  <label className="text-xs font-bold text-[#10b981] uppercase tracking-widest mb-2 block">
                    {activeIncident ? 'Reporte Preliminar del Ingeniero' : 'Descripción de la Falla'}
                  </label>
                  <textarea 
                    value={fallaDesc}
                    onChange={(e) => setFallaDesc(e.target.value)}
                    className="w-full bg-[#050010] border border-slate-700 rounded-xl p-4 text-sm text-white focus:border-[#10b981] outline-none transition-colors resize-none h-32 shadow-inner"
                    placeholder={activeIncident ? "Escribe tu diagnóstico tras la revisión. Se notificará al Jefe de Unidad." : "Describe la anomalía que encontraste. Se creará un incidente directo al Jefe de Unidad."}
                    autoFocus
                  />
                </div>
              </div>
              <div className="p-4 border-t border-slate-800 flex justify-end gap-3 bg-[#0a001a]">
                <button 
                  onClick={() => setShowReportModal(false)}
                  className="px-5 py-2 rounded-xl text-sm font-bold text-slate-400 hover:text-white transition-colors uppercase tracking-wider"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleUpdateOrReport}
                  disabled={isReporting || !fallaDesc}
                  className="bg-gradient-to-r from-[#10b981] to-[#059669] text-white px-6 py-2 rounded-xl text-sm font-bold shadow-[0_0_15px_rgba(16,185,129,0.4)] disabled:opacity-50 transition-all flex items-center gap-2 uppercase tracking-wider"
                >
                  {isReporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {isReporting ? 'Guardando...' : 'Enviar Reporte al Jefe'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { HttpWorkOrderRepository } from '@/modules/work-orders/infrastructure/HttpWorkOrderRepository';
import { EntityTimeline } from '@/modules/dashboard/ui/components/EntityTimeline';
import { ArrowLeft, ClipboardList, Play, CheckCircle, Clock, Wrench, Plus, Send, ShieldAlert } from 'lucide-react';
import Cookies from 'js-cookie';

export default function WorkOrderDetailPage({ params }: { params: any }) {
  const unwrappedParams = React.use(params as any) as { id: string };
  const id = unwrappedParams.id;
  const router = useRouter();
  
  const [order, setOrder] = useState<any>(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newLog, setNewLog] = useState('');
  const [isFinishing, setIsFinishing] = useState(false);
  const [isAddingLog, setIsAddingLog] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  
  // Finish Payload state
  const [finishPayload, setFinishPayload] = useState({
    observaciones_tecnicas: '',
    costo_reparacion: '',
    problema_real_encontrado: '',
    acciones_realizadas: '',
    repuestos_usados: '[]'
  });

  useEffect(() => {
    setUserId(Number(Cookies.get('user_id')));
    setUserRole(Cookies.get('role'));
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const repo = new HttpWorkOrderRepository();
      const [orderData, historyData] = await Promise.all([
        repo.getOrderById(Number(id)),
        repo.getHistory(Number(id))
      ]);
      setOrder(orderData);
      setHistory(historyData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async () => {
    try {
      const repo = new HttpWorkOrderRepository();
      await repo.startOrder(Number(id), userId || 0);
      fetchData(); // reload
    } catch (error) {
      alert('Error al iniciar orden');
    }
  };

  const handleAddLog = async () => {
    if (!newLog.trim()) return;
    setIsAddingLog(true);
    try {
      const repo = new HttpWorkOrderRepository();
      await repo.addLogToOrder(Number(id), newLog);
      setNewLog('');
      fetchData(); // reload to show new log
    } catch (error) {
      alert('Error al añadir bitácora');
    } finally {
      setIsAddingLog(false);
    }
  };

  const handleFinish = async () => {
    setIsFinishing(true);
    try {
      const repo = new HttpWorkOrderRepository();
      
      const payload = {
        engineer_id: userId,
        observaciones_tecnicas: finishPayload.observaciones_tecnicas,
        costo_reparacion: finishPayload.costo_reparacion ? parseFloat(finishPayload.costo_reparacion) : null,
        problema_real_encontrado: finishPayload.problema_real_encontrado,
        acciones_realizadas: finishPayload.acciones_realizadas,
        repuestos_usados: finishPayload.repuestos_usados ? JSON.parse(finishPayload.repuestos_usados) : []
      };

      await repo.finishOrder(Number(id), userId || 0, payload);
      setIsFinishing(false);
      fetchData(); // reload
    } catch (error) {
      alert('Error al finalizar orden');
      setIsFinishing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-32 space-y-4">
        <div className="w-16 h-16 border-4 border-[#10b981] border-t-transparent rounded-full animate-spin" />
        <span className="text-[#10b981] font-bold tracking-widest uppercase">Cargando Bitácora...</span>
      </div>
    );
  }

  if (!order) {
    return <div className="p-20 text-center text-rose-500 font-bold uppercase tracking-widest">Orden no encontrada</div>;
  }

  const isEngineer = userRole?.includes('Ingeniero');
  const canStart = isEngineer && order.estado === 'Pendiente';
  const canFinish = isEngineer && order.estado === 'En Proceso';

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="w-12 h-12 flex items-center justify-center bg-[#110121] border border-slate-800 rounded-2xl hover:bg-[#10b981] hover:border-[#10b981] transition-all text-white group shadow-sm">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-[#10b981] tracking-tight uppercase" style={{ fontFamily: 'var(--font-oswald)' }}>
              Detalle de Orden #{order.id.toString().padStart(4, '0')}
            </h1>
            <p className="text-slate-400 mt-1 font-bold flex items-center gap-2 tracking-widest uppercase text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
              {order.equipo_nombre} • {order.area}
            </p>
          </div>
        </div>
        
        <div className={`px-6 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 shadow-inner border ${
          order.estado === 'Pendiente' ? 'bg-amber-500/10 text-amber-500 border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.1)]' : 
          order.estado === 'En Proceso' ? 'bg-[#a855f7]/10 text-[#a855f7] border-[#a855f7]/30 shadow-[0_0_20px_rgba(168,85,247,0.1)]' : 
          'bg-emerald-500/10 text-emerald-500 border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.1)]'
        }`}>
          {order.estado === 'Pendiente' && <Clock className="w-4 h-4" />}
          {order.estado === 'En Proceso' && <Play className="w-4 h-4 animate-pulse" />}
          {order.estado === 'Finalizado' && <CheckCircle className="w-4 h-4" />}
          ESTADO: {order.estado}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Info Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#050010] border border-slate-800 rounded-3xl p-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#10b981] to-[#a855f7]" />
            <h3 className="font-bold text-white uppercase tracking-widest text-xs flex items-center gap-2 mb-8">
              <Wrench className="w-4 h-4 text-[#10b981]" /> Ficha Técnica
            </h3>

            <div className="space-y-6">
              <div>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-2">Tipo de Mantenimiento</p>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${order.tipo_mantenimiento === 'Correctivo' ? 'bg-rose-500' : 'bg-[#10b981]'}`} />
                  <p className="text-sm text-slate-200 font-extrabold tracking-wide uppercase">{order.tipo_mantenimiento}</p>
                </div>
              </div>
              
              <div>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-2">Descripción de la Tarea / Falla</p>
                <div className="bg-[#110121] p-4 rounded-2xl border border-slate-800/50 shadow-inner">
                  <p className="text-sm text-slate-300 italic">"{order.descripcion}"</p>
                </div>
              </div>
              
              <div>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-2">Ingeniero Asignado</p>
                <div className="flex items-center gap-3 bg-[#110121] p-3 rounded-2xl border border-slate-800/50">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-lg">
                    {order.ingeniero_nombre ? order.ingeniero_nombre.charAt(0).toUpperCase() : '?'}
                  </div>
                  <div>
                    <p className="text-sm text-slate-200 font-bold tracking-wide">{order.ingeniero_nombre}</p>
                    <p className="text-[8px] text-slate-500 uppercase tracking-widest mt-0.5">Responsable Principal</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Start Action */}
          {canStart && (
            <button 
              onClick={handleStart}
              className="w-full py-5 bg-gradient-to-r from-[#a855f7] to-[#7e22ce] text-white font-extrabold rounded-3xl hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-sm hover:-translate-y-1"
            >
              <Play className="w-5 h-5 fill-current" /> Iniciar Mantenimiento
            </button>
          )}

          {/* Finish Panel */}
          {canFinish && (
            <div className="bg-[#110121] border border-emerald-500/30 rounded-3xl p-6 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
              <h3 className="font-bold text-emerald-400 uppercase tracking-widest text-xs flex items-center gap-2 mb-6">
                <CheckCircle className="w-4 h-4" /> Formulario de Finalización
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-2 block">Problema Real Encontrado</label>
                  <textarea 
                    value={finishPayload.problema_real_encontrado}
                    onChange={e => setFinishPayload({...finishPayload, problema_real_encontrado: e.target.value})}
                    className="w-full bg-[#050010] border border-slate-700 rounded-xl p-3 text-sm text-white focus:border-emerald-500 outline-none transition-all h-20 resize-none"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-2 block">Acciones Realizadas / Diagnóstico Final</label>
                  <textarea 
                    value={finishPayload.acciones_realizadas}
                    onChange={e => setFinishPayload({...finishPayload, acciones_realizadas: e.target.value})}
                    className="w-full bg-[#050010] border border-slate-700 rounded-xl p-3 text-sm text-white focus:border-emerald-500 outline-none transition-all h-24 resize-none"
                  />
                </div>
                
                <button 
                  onClick={handleFinish}
                  disabled={!finishPayload.acciones_realizadas.trim() || isFinishing}
                  className="w-full py-4 mt-4 bg-emerald-600 text-white font-extrabold rounded-xl hover:bg-emerald-500 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs disabled:opacity-50 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                >
                  {isFinishing ? <Clock className="w-4 h-4 animate-spin" /> : <ShieldAlert className="w-4 h-4" />}
                  {isFinishing ? 'Guardando y Actualizando 3D...' : 'Finalizar Mantenimiento'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Timeline & Logs */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Add Multiple Logs Section */}
          {canFinish && (
            <div className="bg-[#050010] border border-[#a855f7]/30 rounded-3xl p-6 shadow-xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-[#a855f7]/5 blur-3xl rounded-full" />
               <h3 className="font-bold text-white uppercase tracking-widest text-xs flex items-center gap-2 mb-4">
                 <ClipboardList className="w-4 h-4 text-[#a855f7]" /> Añadir Bitácora de Progreso
               </h3>
               <div className="flex gap-4">
                 <textarea 
                    value={newLog}
                    onChange={e => setNewLog(e.target.value)}
                    placeholder="Registrar nueva acción o avance en el equipo..."
                    className="flex-grow bg-[#110121] border border-slate-800 rounded-2xl p-4 text-sm text-white focus:border-[#a855f7] outline-none transition-all resize-none shadow-inner h-20"
                 />
                 <button 
                    onClick={handleAddLog}
                    disabled={!newLog.trim() || isAddingLog}
                    className="px-6 bg-[#a855f7] text-white rounded-2xl font-bold flex flex-col items-center justify-center gap-2 disabled:opacity-50 hover:bg-[#9333ea] transition-all group"
                 >
                    {isAddingLog ? <Clock className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                    <span className="text-[10px] uppercase tracking-widest">Enviar</span>
                 </button>
               </div>
            </div>
          )}

          {/* Active Logs Display */}
          <div className="bg-[#050010] border border-slate-800 rounded-3xl p-8 h-full shadow-xl">
             <div className="mb-8 flex items-center justify-between border-b border-slate-800/50 pb-5">
                <h3 className="font-bold text-white uppercase tracking-widest text-xs flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-500" /> Registro de Actividades (Bitácoras)
                </h3>
             </div>
             
             <div className="space-y-6">
                {order.bitacoras_ingeniero && order.bitacoras_ingeniero.length > 0 ? (
                  order.bitacoras_ingeniero.map((log: any, idx: number) => (
                    <div key={idx} className="bg-[#110121] border border-slate-800/50 p-5 rounded-2xl animate-fade-in relative overflow-hidden group">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#a855f7] to-[#10b981] opacity-50" />
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          {new Date(log.fecha).toLocaleString()}
                        </span>
                        <span className="text-[10px] bg-slate-800 text-white px-2 py-1 rounded-md">{log.autor}</span>
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed font-medium">"{log.nota}"</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center p-10 border border-dashed border-slate-800 rounded-2xl">
                    <ClipboardList className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                    <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">No hay bitácoras registradas</p>
                  </div>
                )}
             </div>

             {/* Auto-generated History Timeline */}
             <div className="mt-12 pt-8 border-t border-slate-800/50">
               <h3 className="font-bold text-slate-500 uppercase tracking-widest text-[10px] mb-6">Historial del Sistema</h3>
               <div className="relative border-l border-slate-800 ml-2 space-y-6">
                  {history.map((log: any, idx: number) => (
                    <div key={idx} className="relative pl-6">
                      <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-slate-700 border-2 border-[#050010]" />
                      <p className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">{new Date(log.fecha).toLocaleString()}</p>
                      <p className="text-xs text-slate-300 mt-1">{log.descripcion}</p>
                    </div>
                  ))}
               </div>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}

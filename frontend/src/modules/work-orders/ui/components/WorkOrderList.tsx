"use client";

import React, { useEffect, useState } from 'react';
import { WorkOrder } from '../../domain/types';
import { HttpWorkOrderRepository } from '../../infrastructure/HttpWorkOrderRepository';
import { BadgeCheck, Clock, AlertCircle, Play, CheckCircle, ArrowRight, Activity, Wrench } from 'lucide-react';
import Cookies from 'js-cookie';
import Link from 'next/link';

export const WorkOrderList: React.FC = () => {
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [userContext, setUserContext] = useState<{role?: string, id?: number}>({});

  const fetchOrders = async () => {
    try {
      const repo = new HttpWorkOrderRepository();
      const data = await repo.getAll();
      setOrders(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    setUserContext({
      role: Cookies.get('role'),
      id: Number(Cookies.get('user_id'))
    });
    fetchOrders();
  }, []);

  if (!isMounted || loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <Activity className="w-12 h-12 text-[#a855f7] animate-spin" />
        <span className="text-[#a855f7] font-bold tracking-widest uppercase">Sincronizando...</span>
      </div>
    );
  }

  const pendingOrders = orders.filter((o: any) => o.estado === 'Pendiente');
  const inProcessOrders = orders.filter((o: any) => o.estado === 'En Proceso');
  const finishedOrders = orders.filter((o: any) => o.estado === 'Finalizado');

  return (
    <div className="space-y-8 animate-fade-in pb-12 w-full max-w-[1600px] mx-auto">
      
      {/* Header Interactivo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-[#110121] border border-amber-500/30 rounded-3xl p-6 relative overflow-hidden shadow-lg shadow-amber-500/5 hover:border-amber-500 transition-colors group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-3xl rounded-full group-hover:bg-amber-500/20 transition-all" />
          <p className="text-xs text-amber-500 font-bold uppercase tracking-widest mb-2 flex items-center gap-2"><AlertCircle className="w-4 h-4" /> Pendientes</p>
          <p className="text-5xl font-extrabold text-white" style={{ fontFamily: 'var(--font-oswald)' }}>{pendingOrders.length}</p>
        </div>
        <div className="bg-[#110121] border border-[#a855f7]/30 rounded-3xl p-6 relative overflow-hidden shadow-lg shadow-[#a855f7]/5 hover:border-[#a855f7] transition-colors group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#a855f7]/10 blur-3xl rounded-full group-hover:bg-[#a855f7]/20 transition-all" />
          <p className="text-xs text-[#a855f7] font-bold uppercase tracking-widest mb-2 flex items-center gap-2"><Play className="w-4 h-4" /> En Proceso</p>
          <p className="text-5xl font-extrabold text-white" style={{ fontFamily: 'var(--font-oswald)' }}>{inProcessOrders.length}</p>
        </div>
        <div className="bg-[#110121] border border-[#10b981]/30 rounded-3xl p-6 relative overflow-hidden shadow-lg shadow-[#10b981]/5 hover:border-[#10b981] transition-colors group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#10b981]/10 blur-3xl rounded-full group-hover:bg-[#10b981]/20 transition-all" />
          <p className="text-xs text-[#10b981] font-bold uppercase tracking-widest mb-2 flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Finalizadas</p>
          <p className="text-5xl font-extrabold text-white" style={{ fontFamily: 'var(--font-oswald)' }}>{finishedOrders.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {orders.map((order: any) => {
          const isCorrectivo = order.tipo_mantenimiento === 'Correctivo';
          
          let borderClass = 'border-slate-800 hover:border-slate-600';
          let iconClass = 'text-slate-400';
          let StatusIcon = Clock;
          
          if (order.estado === 'Pendiente') {
            borderClass = 'border-amber-500/30 hover:border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.1)]';
            iconClass = 'text-amber-500 bg-amber-500/10';
            StatusIcon = AlertCircle;
          } else if (order.estado === 'En Proceso') {
            borderClass = 'border-[#a855f7]/40 hover:border-[#a855f7] shadow-[0_0_20px_rgba(168,85,247,0.2)]';
            iconClass = 'text-[#a855f7] bg-[#a855f7]/10';
            StatusIcon = Play;
          } else if (order.estado === 'Finalizado') {
            borderClass = 'border-[#10b981]/30 hover:border-[#10b981]';
            iconClass = 'text-[#10b981] bg-[#10b981]/10';
            StatusIcon = BadgeCheck;
          }

          return (
            <div key={order.id} className={`group bg-[#050010] rounded-3xl p-6 border transition-all duration-500 flex flex-col hover:-translate-y-1 ${borderClass}`}>
              
              {/* Card Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase ${iconClass}`}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    {order.estado}
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold text-slate-500 bg-[#110121] px-2 py-1 rounded-lg border border-slate-800">
                  #{order.id.toString().padStart(4, '0')}
                </span>
              </div>

              {/* Card Body */}
              <div className="mb-6 flex-grow">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${isCorrectivo ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.8)]' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]'}`} />
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">
                    {order.tipo_mantenimiento}
                  </p>
                </div>
                <h3 className="text-xl font-extrabold text-white mb-1 leading-tight line-clamp-1" style={{ fontFamily: 'var(--font-oswald)' }}>
                  {order.equipo_nombre}
                </h3>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2 font-bold">
                  <span className="w-1 h-1 rounded-full bg-slate-600"></span> {order.area}
                </p>
                
                <div className="bg-[#110121] p-4 rounded-xl border border-slate-800/50 text-xs text-slate-300 italic line-clamp-3 shadow-inner h-[70px]">
                  "{order.descripcion}"
                </div>
              </div>

              {/* Assignee & Action */}
              <div className="pt-5 border-t border-slate-800/50 flex items-center justify-between mt-auto">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold shadow-lg">
                    {order.ingeniero_nombre ? order.ingeniero_nombre.charAt(0).toUpperCase() : '?'}
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-200">{order.ingeniero_nombre || 'Sin asignar'}</p>
                    <p className="text-[8px] text-slate-500 uppercase tracking-widest">Responsable</p>
                  </div>
                </div>
                
                <Link 
                  href={`/dashboard/work-orders/${order.id}`}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all group-hover:shadow-[0_0_15px_rgba(168,85,247,0.3)] ${
                    order.estado === 'En Proceso' ? 'bg-[#a855f7] text-white' : 'bg-[#110121] text-[#a855f7] border border-[#a855f7]/30 hover:bg-[#a855f7] hover:text-white'
                  }`}
                  title="Abrir Orden"
                >
                  Abrir <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

            </div>
          );
        })}
      </div>
      
      {orders.length === 0 && (
        <div className="text-center p-20 border-2 border-dashed border-slate-800 rounded-3xl">
          <Wrench className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 font-bold uppercase tracking-widest">No hay órdenes de trabajo registradas</p>
        </div>
      )}
    </div>
  );
};

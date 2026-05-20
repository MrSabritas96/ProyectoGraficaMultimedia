"use client";

import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle2, Clock } from 'lucide-react';
import { HttpNotificationRepository, Notification } from '../../infrastructure/HttpNotificationRepository';

export const NotificationBell: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const repo = new HttpNotificationRepository();
      const data = await repo.getMyNotifications();
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.leida).length);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // Polling cada 10s
    return () => clearInterval(interval);
  }, []);

  const handleMarkRead = async (id: number) => {
    try {
      const repo = new HttpNotificationRepository();
      await repo.markAsRead(id);
      fetchNotifications();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all duration-300"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute right-0 mt-3 w-80 bg-white rounded-3xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                Notificaciones
                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-600 text-[10px] rounded-full uppercase tracking-wider">Centro de Alertas</span>
              </h3>
              <button onClick={fetchNotifications} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors" title="Actualizar">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
              </button>
            </div>
            
            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="p-10 text-center text-slate-400">
                  <Bell className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  <p className="text-sm font-medium">No tienes notificaciones</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div 
                    key={n.id} 
                    className={`p-4 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors ${!n.leida ? 'bg-indigo-50/30' : ''}`}
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1">
                        <h4 className={`text-sm font-bold ${!n.leida ? 'text-indigo-900' : 'text-slate-700'}`}>{n.titulo}</h4>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{n.mensaje}</p>
                        <div className="flex items-center gap-3 mt-3">
                           <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium uppercase tracking-tight">
                              <Clock className="w-3 h-3" />
                              {new Date(n.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                           </div>
                           {(n as any).enlace_destino && (
                             <a 
                               href={(n as any).enlace_destino}
                               className="text-[10px] font-bold text-indigo-500 hover:text-indigo-700 uppercase tracking-widest flex items-center gap-1 bg-indigo-50 px-2 py-1 rounded"
                             >
                               Ver Detalles
                             </a>
                           )}
                           {!n.leida && (
                             <button 
                               onClick={() => handleMarkRead(n.id)}
                               className="text-[10px] font-bold text-emerald-500 hover:text-emerald-700 uppercase tracking-widest flex items-center gap-1 ml-auto"
                             >
                               <CheckCircle2 className="w-3 h-3" /> Marcar leída
                             </button>
                           )}
                        </div>
                      </div>
                      {!n.leida && <div className="w-2 h-2 bg-indigo-500 rounded-full mt-1.5" />}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

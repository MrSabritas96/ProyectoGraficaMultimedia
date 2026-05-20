"use client";

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Cookies from 'js-cookie';

interface CalendarViewProps {
  onEventClick?: (id: number) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ onEventClick }) => {
  const [monthOffset, setMonthOffset] = useState(0);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const token = Cookies.get('token');
        const res = await fetch('http://localhost:8000/api/work-orders/', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        const parsedEvents: any[] = [];
        data.forEach((order: any) => {
          const dateStr = order.fecha_inicio;
          if (!dateStr) return; // Solo mostramos si ya inició
          
          const dateObj = new Date(dateStr);
          
          // Día de Inicio (Rojo)
          parsedEvents.push({
            id: `${order.id}-start`,
            date: dateObj.getDate(),
            month: dateObj.getMonth(),
            year: dateObj.getFullYear(),
            type: 'start',
            label: `Inicio: ${order.equipo_nombre}`
          });
          
          // Días En Curso (Amarillo/Ámbar) - Estimamos 2 días de proceso
          for (let i = 1; i <= 2; i++) {
            const estDate = new Date(dateObj);
            estDate.setDate(dateObj.getDate() + i);
            parsedEvents.push({
              id: `${order.id}-prog-${i}`,
              date: estDate.getDate(),
              month: estDate.getMonth(),
              year: estDate.getFullYear(),
              type: 'progress',
              label: `En Curso: ${order.equipo_nombre}`
            });
          }

          // Día Estimado de Entrega (Verde) - Al 3er día
          const endDate = new Date(dateObj);
          endDate.setDate(dateObj.getDate() + 3);
          parsedEvents.push({
            id: `${order.id}-end`,
            date: endDate.getDate(),
            month: endDate.getMonth(),
            year: endDate.getFullYear(),
            type: 'end',
            label: `Entrega Est.: ${order.equipo_nombre}`
          });
        });
        setEvents(parsedEvents);
      } catch (error) {
        console.error("Error fetching orders for calendar:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const currentDate = new Date();
  const displayDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + monthOffset, 1);
  const currentMonthIndex = displayDate.getMonth();
  const currentYear = displayDate.getFullYear();

  const daysInMonth = new Date(currentYear, currentMonthIndex + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonthIndex, 1).getDay(); // 0 is Sunday
  
  const blanks = Array.from({ length: firstDay }).map((_, i) => i);
  const days = Array.from({ length: daysInMonth }).map((_, i) => i + 1);

  const getEventsForDay = (day: number) => {
    return events.filter(e => e.date === day && e.month === currentMonthIndex && e.year === currentYear);
  };

  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const displayMonthStr = monthNames[currentMonthIndex];

  return (
    <div className="bg-[#050010]/80 backdrop-blur-xl border border-[#a855f7]/30 rounded-2xl p-6 shadow-[0_0_30px_rgba(126,34,206,0.15)] relative min-h-[400px]">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white uppercase tracking-wider" style={{ fontFamily: 'var(--font-oswald)' }}>{displayMonthStr} {currentYear}</h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Programación de Mantenimiento</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button onClick={() => setMonthOffset(prev => prev - 1)} className="w-8 h-8 rounded-lg bg-[#110121] border border-[#a855f7]/30 flex items-center justify-center text-[#a855f7] hover:bg-[#a855f7] hover:text-white transition-all">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={() => setMonthOffset(prev => prev + 1)} className="w-8 h-8 rounded-lg bg-[#110121] border border-[#a855f7]/30 flex items-center justify-center text-[#a855f7] hover:bg-[#a855f7] hover:text-white transition-all">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="absolute inset-0 flex justify-center items-center">
          <div className="w-10 h-10 border-4 border-slate-800 border-t-[#a855f7] rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* Days of week */}
          <div className="grid grid-cols-7 mb-2">
            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
              <div key={day} className="text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-7 gap-2">
            {blanks.map(blank => (
              <div key={`blank-${blank}`} className="aspect-square rounded-xl bg-slate-900/20 border border-slate-800/20" />
            ))}
            
            {days.map(day => {
              const dayEvents = getEventsForDay(day);
              const isToday = day === currentDate.getDate() && currentMonthIndex === currentDate.getMonth() && currentYear === currentDate.getFullYear();
              
              // Determine background color based on events
              let bgClass = isToday ? 'bg-[#a855f7]/10 border-[#a855f7] shadow-[0_0_15px_rgba(168,85,247,0.3)]' : 'bg-[#110121] border-slate-800 hover:border-[#a855f7]/50';
              
              const hasStart = dayEvents.some(e => e.type === 'start');
              const hasProgress = dayEvents.some(e => e.type === 'progress');
              const hasEnd = dayEvents.some(e => e.type === 'end');

              if (hasStart) {
                bgClass = 'bg-rose-500/20 border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)]';
              } else if (hasProgress) {
                bgClass = 'bg-amber-500/20 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]';
              } else if (hasEnd) {
                bgClass = 'bg-emerald-500/20 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]';
              }

              return (
                <div 
                  key={`day-${day}`} 
                  className={`aspect-square rounded-xl p-2 border transition-colors flex flex-col group relative overflow-y-auto custom-scrollbar ${bgClass}`}
                >
                  <span className={`text-xs font-bold ${isToday && !hasStart && !hasProgress && !hasEnd ? 'text-[#e9d5ff]' : 'text-slate-200'}`}>{day}</span>
                  
                  <div className="flex-1 mt-1 flex flex-col gap-1">
                    {dayEvents.map((evt, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={() => onEventClick && onEventClick(evt.id.split('-')[0])}
                        className={`text-[8px] font-bold px-1.5 py-0.5 rounded cursor-pointer hover:brightness-125 transition-all truncate text-center ${
                          evt.type === 'start' 
                            ? 'bg-rose-500/40 text-white' 
                            : evt.type === 'progress'
                            ? 'bg-amber-500/40 text-amber-100'
                            : 'bg-emerald-500/40 text-emerald-100'
                        }`}
                        title={evt.label}
                      >
                        {evt.label}
                      </motion.div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-rose-500/20 border border-rose-500 shadow-[0_0_5px_rgba(244,63,94,0.3)]" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Inicio</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-amber-500/20 border border-amber-500 shadow-[0_0_5px_rgba(245,158,11,0.2)]" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">En Curso</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-emerald-500/20 border border-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.3)]" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Entrega Est.</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

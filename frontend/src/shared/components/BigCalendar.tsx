import React from 'react';
import { Calendar as CalendarIcon, Clock, UserCircle2 } from 'lucide-react';
import { MaintenanceEvent, Engineer } from '@/shared/data/mockDatabase';

interface BigCalendarProps {
  orders: MaintenanceEvent[];
  engineers: Engineer[];
  currentMonth?: number; // 0-11
  currentYear?: number;
}

const DAYS_OF_WEEK = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

// Colors for engineers to distinguish them in the calendar
const ENGINEER_COLORS = [
  'border-emerald-500 bg-emerald-500/10 text-emerald-400',
  'border-purple-500 bg-purple-500/10 text-purple-400',
  'border-blue-500 bg-blue-500/10 text-blue-400',
  'border-rose-500 bg-rose-500/10 text-rose-400',
  'border-amber-500 bg-amber-500/10 text-amber-400'
];

export function BigCalendar({ orders, engineers, currentMonth = 3, currentYear = 2026 }: BigCalendarProps) {
  // Generate days for the grid (assuming April 2026 starts on Wednesday)
  // April has 30 days.
  const daysInMonth = 30;
  const startingDayOfWeek = 2; // Wednesday (0=Mon, 1=Tue, 2=Wed)

  const calendarCells = [];
  
  // Empty cells for the start of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarCells.push({ type: 'empty', id: `empty-start-${i}` });
  }

  // Days of the month
  for (let d = 1; d <= daysInMonth; d++) {
    // Find orders that fall on this day
    const dayDateString = `${currentYear}-0${currentMonth + 1}-${d.toString().padStart(2, '0')}`;
    
    const dayOrders = orders.filter(o => {
      // Basic match on date string
      const orderDate = o.fecha_inicio || o.fecha_creacion || o.startDate || o.date;
      if (!orderDate) return false;
      return orderDate.startsWith(dayDateString);
    });

    calendarCells.push({ type: 'day', day: d, dateStr: dayDateString, orders: dayOrders });
  }

  // Empty cells for the end of the month to complete the grid (35 cells total for a 5x7 grid)
  const totalCells = Math.ceil(calendarCells.length / 7) * 7;
  const remainingCells = totalCells - calendarCells.length;
  for (let i = 0; i < remainingCells; i++) {
    calendarCells.push({ type: 'empty', id: `empty-end-${i}` });
  }

  // Map engineer IDs to colors
  const engColorMap: Record<string, string> = {};
  engineers.forEach((eng, idx) => {
    engColorMap[eng.id] = ENGINEER_COLORS[idx % ENGINEER_COLORS.length];
  });

  return (
    <div className="w-full bg-[#050010] border border-slate-800 rounded-2xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex flex-col">
      {/* Calendar Header */}
      <div className="bg-[#110121] p-4 border-b border-slate-800 flex justify-between items-center">
        <h3 className="text-xl font-bold text-white flex items-center gap-2" style={{ fontFamily: 'var(--font-oswald)' }}>
          <CalendarIcon className="w-5 h-5 text-[#a855f7]" />
          CRONOGRAMA DE MANTENIMIENTO — Abril 2026
        </h3>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full border border-emerald-500 bg-emerald-500/20" />
            <span className="text-xs text-slate-400">Preventivo</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full border border-rose-500 bg-rose-500/20" />
            <span className="text-xs text-slate-400">Correctivo</span>
          </div>
        </div>
      </div>

      {/* Days of Week */}
      <div className="grid grid-cols-7 border-b border-slate-800 bg-[#0a0018]">
        {DAYS_OF_WEEK.map(day => (
          <div key={day} className="py-3 text-center text-xs font-bold text-slate-500 tracking-widest uppercase">
            {day}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 flex-1 min-h-[400px]">
        {calendarCells.map((cell: any, index) => {
          if (cell.type === 'empty') {
            return <div key={cell.id} className="border-r border-b border-slate-800/50 bg-[#050010]/30 min-h-[120px]" />;
          }

          const isToday = cell.day === 28; // Simulating today is April 28

          return (
            <div 
              key={`day-${cell.day}`} 
              className={`border-r border-b border-slate-800 p-2 min-h-[120px] transition-colors hover:bg-[#110121]/50 relative group ${isToday ? 'bg-[#a855f7]/5' : ''}`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`text-sm font-bold ${isToday ? 'text-[#a855f7] bg-[#a855f7]/10 w-7 h-7 rounded-full flex items-center justify-center' : 'text-slate-500'}`}>
                  {cell.day}
                </span>
                {isToday && <span className="text-[9px] uppercase font-bold text-[#a855f7] tracking-wider mt-1">Hoy</span>}
              </div>

              {/* Orders in this day */}
              <div className="space-y-1.5 mt-2">
                {cell.orders.map((order: any) => {
                  const isCorrective = (order.type || order.tipo_mantenimiento) === 'Correctivo';
                  const engId = order.engineerId || order.ingeniero_id;
                  const engineer = engId ? engineers.find(e => e.id === engId || e.id.toString() === engId.toString()) : null;
                  const colorClass = engineer ? engColorMap[engineer.id] : 'border-slate-500 bg-slate-500/10 text-slate-400';
                  const title = order.title || `${order.equipo_nombre || 'Equipo'} - ${order.tipo_mantenimiento}`;

                  return (
                    <div 
                      key={order.id} 
                      className={`text-xs p-1.5 rounded-lg border flex flex-col gap-1 transition-all hover:scale-105 cursor-pointer shadow-sm ${colorClass}`}
                      title={title}
                    >
                      <div className="flex items-center gap-1 font-bold truncate">
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isCorrective ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                        {title}
                      </div>
                      
                      {engineer ? (
                        <div className="flex items-center gap-1 text-[9px] font-medium opacity-80">
                          <UserCircle2 className="w-3 h-3" />
                          <span className="truncate">{engineer.first_name || engineer.name.split(' ')[1]}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-[9px] font-medium text-slate-400">
                          <Clock className="w-3 h-3" />
                          <span>Sin asignar</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

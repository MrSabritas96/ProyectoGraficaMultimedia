"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Users, 
  Settings, 
  ClipboardList, 
  LayoutDashboard, 
  Activity,
  BarChart3,
  LogOut,
  ChevronRight,
  UserCircle,
  ShieldCheck,
  Zap,
  MessageSquare,
  Server,
  Key,
  AlertTriangle,
  FileText,
  Bell
} from 'lucide-react';
import Cookies from 'js-cookie';
import { Logo } from '@/shared/components/Logo';

interface NavItem {
  label: string;
  href: string;
  icon: any;
  roles: string[];
  category?: string;
}

const navItems: NavItem[] = [
  // CORE
  { label: 'Panel de Control', href: '/dashboard', icon: LayoutDashboard, roles: ['Administrador', 'Secretario', 'Jefe de Unidad'], category: 'Menú Principal' },
  { label: 'Ficha Orden de Trabajo', href: '/dashboard/jefe/work-orders/new', icon: ClipboardList, roles: ['Jefe de Unidad'], category: 'Menú Principal' },
  { label: 'Órdenes de Trabajo', href: '/dashboard/work-orders', icon: ClipboardList, roles: ['Jefe de Unidad', 'Ingeniero Electronico'], category: 'Menú Principal' },
  { label: 'Inventario de Equipos', href: '/dashboard/equipment', icon: Activity, roles: ['Secretario', 'Jefe de Unidad', 'Ingeniero Electronico'], category: 'Menú Principal' },
  { label: 'Reportes y Métricas', href: '/dashboard/reports', icon: BarChart3, roles: ['Jefe de Unidad'], category: 'Menú Principal' },
  { label: 'Mi Perfil', href: '/dashboard/profile', icon: UserCircle, roles: ['Administrador', 'Secretario', 'Jefe de Unidad', 'Ingeniero Electronico', 'Doctor'], category: 'Menú Principal' },
  
  // INGENIERO
  { label: 'Alertas de Fallas', href: '/dashboard/engineer/alerts', icon: Bell, roles: ['Ingeniero Electronico'], category: 'Operativa Médica' },

  // DOCTOR
  { label: 'Resumen General', href: '/dashboard/doctor', icon: LayoutDashboard, roles: ['Doctor'], category: 'Operativa Médica' },
  { label: 'Mis Equipos', href: '/dashboard/doctor/equipments', icon: Activity, roles: ['Doctor'], category: 'Operativa Médica' },
  { label: 'Reportar Incidente', href: '/dashboard/doctor/report', icon: AlertTriangle, roles: ['Doctor'], category: 'Operativa Médica' },
  { label: 'Seguimiento Kanban', href: '/dashboard/doctor/tracking', icon: ClipboardList, roles: ['Doctor'], category: 'Operativa Médica' },
  { label: 'Historial', href: '/dashboard/doctor/history', icon: FileText, roles: ['Doctor'], category: 'Operativa Médica' },
  
  // ADMIN - ADMINISTRACIÓN
  { label: 'Gestión Usuarios', href: '/dashboard/admin/users', icon: Users, roles: ['Administrador'], category: 'Administración' },
  { label: 'Roles y Permisos', href: '/dashboard/admin/roles', icon: Key, roles: ['Administrador'], category: 'Administración' },
  
  // ADMIN - SEGURIDAD Y CONTROL
  { label: 'Seguridad', href: '/dashboard/admin/security', icon: ShieldCheck, roles: ['Administrador'], category: 'Seguridad y Control' },
  
  // ADMIN - OPERACIONES
  { label: 'Automatizaciones', href: '/dashboard/admin/automations', icon: Zap, roles: ['Administrador'], category: 'Operaciones' },
  { label: 'Comunicaciones', href: '/dashboard/admin/communications', icon: MessageSquare, roles: ['Administrador'], category: 'Operaciones' },
  
  // ADMIN - AVANZADO
  { label: 'Config. del Sistema', href: '/dashboard/admin/settings', icon: Settings, roles: ['Administrador'], category: 'Avanzado' },
  { label: 'Infraestructura BD', href: '/dashboard/admin/infrastructure', icon: Server, roles: ['Administrador'], category: 'Avanzado' },
];

export const Sidebar: React.FC<{ role: string }> = ({ role }) => {
  const pathname = usePathname();
  
  const filteredItems = navItems
    .filter(item => item.roles.includes(role))
    .map(item => {
      // Para el ingeniero, el Inventario de Equipos es su vista principal y personalizada (dark theme)
      if (item.label === 'Inventario de Equipos' && role === 'Ingeniero Electronico') {
        return { ...item, href: '/dashboard/engineer' };
      }
      return item;
    });

  // Agrupar items por categoría
  const groupedItems = filteredItems.reduce((acc, item) => {
    const cat = item.category || 'Menú Principal';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {} as Record<string, NavItem[]>);

  const handleLogout = async () => {
    try {
      const token = Cookies.get('token');
      if (token) {
        await fetch('http://localhost:8000/api/auth/logout/', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      Cookies.remove('token');
      Cookies.remove('role');
      window.location.href = '/login';
    }
  };

  return (
    <aside className="w-72 h-full bg-[#020005] text-slate-400 flex flex-col border-r border-[#a855f7]/20 relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#7e22ce]/10 blur-[100px] -z-10 rounded-full" />
      
      <div className="p-8 pb-4">
        <h2 className="text-xl font-bold text-white tracking-widest flex items-center gap-4 uppercase" style={{ fontFamily: 'var(--font-oswald)' }}>
          <Logo size={48} className="scale-110" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#e9d5ff] to-[#a855f7] drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]">MEDTRACK</span>
        </h2>
      </div>

      <nav className="flex-1 px-4 space-y-6 overflow-y-auto custom-scrollbar mt-6 pb-6">
        {Object.entries(groupedItems).map(([category, items]) => (
          <div key={category} className="space-y-2">
            <p className="px-4 text-[9px] font-bold uppercase tracking-[0.3em] text-[#a855f7]/80 mb-2">
              {category}
            </p>
            {items.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-500 ${
                    isActive 
                      ? 'bg-[#110121] text-[#e9d5ff] border border-[#a855f7]/30 shadow-[0_0_15px_rgba(126,34,206,0.3)]' 
                      : 'hover:bg-[#110121]/50 hover:text-slate-200 border border-transparent hover:border-[#a855f7]/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={`w-5 h-5 transition-colors duration-500 ${isActive ? 'text-[#a855f7]' : 'text-slate-500 group-hover:text-[#a855f7]'}`} />
                    <span className={`text-sm font-medium tracking-wide ${isActive ? 'text-[#e9d5ff]' : ''}`}>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4 text-[#a855f7]" />}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="p-6 mt-auto border-t border-[#a855f7]/20 bg-[#050010]">
        <div className="p-4 bg-[#110121] rounded-2xl border border-[#a855f7]/20 backdrop-blur-sm mb-4 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-[#7e22ce]/0 via-[#7e22ce]/10 to-[#7e22ce]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
          <div className="flex items-center gap-3 mb-1">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#a855f7]">Sesión Activa</p>
          </div>
          <p className="text-sm text-slate-200 font-semibold truncate">{role}</p>
        </div>

        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 border border-transparent hover:border-rose-500/20 transition-all duration-300 group"
        >
          <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          <span className="text-sm font-medium tracking-wide">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
};

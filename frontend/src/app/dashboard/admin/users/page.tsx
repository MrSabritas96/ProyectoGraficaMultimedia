"use client";

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Edit2, 
  Ban, 
  Trash2, 
  ShieldAlert, 
  X, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  Hash, 
  Phone, 
  Mail, 
  Award
} from 'lucide-react';
import { adminService } from '@/shared/services/adminService';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/shared/components/Badge';

const HIERARCHY = ['Administrador', 'Jefe de Unidad', 'Secretario', 'Ingeniero Electrónico', 'Doctor'];
const ROLES_TABS = ['Todos', 'Administrador', 'Jefe de Unidad', 'Secretario', 'Ingeniero Electrónico', 'Doctor'];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Separated Search States
  const [searchCodigo, setSearchCodigo] = useState('');
  const [searchNombre, setSearchNombre] = useState('');
  const [searchApellido, setSearchApellido] = useState('');
  const [searchRol, setSearchRol] = useState('');

  // Filtering & Sorting
  const [filter, setFilter] = useState('Todos');
  const [activeRoleTab, setActiveRoleTab] = useState('Todos');
  
  // Pagination
  const [page, setPage] = useState(1);
  const limit = 6;

  // Carousel States
  const [rotation, setRotation] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [hoveredUserId, setHoveredUserId] = useState<number | null>(null);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    ci: '',
    matricula: '',
    cellphone: '',
    descripcion_perfil: '',
    password: '',
    role_id: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  // Reset page and rotation on tab/filter change
  useEffect(() => {
    setPage(1);
    setRotation(0);
  }, [activeRoleTab, searchCodigo, searchNombre, searchApellido, searchRol, filter]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const Cookies = await import('js-cookie');
      const token = Cookies.default.get('token');
      const meRes = await fetch('http://localhost:8000/api/users/me/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (meRes.ok) {
        const meData = await meRes.json();
        setCurrentUser(meData);
      }
      
      const [usersData, rolesData] = await Promise.all([
        adminService.getUsers(),
        adminService.getRoles()
      ]);
      setUsers(usersData);
      setRoles(rolesData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSortedAndFilteredUsers = () => {
    let result = [...users];

    // Filter by Active/Suspended
    if (filter === 'Activos') result = result.filter(u => u.is_active);
    if (filter === 'Suspendidos') result = result.filter(u => !u.is_active);

    // Filter by Role Tab
    if (activeRoleTab !== 'Todos') {
      const targetRole = activeRoleTab.toLowerCase();
      result = result.filter(u => {
        if (!u.role_name) return false;
        const uRole = u.role_name.toLowerCase();
        if (targetRole === 'ingeniero electrónico') {
          return uRole.includes('ingeniero');
        }
        return uRole === targetRole;
      });
    }

    // Separated Search Fields
    if (searchCodigo) {
      const val = searchCodigo.toLowerCase();
      result = result.filter(u => u.codigo_unico && u.codigo_unico.toLowerCase().includes(val));
    }
    if (searchNombre) {
      const val = searchNombre.toLowerCase();
      result = result.filter(u => u.first_name && u.first_name.toLowerCase().includes(val));
    }
    if (searchApellido) {
      const val = searchApellido.toLowerCase();
      result = result.filter(u => u.last_name && u.last_name.toLowerCase().includes(val));
    }
    if (searchRol) {
      const val = searchRol.toLowerCase();
      result = result.filter(u => u.role_name && u.role_name.toLowerCase().includes(val));
    }

    // Sort by Hierarchy (descending order by default)
    result.sort((a, b) => {
      const idxA = HIERARCHY.indexOf(a.role_name);
      const idxB = HIERARCHY.indexOf(b.role_name);
      const posA = idxA === -1 ? 99 : idxA;
      const posB = idxB === -1 ? 99 : idxB;
      return posA - posB;
    });

    return result;
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        const payload: any = { ...formData };
        if (!payload.password) delete payload.password;
        await adminService.updateUser(editingUser.id, payload);
      } else {
        await adminService.createUser(formData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error: any) {
      alert("Error: " + error.message);
    }
  };

  const handleToggleStatus = async (user: any) => {
    if (currentUser && currentUser.id === user.id) {
        alert("Acción Denegada: No puedes suspender tu propia sesión activa.");
        return;
    }
    try {
      await adminService.updateUser(user.id, { is_active: !user.is_active });
      fetchData();
    } catch (error) {
      console.error("Error updating status", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (currentUser && currentUser.id === id) {
        alert("Acción Denegada: No puedes eliminar tu propia cuenta.");
        return;
    }
    if (confirm("¿Estás seguro de eliminar este usuario permanentemente?")) {
      try {
        await adminService.deleteUser(id);
        fetchData();
      } catch (error) {
        console.error("Error deleting user", error);
      }
    }
  };

  const openNewModal = () => {
    setEditingUser(null);
    setFormData({ first_name: '', last_name: '', email: '', ci: '', matricula: '', cellphone: '', descripcion_perfil: '', password: '', role_id: roles.length > 0 ? roles[0].id : '' });
    setIsModalOpen(true);
  };

  const openEditModal = (user: any) => {
    setEditingUser(user);
    setFormData({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email || '',
      ci: user.ci || '',
      matricula: user.matricula || '',
      cellphone: user.cellphone || '',
      descripcion_perfil: user.descripcion_perfil || '',
      password: '',
      role_id: user.role_id || ''
    });
    setIsModalOpen(true);
  };

  const allFilteredUsers = getSortedAndFilteredUsers();
  const totalPages = Math.ceil(allFilteredUsers.length / limit);
  const paginatedUsers = allFilteredUsers.slice((page - 1) * limit, page * limit);

  const numItems = paginatedUsers.length;
  const angle = numItems > 1 ? 360 / numItems : 0;
  const tz = numItems > 1 ? Math.round((300 / 2) / Math.tan(Math.PI / numItems)) + 90 : 0;

  // Auto rotation
  useEffect(() => {
    if (isHovered || numItems <= 1) return;
    const timer = setInterval(() => {
      setRotation(prev => prev - angle);
    }, 6000);
    return () => clearInterval(timer);
  }, [isHovered, numItems, angle]);

  const handlePrev = () => setRotation(prev => prev + angle);
  const handleNext = () => setRotation(prev => prev - angle);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in relative text-white">
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#7e22ce]/5 blur-[120px] -z-10 rounded-full" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#3b82f6]/5 blur-[120px] -z-10 rounded-full" />

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 font-oswald tracking-wide flex items-center gap-3" style={{ fontFamily: 'var(--font-oswald)' }}>
            <Users className="w-9 h-9 text-[#a855f7]" />
            Gestión de Usuarios
          </h1>
          <p className="text-slate-400 mt-2">Administra accesos, roles y seguridad de las cuentas del sistema.</p>
        </div>
        <button onClick={openNewModal} className="flex items-center gap-2 px-6 py-3 bg-[#a855f7] hover:bg-[#9333ea] text-white rounded-xl font-medium transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] active:scale-95">
          <Plus className="w-5 h-5" />
          Nuevo Usuario
        </button>
      </header>

      {/* Mini dashboard stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#050010] border border-slate-800 rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#a855f7]/5 blur-[50px] group-hover:bg-[#a855f7]/10 transition-colors" />
          <p className="text-slate-400 text-sm font-medium mb-1">Total Usuarios</p>
          <p className="text-3xl font-bold text-white font-oswald">{users.length}</p>
        </div>
        <div className="bg-[#050010] border border-slate-800 rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[50px] group-hover:bg-emerald-500/10 transition-colors" />
          <p className="text-slate-400 text-sm font-medium mb-1">Usuarios Activos</p>
          <p className="text-3xl font-bold text-white font-oswald">{users.filter(u => u.is_active).length}</p>
        </div>
        <div className="bg-[#050010] border border-slate-800 rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 blur-[50px] group-hover:bg-rose-500/10 transition-colors" />
          <p className="text-slate-400 text-sm font-medium mb-1">Cuentas Suspendidas</p>
          <p className="text-3xl font-bold text-white font-oswald">{users.filter(u => !u.is_active).length}</p>
        </div>
      </div>

      <div className="bg-[#050010]/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
        {/* Separated Search Bar */}
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Buscador Especializado</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Código Único..." 
                value={searchCodigo}
                onChange={(e) => setSearchCodigo(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#110121] border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-[#a855f7] transition-all text-sm"
              />
            </div>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Nombre..." 
                value={searchNombre}
                onChange={(e) => setSearchNombre(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#110121] border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-[#a855f7] transition-all text-sm"
              />
            </div>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Apellido..." 
                value={searchApellido}
                onChange={(e) => setSearchApellido(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#110121] border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-[#a855f7] transition-all text-sm"
              />
            </div>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Rol..." 
                value={searchRol}
                onChange={(e) => setSearchRol(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#110121] border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-[#a855f7] transition-all text-sm"
              />
            </div>
          </div>
        </div>

        {/* Categories Tabs & Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-t border-slate-800 pt-6">
          <div className="flex overflow-x-auto gap-2 pb-2 lg:pb-0 scrollbar-hide snap-x">
            {ROLES_TABS.map((roleTab) => (
              <button
                key={roleTab}
                type="button"
                onClick={() => setActiveRoleTab(roleTab)}
                className={`snap-start px-5 py-2 rounded-full text-xs font-bold tracking-wider uppercase whitespace-nowrap transition-all duration-300 ${
                  activeRoleTab === roleTab 
                    ? 'bg-gradient-to-r from-[#a855f7] to-[#7e22ce] text-white shadow-[0_0_15px_rgba(168,85,247,0.4)] border border-transparent' 
                    : 'bg-[#110121] text-slate-400 border border-slate-800 hover:border-[#a855f7]/50 hover:text-white'
                }`}
              >
                {roleTab}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <button onClick={() => setFilter('Todos')} className={`px-4 py-2.5 rounded-xl transition-colors border text-xs font-bold uppercase tracking-wider ${filter === 'Todos' ? 'bg-[#a855f7]/20 border-[#a855f7] text-[#a855f7]' : 'bg-[#110121] border-slate-700 text-slate-300 hover:border-[#a855f7]/50'}`}>
              Todos
            </button>
            <button onClick={() => setFilter('Activos')} className={`px-4 py-2.5 rounded-xl transition-colors border text-xs font-bold uppercase tracking-wider ${filter === 'Activos' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-[#110121] border-slate-700 text-slate-300 hover:border-[#a855f7]/50'}`}>
              Activos
            </button>
            <button onClick={() => setFilter('Suspendidos')} className={`px-4 py-2.5 rounded-xl transition-colors border text-xs font-bold uppercase tracking-wider ${filter === 'Suspendidos' ? 'bg-rose-500/20 border-rose-500 text-rose-400' : 'bg-[#110121] border-slate-700 text-slate-300 hover:border-[#a855f7]/50'}`}>
              Suspendidos
            </button>
          </div>
        </div>

        {/* 3D Carousel & Card Layout */}
        <div 
          className="relative min-h-[520px] flex flex-col items-center justify-center border-t border-slate-800/50 pt-8 overflow-visible"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-8 h-8 border-4 border-[#a855f7] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : paginatedUsers.length === 0 ? (
            <div className="text-center py-16 text-slate-500 font-bold uppercase tracking-widest">
              No se encontraron usuarios.
            </div>
          ) : paginatedUsers.length === 1 ? (
            // Single User Render (No carousel required)
            <div className="w-[310px] h-[440px]">
              <UserCard 
                user={paginatedUsers[0]} 
                currentUser={currentUser}
                onEdit={openEditModal}
                onToggleStatus={handleToggleStatus}
                onDelete={handleDelete}
              />
            </div>
          ) : (
            // 3D Rotating Carousel
            <div className="relative w-full h-[450px] flex items-center justify-center perspective-2000 overflow-visible">
              {/* Carousel Controls */}
              <button 
                onClick={handlePrev}
                className="absolute left-2 z-40 w-11 h-11 bg-[#110121]/80 hover:bg-[#a855f7]/30 border border-[#a855f7]/30 rounded-full flex items-center justify-center text-[#a855f7] hover:text-white transition-all backdrop-blur-md opacity-0 group-hover:opacity-100"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button 
                onClick={handleNext}
                className="absolute right-2 z-40 w-11 h-11 bg-[#110121]/80 hover:bg-[#a855f7]/30 border border-[#a855f7]/30 rounded-full flex items-center justify-center text-[#a855f7] hover:text-white transition-all backdrop-blur-md opacity-0 group-hover:opacity-100"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              <motion.div
                className="relative w-[300px] h-[430px] preserve-3d"
                animate={{ rotateY: rotation }}
                transition={{ type: "spring", stiffness: 45, damping: 18 }}
              >
                {paginatedUsers.map((user, idx) => {
                  const itemRotation = angle * idx;
                  const isItemHovered = hoveredUserId === user.id;

                  return (
                    <motion.div
                      key={user.id}
                      className="absolute top-0 left-0 w-full h-full preserve-3d"
                      style={{ transform: `rotateY(${itemRotation}deg) translateZ(${tz}px)` }}
                    >
                      <motion.div
                        onMouseEnter={() => setHoveredUserId(user.id)}
                        onMouseLeave={() => setHoveredUserId(null)}
                        animate={{ scale: isItemHovered ? 1.05 : 1, y: isItemHovered ? -10 : 0 }}
                        className="w-full h-full"
                      >
                        <UserCard 
                          user={user} 
                          currentUser={currentUser}
                          isHovered={isItemHovered}
                          onEdit={openEditModal}
                          onToggleStatus={handleToggleStatus}
                          onDelete={handleDelete}
                        />
                      </motion.div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>
          )}

          {/* Pagination dots & chevrons below */}
          {!isLoading && totalPages > 1 && (
            <div className="flex items-center justify-center gap-6 mt-6 relative z-30">
              <button 
                type="button"
                onClick={() => setPage(p => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="w-9 h-9 rounded-full flex items-center justify-center bg-[#110121] border border-[#a855f7]/30 text-[#a855f7] hover:bg-[#a855f7]/20 hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-[#110121]"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`transition-all duration-300 rounded-full h-2 ${page === i + 1 ? 'w-8 bg-[#a855f7] shadow-[0_0_10px_rgba(168,85,247,0.8)]' : 'w-2 bg-slate-700 hover:bg-[#a855f7]/50'}`} 
                  />
                ))}
              </div>

              <button 
                type="button"
                onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="w-9 h-9 rounded-full flex items-center justify-center bg-[#110121] border border-[#a855f7]/30 text-[#a855f7] hover:bg-[#a855f7]/20 hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-[#110121]"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* User Edit/Create Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#0a0118] border border-[#a855f7]/30 rounded-3xl w-full max-w-3xl overflow-hidden shadow-[0_0_50px_rgba(126,34,206,0.3)] relative"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#a855f7]/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex justify-between items-center p-6 border-b border-[#a855f7]/20 bg-gradient-to-r from-[#110121] to-[#0a0118]">
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-[#a855f7] tracking-wide uppercase" style={{ fontFamily: 'var(--font-oswald)' }}>
                  {editingUser ? 'Editar Usuario del Sistema' : 'Crear Nuevo Usuario'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 p-2 rounded-full transition-colors relative z-10">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveUser} className="p-8 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar relative z-10">
                {!editingUser && (
                  <div className="bg-[#a855f7]/10 border border-[#a855f7]/30 p-4 rounded-xl mb-6">
                    <p className="text-sm text-[#d8b4fe] flex items-start gap-2">
                      <ShieldAlert className="w-5 h-5 text-[#a855f7] shrink-0" />
                      Nota: El "Código Único" se generará automáticamente a partir del Rol seleccionado y la Matrícula del usuario.
                    </p>
                  </div>
                )}

                <div>
                  <h3 className="text-xs font-bold text-[#a855f7] uppercase tracking-widest mb-4 border-b border-[#a855f7]/20 pb-2">Datos Personales</h3>
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Nombres <span className="text-rose-500">*</span></label>
                      <input type="text" required value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} className="w-full bg-[#110121] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#a855f7] transition-colors" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Apellidos <span className="text-rose-500">*</span></label>
                      <input type="text" required value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} className="w-full bg-[#110121] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#a855f7] transition-colors" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">C.I.</label>
                      <input type="text" value={formData.ci} onChange={e => setFormData({...formData, ci: e.target.value})} className="w-full bg-[#110121] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#a855f7] transition-colors" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Celular</label>
                      <input type="text" value={formData.cellphone} onChange={e => setFormData({...formData, cellphone: e.target.value})} className="w-full bg-[#110121] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#a855f7] transition-colors" />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-4 border-b border-emerald-500/20 pb-2 mt-8">Datos Institucionales</h3>
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Correo Electrónico <span className="text-rose-500">*</span></label>
                      <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-[#110121] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Matrícula Universitaria <span className="text-rose-500">*</span></label>
                      <input type="text" required value={formData.matricula} onChange={e => setFormData({...formData, matricula: e.target.value})} placeholder="Ej: SIB-12345" className="w-full bg-[#110121] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Rol en el Sistema <span className="text-rose-500">*</span></label>
                      <select required value={formData.role_id} onChange={e => setFormData({...formData, role_id: e.target.value})} className="w-full bg-[#110121] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer appearance-none">
                        {roles.map(r => (
                          <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{editingUser ? 'Nueva Contraseña (Opcional)' : 'Contraseña Temporal *'}</label>
                      <input type={editingUser ? "password" : "text"} required={!editingUser} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder={editingUser ? 'Dejar en blanco para mantener' : 'Ej: MedTrack2024*'} className="w-full bg-[#110121] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Descripción / Notas de Perfil</label>
                      <textarea value={formData.descripcion_perfil} onChange={e => setFormData({...formData, descripcion_perfil: e.target.value})} rows={3} className="w-full bg-[#110121] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors resize-none" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-6 border-t border-slate-800 mt-8">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-3 rounded-xl text-sm font-bold text-slate-400 hover:text-white bg-[#110121] border border-slate-700 transition-colors uppercase tracking-widest">
                    Cancelar
                  </button>
                  <button type="submit" className="px-8 py-3 bg-gradient-to-r from-[#a855f7] to-[#7e22ce] text-white rounded-xl text-sm font-bold shadow-[0_0_15px_rgba(168,85,247,0.4)] hover:shadow-[0_0_25px_rgba(168,85,247,0.6)] flex items-center gap-2 transition-all uppercase tracking-widest">
                    <Check className="w-5 h-5" />
                    {editingUser ? 'Guardar Cambios' : 'Registrar Usuario'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface UserCardProps {
  user: any;
  currentUser: any;
  isHovered?: boolean;
  onEdit: (user: any) => void;
  onToggleStatus: (user: any) => void;
  onDelete: (id: number) => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, currentUser, isHovered = false, onEdit, onToggleStatus, onDelete }) => {
  const isMe = currentUser && currentUser.id === user.id;
  const avatarUrl = user.photo 
    ? (user.photo.startsWith('http') ? user.photo : `http://localhost:8000${user.photo}`) 
    : 'http://localhost:8000/media/profiles/default.png';

  return (
    <div className={`relative w-full h-full rounded-2xl overflow-hidden shadow-2xl flex flex-col transition-all duration-500 ease-out border p-6 bg-[#050010]/95 backdrop-blur-md ${
      isHovered 
        ? user.is_active 
          ? 'border-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.3)] bg-[#110121]/95' 
          : 'border-rose-500 shadow-[0_0_25px_rgba(244,63,94,0.3)] bg-[#110121]/95' 
        : 'border-slate-800/80'
    }`}>
      {/* Glow highlight */}
      <div className={`absolute top-0 right-0 w-32 h-32 blur-[50px] pointer-events-none -z-10 rounded-full transition-colors ${
        user.is_active ? 'bg-emerald-500/10' : 'bg-rose-500/10'
      }`} />

      {/* Card Header */}
      <div className="flex items-center justify-between mb-4">
        <Badge variant={user.is_active ? 'success' : 'error'} pulse={!user.is_active}>
          {user.is_active ? 'Activo' : 'Suspendido'}
        </Badge>
        
        <span className="text-[10px] font-mono text-[#a855f7] bg-[#a855f7]/10 px-2 py-0.5 rounded border border-[#a855f7]/20">
          {user.codigo_unico}
        </span>
      </div>

      {/* Profile Picture */}
      <div className="flex flex-col items-center mb-4 relative">
        <div className={`w-24 h-24 rounded-full border-4 overflow-hidden shadow-lg object-cover transition-colors duration-500 ${
          user.is_active 
            ? 'border-emerald-500/50 shadow-emerald-500/10' 
            : 'border-rose-500/50 shadow-rose-500/10'
        }`}>
          <img 
            src={avatarUrl}
            alt={`${user.first_name} ${user.last_name}`}
            className="w-full h-full object-cover"
            onError={(e: any) => { e.target.src = 'http://localhost:8000/media/profiles/default.png' }}
          />
        </div>
        
        {/* Operational Status (for Engineers, Chiefs, Doctors) */}
        {user.is_active && user.role_name && ['Ingeniero Electronico', 'Jefe de Unidad', 'Doctor'].includes(user.role_name) && (
          <div className="absolute -bottom-2">
            <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border shadow-md
              ${user.estado_operativo === 'Disponible' ? 'bg-emerald-500 text-white border-emerald-400' : 
                user.estado_operativo === 'Ocupado' ? 'bg-rose-500 text-white border-rose-400' : 
                user.estado_operativo === 'Fuera de Unidad' ? 'bg-amber-500 text-white border-amber-400' : 
                'bg-slate-700 text-slate-300 border-slate-600'}`}>
              {user.estado_operativo || 'Desconectado'}
            </span>
          </div>
        )}
      </div>

      {/* User Information */}
      <div className="flex-1 space-y-3 text-center mt-2">
        <div>
          <h3 className="text-lg font-bold text-white tracking-tight leading-tight truncate">
            {user.first_name || user.last_name ? `${user.first_name} ${user.last_name}` : 'Sin Nombre'}
          </h3>
          <p className="text-xs text-[#a855f7] font-semibold mt-0.5 tracking-wider uppercase">{user.role_name || 'Sin Rol'}</p>
        </div>

        <div className="text-left bg-[#110121]/40 p-3 rounded-xl border border-slate-800/80 space-y-1 text-xs text-slate-300">
          <p className="truncate flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-slate-500" /> {user.email}</p>
          <p className="truncate flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-slate-500" /> Tel: {user.cellphone || 'N/A'}</p>
          <p className="truncate flex items-center gap-2"><Hash className="w-3.5 h-3.5 text-slate-500" /> CI: {user.ci || 'N/A'}</p>
          {user.matricula && (
            <p className="truncate flex items-center gap-2"><Award className="w-3.5 h-3.5 text-slate-500" /> Mat: {user.matricula}</p>
          )}
        </div>
      </div>

      {/* Card Actions */}
      <div className="flex items-center gap-2 pt-4 border-t border-slate-800/80 mt-4 justify-center">
        <button 
          onClick={() => onEdit(user)}
          className="flex-1 py-2 px-3 bg-[#110121] hover:bg-[#a855f7]/20 border border-[#a855f7]/30 text-[#e9d5ff] rounded-xl text-xs font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-1.5"
          title="Editar Perfil"
        >
          <Edit2 className="w-3.5 h-3.5" />
          Editar
        </button>

        <button 
          onClick={() => onToggleStatus(user)}
          disabled={isMe}
          className={`p-2 border rounded-xl transition-all disabled:opacity-20 ${
            user.is_active 
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20' 
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
          }`}
          title={user.is_active ? 'Suspender Cuenta' : 'Activar Cuenta'}
        >
          <Ban className="w-4 h-4" />
        </button>

        <button 
          onClick={() => onDelete(user.id)}
          disabled={isMe}
          className="p-2 bg-red-600/10 border border-red-500/30 text-red-400 hover:bg-red-600/20 rounded-xl transition-all disabled:opacity-20"
          title="Eliminar Permanente"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

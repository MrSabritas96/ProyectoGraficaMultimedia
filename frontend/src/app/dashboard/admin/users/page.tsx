"use client";

import React, { useState, useEffect } from 'react';
import { Users, Search, Plus, MoreVertical, Edit2, Ban, Trash2, KeyRound, ShieldAlert, X, Check, ArrowUpDown } from 'lucide-react';
import { adminService } from '@/shared/services/adminService';
import { motion, AnimatePresence } from 'framer-motion';

const HIERARCHY = ['Administrador', 'Jefe de Unidad', 'Secretario', 'Ingeniero Electrónico', 'Doctor'];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('Todos');
  const [sortAsc, setSortAsc] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  
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

  const fetchData = async () => {
    try {
      setIsLoading(true);
      import('js-cookie').then(async (Cookies) => {
          const token = Cookies.default.get('token');
          const meRes = await fetch('http://localhost:8000/api/users/me/', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const meData = await meRes.json();
          setCurrentUser(meData);
      });
      
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

  const handleSort = () => {
    setSortAsc(!sortAsc);
  };

  const getSortedAndFilteredUsers = () => {
    let result = [...users];

    // Filter by Active/Suspended
    if (filter === 'Activos') result = result.filter(u => u.is_active);
    if (filter === 'Suspendidos') result = result.filter(u => !u.is_active);

    // Search by Name, Email or Code
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(u => 
        (u.first_name && u.first_name.toLowerCase().includes(lowerSearch)) ||
        (u.last_name && u.last_name.toLowerCase().includes(lowerSearch)) ||
        (u.email && u.email.toLowerCase().includes(lowerSearch)) ||
        (u.codigo_unico && u.codigo_unico.toLowerCase().includes(lowerSearch))
      );
    }

    // Sort by Hierarchy
    result.sort((a, b) => {
      const idxA = HIERARCHY.indexOf(a.role_name);
      const idxB = HIERARCHY.indexOf(b.role_name);
      // If role not found in hierarchy, put it at the end
      const posA = idxA === -1 ? 99 : idxA;
      const posB = idxB === -1 ? 99 : idxB;
      
      return sortAsc ? posA - posB : posB - posA;
    });

    return result;
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        // Update
        const payload = { ...formData };
        if (!payload.password) delete payload.password; // Don't send empty password
        await adminService.updateUser(editingUser.id, payload);
      } else {
        // Create
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

  const filteredUsers = getSortedAndFilteredUsers();

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in relative">
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#7e22ce]/5 blur-[120px] -z-10 rounded-full" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#3b82f6]/5 blur-[120px] -z-10 rounded-full" />

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 font-oswald tracking-wide flex items-center gap-3">
            <Users className="w-8 h-8 text-[#a855f7]" />
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

      <div className="bg-[#050010]/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-2xl">
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input 
              type="text" 
              placeholder="Buscar por nombre, correo o código..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-[#110121] border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-[#a855f7] focus:ring-1 focus:ring-[#a855f7] transition-all"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={handleSort} className="flex items-center gap-2 px-4 py-2 bg-[#110121] border border-[#a855f7]/30 text-[#a855f7] rounded-xl hover:bg-[#a855f7]/10 transition-colors">
              <ArrowUpDown className="w-4 h-4" />
              Jerarquía {sortAsc ? '(Desc)' : '(Asc)'}
            </button>
            <button onClick={() => setFilter('Todos')} className={`px-4 py-2 rounded-xl transition-colors border ${filter === 'Todos' ? 'bg-[#a855f7]/20 border-[#a855f7] text-[#a855f7]' : 'bg-[#110121] border-slate-700 text-slate-300 hover:border-[#a855f7]/50'}`}>
              Todos
            </button>
            <button onClick={() => setFilter('Activos')} className={`px-4 py-2 rounded-xl transition-colors border ${filter === 'Activos' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-[#110121] border-slate-700 text-slate-300 hover:border-[#a855f7]/50'}`}>
              Activos
            </button>
            <button onClick={() => setFilter('Suspendidos')} className={`px-4 py-2 rounded-xl transition-colors border ${filter === 'Suspendidos' ? 'bg-rose-500/20 border-rose-500 text-rose-400' : 'bg-[#110121] border-slate-700 text-slate-300 hover:border-[#a855f7]/50'}`}>
              Suspendidos
            </button>
          </div>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          {isLoading ? (
             <div className="flex justify-center items-center h-64">
               <div className="w-8 h-8 border-4 border-[#a855f7] border-t-transparent rounded-full animate-spin"></div>
             </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-sm tracking-wider uppercase">
                  <th className="p-4 font-medium">Usuario</th>
                  <th className="p-4 font-medium">Rol / Jerarquía</th>
                  <th className="p-4 font-medium">Estado</th>
                  <th className="p-4 font-medium">Último Acceso</th>
                  <th className="p-4 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                <AnimatePresence>
                {filteredUsers.map((user) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={user.id} 
                    className="group hover:bg-[#110121]/50 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={user.photo ? `http://localhost:8000${user.photo}` : 'http://localhost:8000/media/profiles/default.png'} 
                          alt="Profile"
                          className="w-10 h-10 rounded-full border border-slate-700 object-cover"
                          onError={(e: any) => { e.target.src = 'http://localhost:8000/media/profiles/default.png' }}
                        />
                        <div>
                          <p className="font-medium text-slate-200">
                            <span className="text-[#a855f7] font-mono mr-2 text-xs bg-[#a855f7]/10 px-1 rounded">{user.codigo_unico}</span>
                            {user.first_name || user.last_name ? `${user.first_name} ${user.last_name}` : 'Sin Nombre'}
                          </p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-3 py-1 bg-[#1e1b4b] text-[#818cf8] border border-[#3730a3] rounded-full text-xs font-medium tracking-wide">
                        {user.role_name || 'Sin Rol'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-2 h-2 rounded-full ${user.is_active ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'}`} />
                        <span className={`text-sm ${user.is_active ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {user.is_active ? 'Cuenta Activa' : 'Suspendida'}
                        </span>
                      </div>
                      {user.is_active && user.role_name && ['Ingeniero Electronico', 'Jefe de Unidad', 'Doctor'].includes(user.role_name) && (
                        <div className="flex items-center gap-1 mt-1">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest border
                            ${user.estado_operativo === 'Disponible' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                              user.estado_operativo === 'Ocupado' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 
                              user.estado_operativo === 'Fuera de Unidad' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                              'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
                            {user.estado_operativo || 'Desconectado'}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-sm text-slate-400">
                      {user.last_login ? new Date(user.last_login).toLocaleString() : 'Nunca'}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEditModal(user)} className="p-2 text-slate-400 hover:text-[#a855f7] hover:bg-[#a855f7]/10 rounded-lg transition-colors" title="Editar Perfil">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleToggleStatus(user)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors" title={user.is_active ? 'Suspender' : 'Activar'}>
                          <Ban className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(user.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-600/10 rounded-lg transition-colors" title="Eliminar Permanente">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
                </AnimatePresence>
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center p-8 text-slate-500">No se encontraron usuarios.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* User Modal */}
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

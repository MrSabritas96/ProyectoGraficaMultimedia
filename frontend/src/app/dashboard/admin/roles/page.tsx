"use client";

import React, { useState, useEffect } from 'react';
import { Key, Shield, Plus, Check } from 'lucide-react';
import { adminService } from '@/shared/services/adminService';

const modulesList = [
  'Gestión de Órdenes',
  'Inventario de Equipos',
  'Reportes y Analíticas',
  'Configuración del Sistema',
  'Gestión de Usuarios',
  'Seguridad y Control'
];

const actionsList = ['Ver', 'Crear', 'Editar', 'Eliminar'];

export default function AdminRolesPage() {
  const [roles, setRoles] = useState<any[]>([]);
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [permisos, setPermisos] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setIsLoading(true);
      const data = await adminService.getRoles();
      setRoles(data);
      if (data.length > 0 && !selectedRole) {
        handleSelectRole(data[0]);
      } else if (selectedRole) {
        const updatedRole = data.find((r: any) => r.id === selectedRole.id);
        if (updatedRole) handleSelectRole(updatedRole);
      }
    } catch (error) {
      console.error("Error fetching roles", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectRole = (role: any) => {
    setSelectedRole(role);
    setPermisos(role.permisos || {});
  };

  const togglePermission = (module: string, action: string) => {
    setPermisos((prev: any) => {
      const modulePerms = prev[module] || [];
      if (modulePerms.includes(action)) {
        return { ...prev, [module]: modulePerms.filter((a: string) => a !== action) };
      } else {
        return { ...prev, [module]: [...modulePerms, action] };
      }
    });
  };

  const hasPermission = (module: string, action: string) => {
    return permisos[module]?.includes(action) || false;
  };

  const handleSave = async () => {
    if (!selectedRole) return;
    try {
      setIsSaving(true);
      await adminService.updateRole(selectedRole.id, { permisos });
      alert("Permisos guardados correctamente en la base de datos.");
      fetchRoles();
    } catch (error) {
      console.error("Error saving permissions", error);
      alert("Hubo un error al guardar los permisos.");
    } finally {
      setIsSaving(false);
    }
  };

  const getRoleColor = (idx: number) => {
    const colors = [
      'from-[#7e22ce] to-[#d8b4fe]',
      'from-[#f59e0b] to-[#fbbf24]',
      'from-[#10b981] to-[#34d399]',
      'from-[#3b82f6] to-[#60a5fa]',
      'from-[#06b6d4] to-[#67e8f9]'
    ];
    return colors[idx % colors.length];
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in relative">
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#f59e0b]/5 blur-[120px] -z-10 rounded-full" />
      
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 font-oswald tracking-wide flex items-center gap-3">
            <Key className="w-8 h-8 text-[#f59e0b]" />
            Roles y Permisos (RBAC)
          </h1>
          <p className="text-slate-400 mt-2">Control granular de accesos y jerarquías del sistema.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-[#110121] border border-[#f59e0b]/50 hover:bg-[#f59e0b]/10 text-[#f59e0b] rounded-xl font-medium transition-all shadow-[0_0_15px_rgba(245,158,11,0.1)] hover:shadow-[0_0_25px_rgba(245,158,11,0.2)] active:scale-95">
          <Plus className="w-5 h-5" />
          Crear Rol Personalizado
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Roles List */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-xl font-oswald text-white mb-4">Roles del Sistema</h2>
          {isLoading ? (
             <div className="flex justify-center items-center h-32">
               <div className="w-6 h-6 border-4 border-[#f59e0b] border-t-transparent rounded-full animate-spin"></div>
             </div>
          ) : (
            roles.map((role, idx) => {
              const isSelected = selectedRole?.id === role.id;
              return (
                <div 
                  key={role.id} 
                  onClick={() => handleSelectRole(role)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${isSelected ? 'bg-[#110121] border-[#f59e0b]/50 shadow-[0_0_20px_rgba(245,158,11,0.1)]' : 'bg-[#050010] border-slate-800 hover:border-slate-600'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full bg-gradient-to-br ${getRoleColor(idx)}`} />
                      <h3 className={`font-medium ${isSelected ? 'text-[#f59e0b]' : 'text-slate-200'}`}>{role.name}</h3>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">{role.description || 'Sin descripción'}</p>
                </div>
              );
            })
          )}
        </div>

        {/* Permissions Grid */}
        <div className="lg:col-span-2 bg-[#050010]/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#7e22ce] via-[#f59e0b] to-[#10b981]" />
          
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-oswald text-white">Permisos: <span className="text-[#f59e0b]">{selectedRole?.name || 'Seleccione un Rol'}</span></h2>
              <p className="text-sm text-slate-400 mt-1">Configura qué acciones puede realizar este rol en la base de datos.</p>
            </div>
            <Shield className="w-10 h-10 text-slate-700 opacity-50" />
          </div>

          <div className="space-y-6">
            {modulesList.map((module) => (
              <div key={module} className="bg-[#110121] border border-slate-800 rounded-xl p-5">
                <h4 className="text-slate-200 font-medium mb-4">{module}</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {actionsList.map((action) => {
                    const isChecked = hasPermission(module, action);
                    return (
                      <label key={action} className="flex items-center gap-3 cursor-pointer group" onClick={() => togglePermission(module, action)}>
                        <div className={`relative flex items-center justify-center w-5 h-5 rounded border transition-colors ${isChecked ? 'border-[#f59e0b] bg-[#f59e0b]/20 text-[#f59e0b]' : 'border-slate-600 bg-transparent text-transparent group-hover:border-[#f59e0b]/50'}`}>
                          <Check className="w-3 h-3" />
                        </div>
                        <span className={`text-sm transition-colors ${isChecked ? 'text-slate-200' : 'text-slate-400 group-hover:text-slate-300'}`}>{action}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 flex justify-end gap-4">
            <button onClick={() => handleSelectRole(selectedRole)} className="px-6 py-2 rounded-xl text-slate-400 hover:text-white transition-colors">
              Descartar
            </button>
            <button 
              onClick={handleSave}
              disabled={isSaving || !selectedRole}
              className={`px-6 py-2 bg-gradient-to-r from-[#f59e0b] to-[#d97706] text-white rounded-xl font-medium shadow-[0_0_15px_rgba(245,158,11,0.4)] hover:shadow-[0_0_25px_rgba(245,158,11,0.6)] transition-all flex items-center gap-2 ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : null}
              {isSaving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

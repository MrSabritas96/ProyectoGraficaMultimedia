"use client";

import React, { useState } from 'react';
import { HttpEquipmentRepository } from '../../infrastructure/HttpEquipmentRepository';
import { Save, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const CreateEquipmentForm: React.FC = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    codigo_interno: '',
    area: '',
    descripcion: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const repo = new HttpEquipmentRepository();

    try {
      await repo.create(formData);
      window.location.href = '/dashboard/equipment';
    } catch (err: any) {
      setError(err.message || 'Error al registrar el equipo');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">Registrar Nuevo Equipo</h2>
        <Link href="/dashboard/equipment" className="text-slate-500 hover:text-slate-800 flex items-center gap-1 text-sm transition-colors">
          <ArrowLeft className="w-4 h-4" /> Volver
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {error && (
          <div className="p-4 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">Nombre del Equipo</label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              placeholder="Ej: Monitor Multiparámetros"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">Código Interno</label>
            <input
              type="text"
              value={formData.codigo_interno}
              onChange={(e) => setFormData({ ...formData, codigo_interno: e.target.value })}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              placeholder="Ej: EQ-2024-001"
              required
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-semibold text-slate-700">Área / Unidad</label>
          <input
            type="text"
            value={formData.area}
            onChange={(e) => setFormData({ ...formData, area: e.target.value })}
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            placeholder="Ej: Cuidados Intensivos"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-semibold text-slate-700">Descripción Técnica</label>
          <textarea
            value={formData.descripcion}
            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            className="w-full h-24 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
            placeholder="Especificaciones, marca, modelo..."
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Save className="w-5 h-5" />
              Guardar Equipo
            </>
          )}
        </button>
      </form>
    </div>
  );
};

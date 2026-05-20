"use client";

import React, { useState } from 'react';
import { Mail, ShieldCheck, Key, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Cookies from 'js-cookie';
import { HttpAuthRepository } from '../../infrastructure/HttpAuthRepository';

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [codigoUnico, setCodigoUnico] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const repository = new HttpAuthRepository();

    try {
      const response = await repository.login({
        email,
        codigo_unico: codigoUnico,
        password,
      });

      // Save to Cookies
      Cookies.set('token', response.token, { expires: 1 }); // 1 day
      Cookies.set('role', response.role, { expires: 1 });
      Cookies.set('user_id', response.user_id.toString(), { expires: 1 });

      // Redirect map based on backend RoleName values
      const redirectMap: Record<string, string> = {
        'Administrador': '/dashboard/admin',
        'Secretario': '/dashboard/secretary',
        'Jefe de Unidad': '/dashboard/jefe',
        'Ingeniero Electrónico': '/dashboard/engineer',
        'Doctor': '/dashboard/doctor',
      };

      const targetPath = redirectMap[response.role] || '/dashboard';
      window.location.href = targetPath;
      
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-md p-8 bg-white border border-slate-200 rounded-2xl shadow-xl"
    >
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-slate-800">Hospital System</h1>
        <p className="text-slate-500">Ingresa tus credenciales para continuar</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg">
            {error}
          </div>
        )}

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Correo Institucional</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="correo@hospital.com"
              required
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Código Único (ID)</label>
          <div className="relative">
            <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={codigoUnico}
              onChange={(e) => setCodigoUnico(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="ADM001"
              required
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Contraseña</label>
          <div className="relative">
            <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Iniciar Sesión
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
};

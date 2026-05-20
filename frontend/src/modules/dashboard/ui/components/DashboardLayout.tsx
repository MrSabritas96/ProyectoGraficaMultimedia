"use client";

import React, { useEffect, useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { motion, AnimatePresence } from 'framer-motion';
import Cookies from 'js-cookie';

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get('token');
    const userRole = Cookies.get('role');

    if (!token || !userRole) {
      window.location.href = '/login';
    } else {
      setRole(userRole);
      setLoading(false);
    }
  }, []);

  if (loading || !role) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex bg-slate-50 overflow-hidden">
      <Sidebar role={role} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

"use client";

import { useEffect } from 'react';
import Cookies from 'js-cookie';

export default function DashboardPage() {
  useEffect(() => {
    const role = Cookies.get('role');
    const redirectMap: Record<string, string> = {
      'Administrador': '/dashboard/admin',
      'Secretario': '/dashboard/secretary',
      'Jefe de Unidad': '/dashboard/jefe',
      'Ingeniero Electrónico': '/dashboard/engineer',
      'Doctor': '/dashboard/doctor',
    };

    if (role && redirectMap[role]) {
      window.location.href = redirectMap[role];
    }
  }, []);

  return null;
}

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ROLE_REDIRECTS: Record<string, string> = {
  'Administrador': '/dashboard/admin',
  'Secretario': '/dashboard/secretary',
  'Jefe de Unidad': '/dashboard/jefe',
  'Ingeniero Electronico': '/dashboard/engineer',
  'Doctor': '/dashboard/doctor',
};

const PROTECTED_PATHS: Record<string, string> = {
  '/dashboard/admin': 'Administrador',
  '/dashboard/secretary': 'Secretario',
  '/dashboard/jefe': 'Jefe de Unidad',
  '/dashboard/engineer': 'Ingeniero Electronico',
  '/dashboard/doctor': 'Doctor',
};

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const role = request.cookies.get('role')?.value;
  const { pathname } = request.nextUrl;

  // 1. Redirigir al login si intenta acceder al dashboard sin token
  if (pathname.startsWith('/dashboard') && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. Redirigir al dashboard correspondiente si ya está logueado y va a /login
  if (pathname === '/login' && token && role) {
    const target = ROLE_REDIRECTS[role] || '/dashboard';
    return NextResponse.redirect(new URL(target, request.url));
  }

  // 3. Protección de rutas por rol
  for (const [path, allowedRole] of Object.entries(PROTECTED_PATHS)) {
    if (pathname.startsWith(path)) {
      if (role !== allowedRole) {
        // Redirigir a su dashboard correcto si intenta entrar en ruta ajena
        const target = ROLE_REDIRECTS[role as string] || '/dashboard';
        return NextResponse.redirect(new URL(target, request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
};

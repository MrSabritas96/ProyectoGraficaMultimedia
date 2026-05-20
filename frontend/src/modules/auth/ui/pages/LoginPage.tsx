import React from 'react';
import { LoginForm } from '../components/LoginForm';

export const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-50 via-indigo-50 to-slate-100 p-4">
      <div className="absolute inset-0 bg-grid-slate-200 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />
      <LoginForm />
    </div>
  );
};

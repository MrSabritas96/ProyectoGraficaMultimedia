"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import { Button } from "./Button";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex flex-col items-center justify-center p-8 bg-white border border-slate-200 rounded-[2.5rem] text-center space-y-6">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center">
            <AlertTriangle className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-800">Algo salió mal</h2>
            <p className="text-slate-500 max-w-md">
              Se ha producido un error inesperado en esta sección. Nuestro equipo técnico ha sido notificado automáticamente.
            </p>
          </div>
          <Button 
            variant="outline" 
            leftIcon={<RefreshCcw className="w-4 h-4" />}
            onClick={() => window.location.reload()}
          >
            Recargar aplicación
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

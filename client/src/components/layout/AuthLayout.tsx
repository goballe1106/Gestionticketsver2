import { ReactNode } from "react";
import { Headset } from "lucide-react";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen">
      {/* Left side: Form */}
      <div className="flex flex-col justify-center w-full px-4 py-12 sm:px-6 lg:flex-none lg:w-[600px] xl:px-12">
        <div className="w-full max-w-sm mx-auto lg:w-[400px]">
          <div className="mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-md bg-primary flex items-center justify-center text-white">
                <Headset size={24} />
              </div>
              <div>
                <h1 className="font-semibold text-lg text-neutral-700">SoporteTech</h1>
                <p className="text-xs text-neutral-500">Sistema de tickets de soporte</p>
              </div>
            </div>
          </div>
          {children}
        </div>
      </div>
      
      {/* Right side: Hero */}
      <div className="relative hidden flex-1 lg:block">
        <div className="absolute inset-0 bg-primary-light">
          <div className="flex flex-col items-center justify-center h-full p-12 text-white">
            <div className="max-w-xl text-center">
              <h2 className="mb-6 text-3xl font-bold">Gestión de Soporte Técnico Simplificada</h2>
              <p className="mb-8 text-lg">
                Nuestra plataforma facilita la comunicación entre usuarios y agentes
                a través de un sistema integrado con Microsoft Teams.
              </p>
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="p-4 bg-white/10 rounded-lg">
                  <div className="mb-2 text-xl font-semibold">Comunicación en tiempo real</div>
                  <p>Chat directo con agentes de soporte a través de Microsoft Teams</p>
                </div>
                <div className="p-4 bg-white/10 rounded-lg">
                  <div className="mb-2 text-xl font-semibold">Seguimiento simplificado</div>
                  <p>Visualiza el estado de tus tickets y recibe notificaciones de actualizaciones</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

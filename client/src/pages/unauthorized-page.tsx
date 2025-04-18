import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";

export default function UnauthorizedPage() {
  const { user, logoutMutation } = useAuth();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900">Acceso No Autorizado</h1>
          </div>

          <p className="mt-4 text-sm text-gray-600">
            No tienes permiso para acceder a esta página. Esta sección requiere privilegios adicionales.
          </p>

          <div className="mt-6 flex flex-col space-y-2">
            <Link href="/">
              <a className="w-full">
                <Button className="w-full bg-[#0078d4] hover:bg-[#0086f0]">Volver al inicio</Button>
              </a>
            </Link>
            
            {user && (
              <Button variant="outline" className="w-full" onClick={handleLogout}>
                Cerrar sesión
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

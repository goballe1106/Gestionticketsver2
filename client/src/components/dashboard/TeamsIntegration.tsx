import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTeams } from "@/hooks/use-teams";
import { useAuth } from "@/hooks/use-auth";
import { Check } from "lucide-react";
import { Github } from "lucide-react";

export default function TeamsIntegration() {
  const { user } = useAuth();
  const { isConnected, isConnecting, connectUserToTeams } = useTeams();

  const handleConnectToTeams = async () => {
    try {
      await connectUserToTeams();
    } catch (error) {
      console.error("Error connecting to Teams:", error);
    }
  };

  return (
    <Card className="h-full overflow-hidden">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Integración con Microsoft Teams</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 rounded-lg bg-[#4b53bc] flex items-center justify-center text-white mr-4">
            <Github className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-medium">Microsoft Teams</h3>
            <p className="text-sm text-neutral-500">
              {user?.msTeamsId || isConnected ? "Conectado" : "No conectado"}
            </p>
          </div>
          <div className="ml-auto">
            <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
              user?.msTeamsId || isConnected 
                ? "bg-green-100 text-green-800" 
                : "bg-amber-100 text-amber-800"
            }`}>
              {user?.msTeamsId || isConnected ? (
                <>
                  <Check className="h-3 w-3 mr-1" /> Activo
                </>
              ) : (
                "Inactivo"
              )}
            </span>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span>Chat en tiempo real</span>
            <span className={user?.msTeamsId || isConnected ? "text-green-600" : "text-neutral-400"}>
              {user?.msTeamsId || isConnected ? <Check className="h-4 w-4" /> : "-"}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Notificaciones</span>
            <span className={user?.msTeamsId || isConnected ? "text-green-600" : "text-neutral-400"}>
              {user?.msTeamsId || isConnected ? <Check className="h-4 w-4" /> : "-"}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Compartir archivos</span>
            <span className={user?.msTeamsId || isConnected ? "text-green-600" : "text-neutral-400"}>
              {user?.msTeamsId || isConnected ? <Check className="h-4 w-4" /> : "-"}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t border-neutral-100 p-4">
        <Button 
          className="w-full"
          disabled={isConnecting || (user?.msTeamsId || isConnected)}
          onClick={handleConnectToTeams}
        >
          {isConnecting 
            ? "Conectando..." 
            : (user?.msTeamsId || isConnected) 
              ? "Configurar integración" 
              : "Conectar con Microsoft Teams"
          }
        </Button>
      </CardFooter>
    </Card>
  );
}

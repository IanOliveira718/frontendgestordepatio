import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { usePermissions } from "@/context/usePermissions";

interface ProtectedRouteProps {
  children:   React.ReactNode;
  /** Chave de permissão do usePermissions. Se omitida, apenas exige autenticação. */
  permission?: keyof ReturnType<typeof usePermissions>;
}

export function ProtectedRoute({ children, permission }: ProtectedRouteProps) {
  const { isAuth, loading } = useAuth();
  const permissions         = usePermissions();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (!isAuth) return <Navigate to="/login" replace />;

  // Se uma permissão específica for exigida, verifica
  if (permission && !permissions[permission]) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

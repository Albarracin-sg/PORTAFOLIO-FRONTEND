import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAdminAuth } from './AdminAuthProvider';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { token, role } = useAdminAuth();
  const location = useLocation();

  if (!token) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6 animate-in fade-in zoom-in duration-500">
          <div className="mx-auto w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center">
            <ShieldAlert className="w-10 h-10 text-red-500" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Acceso Denegado
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              No tenés permisos para acceder a esta sección. Solo los administradores pueden entrar acá, brother.
            </p>
          </div>
          <div className="pt-4">
            <Button asChild variant="outline" className="rounded-2xl px-8">
              <Link to="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al inicio
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

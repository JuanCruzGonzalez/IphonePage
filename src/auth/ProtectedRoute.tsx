import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                fontSize: '1.2rem'
            }}>
                Cargando...
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Bloquear clientes de la tienda: no tienen acceso al panel de administración
    const role = (user.app_metadata as Record<string, string>)?.role;
    if (role === 'cliente') {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
}

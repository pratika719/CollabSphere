import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuthStore from '../store/auth.store.js';

const ProtectedRoute = () => {
    const location = useLocation();

    const { isAuthenticated, isAuthLoading } = useAuthStore();

    if (isAuthLoading) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
                <div className="w-10 h-10 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest animate-pulse">
                    Authenticating...
                </p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    return <Outlet />
}

export default ProtectedRoute;
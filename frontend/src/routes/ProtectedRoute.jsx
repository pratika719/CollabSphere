import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuthStore from '../store/auth.store.js';

const ProtectedRoute = () => {
    const location = useLocation();

    const { isAuthenticated, isAuthLoading } = useAuthStore();

    if (isAuthLoading) {
        return <div>Loading...</div>
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    return <Outlet />
}

export default ProtectedRoute;
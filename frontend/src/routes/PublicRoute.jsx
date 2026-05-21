import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from "../store/auth.store.js";

export default function PublicRoute() {
    const { isAuthenticated, isAuthLoading } = useAuthStore();

    if (isAuthLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white">
                <div className="relative flex items-center justify-center">
                    <div className="w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
                    <div className="absolute w-16 h-16 border-4 border-transparent border-t-purple-400 rounded-full animate-pulse blur-[2px]"></div>
                </div>
            </div>
        );
    }

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
}

import { Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute.jsx";
import PublicRoute from "./PublicRoute.jsx";
import AuthLayout from "../components/layout/AuthLayout.jsx";
import AppLayout from "../components/layout/AppLayout.jsx";
import LoginPage from "../features/auth/pages/LoginPage.jsx";
import RegisterPage from "../features/auth/pages/RegisterPage.jsx";
import DashboardPage from "../pages/DashboardPage.jsx";

export const routesConfig = [
    // Redirect root path to dashboard (which will be protected)
    {
        path: "/",
        element: <Navigate to="/dashboard" replace />,
    },
    // Public-only authentication routes
    {
        element: <PublicRoute />,
        children: [
            {
                element: <AuthLayout />,
                children: [
                    {
                        path: "login",
                        element: <LoginPage />,
                    },
                    {
                        path: "register",
                        element: <RegisterPage />,
                    },
                ],
            },
        ],
    },
    // Private protected routes
    {
        element: <ProtectedRoute />,
        children: [
            {
                element: <AppLayout />,
                children: [
                    {
                        path: "dashboard",
                        element: <DashboardPage />,
                    },
                ],
            },
        ],
    },
    // Catch-all route redirecting back to home
    {
        path: "*",
        element: <Navigate to="/" replace />,
    },
];

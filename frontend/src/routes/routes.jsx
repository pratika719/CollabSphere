import { lazy, Suspense } from "react";
import { Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute.jsx";
import PublicRoute from "./PublicRoute.jsx";
import AuthLayout from "../components/layout/AuthLayout.jsx";
import AppLayout from "../components/layout/AppLayout.jsx";
import GlobalError from "../components/layout/GlobalError.jsx";

const LoginPage = lazy(() => import("../features/auth/pages/LoginPage.jsx"));
const RegisterPage = lazy(() => import("../features/auth/pages/RegisterPage.jsx"));
const DashboardPage = lazy(() => import("../pages/DashboardPage.jsx"));
const WorkspacePage = lazy(() => import("../pages/WorkspacePage.jsx"));
const BoardPage = lazy(() => import("../pages/BoardPage.jsx"));
const TasksPage = lazy(() => import("../pages/TasksPage.jsx"));
const MembersPage = lazy(() => import("../pages/MembersPage.jsx"));

const PageLoader = () => (
    <div className="flex h-full w-full items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
    </div>
);

const withSuspense = (Component) => (
    <Suspense fallback={<PageLoader />}>
        <Component />
    </Suspense>
);

/*
|--------------------------------------------------------------------------
| ROUTE CONFIGURATION
|--------------------------------------------------------------------------
|
| Route tree:
|
| /                             → redirect to /dashboard
| /login                        → LoginPage   (public only)
| /register                     → RegisterPage (public only)
| /dashboard                    → DashboardPage
| /workspaces/:id               → WorkspacePage (board grid)
| /workspaces/:id/boards/:bid   → BoardPage (Kanban)
| /workspaces/:id/tasks         → TasksPage (filtered + paginated)
| /workspaces/:id/members       → MembersPage (member management)
| *                             → redirect to /
|
*/

export const routesConfig = [
    {
        errorElement: <GlobalError />,
        children: [
            // Root redirect
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
                                element: withSuspense(LoginPage),
                            },
                            {
                                path: "register",
                                element: withSuspense(RegisterPage),
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
                                element: withSuspense(DashboardPage),
                            },
                            {
                                path: "workspaces/:workspaceId",
                                element: withSuspense(WorkspacePage),
                            },
                            {
                                path: "workspaces/:workspaceId/boards/:boardId",
                                element: withSuspense(BoardPage),
                            },
                            {
                                path: "workspaces/:workspaceId/tasks",
                                element: withSuspense(TasksPage),
                            },
                            {
                                path: "workspaces/:workspaceId/members",
                                element: withSuspense(MembersPage),
                            },
                        ],
                    },
                ],
            },

            // Catch-all
            {
                path: "*",
                element: <Navigate to="/" replace />,
            },
        ],
    },
];

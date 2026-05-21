import { Outlet, Link, useLocation } from "react-router-dom";
import useAuthStore from "../../store/auth.store.js";
import useLogout from "../../hooks/useLogout.js";

export default function AppLayout() {
    const { user } = useAuthStore();
    const { logout, isPending } = useLogout();
    const location = useLocation();

    // Utility for matching active nav item
    const isActive = (path) => location.pathname === path;

    const navItems = [
        {
            name: "Dashboard",
            path: "/dashboard",
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
                </svg>
            )
        },
        {
            name: "Workspaces",
            path: "/workspaces",
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
            )
        },
        {
            name: "Boards",
            path: "/boards",
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
            )
        },
        {
            name: "Tasks",
            path: "/tasks",
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        }
    ];

    return (
        <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden w-full">
            {/* Sidebar Left Navigation */}
            <aside className="w-72 border-r border-slate-900 bg-slate-900/40 backdrop-blur-lg flex flex-col justify-between p-6 shrink-0">
                <div className="space-y-8">
                    {/* Header Logo */}
                    <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
                            <span className="font-extrabold text-white text-base">C</span>
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white">
                            CollabSphere
                        </span>
                    </div>

                    {/* Navigation Menu */}
                    <nav className="space-y-1">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 mb-2 block text-left">
                            Workspace
                        </p>
                        {navItems.map((item) => {
                            const active = isActive(item.path);
                            return (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                                        active
                                            ? "bg-purple-600/10 text-purple-400 border border-purple-500/20"
                                            : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.02] border border-transparent"
                                    }`}
                                >
                                    <span className={active ? "text-purple-400" : "text-slate-500 group-hover:text-slate-300"}>
                                        {item.icon}
                                    </span>
                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Profile Card & Logout Footer */}
                <div className="space-y-4 pt-6 border-t border-slate-900">
                    <div className="flex items-center space-x-3 px-2">
                        {/* Profile Avatar */}
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center font-bold text-white text-sm shadow-md uppercase">
                            {user?.name ? user.name.slice(0, 2) : "US"}
                        </div>
                        <div className="min-w-0 flex-1 text-left">
                            <p className="text-sm font-bold text-white truncate uppercase">
                                {user?.name || "User Name"}
                            </p>
                            <p className="text-xs text-slate-500 truncate">
                                {user?.email || "user@collabsphere.com"}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={logout}
                        disabled={isPending}
                        className="w-full flex items-center justify-center space-x-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-red-400 hover:border-red-500/20 py-2.5 px-4 rounded-xl text-sm font-semibold transition duration-150 disabled:opacity-50"
                    >
                        {isPending ? (
                            <span>Signing out...</span>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                <span>Sign Out</span>
                            </>
                        )}
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto p-10 relative">
                <div className="max-w-6xl mx-auto space-y-6">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
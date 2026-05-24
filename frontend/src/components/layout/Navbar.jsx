import { useLocation, Link, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import useAuthStore from "../../store/auth.store.js";
import useWorkspaceStore from "../../store/workspace.store.js";
import { useWorkspaces } from "../../hooks/useWorkspaces.js";
import  useLogout  from "../../hooks/useLogout.js";

/*
|--------------------------------------------------------------------------
| NAVBAR — Top horizontal bar
|--------------------------------------------------------------------------
|
| Renders breadcrumbs, search trigger, notifications, and user avatar.
| Breadcrumbs are auto-generated from the current route path.
|
*/

export default function Navbar() {
    const { user } = useAuthStore();
    const location = useLocation();
    const navigate = useNavigate();
    const { currentWorkspaceId } = useWorkspaceStore();
    const { data: workspacesResponse } = useWorkspaces();
    const { mutate: logout } = useLogout();
    
    const [showUserMenu, setShowUserMenu] = useState(false);
    const menuRef = useRef(null);

    const workspaces = workspacesResponse?.data || [];
    const currentWorkspace = workspaces.find((ws) => ws._id === currentWorkspaceId);

    // Close menu on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setShowUserMenu(false);
            }
        };
        if (showUserMenu) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [showUserMenu]);

    // Build breadcrumbs from current route
    const buildBreadcrumbs = () => {
        const path = location.pathname;
        const crumbs = [];

        if (path === "/dashboard") {
            crumbs.push({ label: "Dashboard", path: "/dashboard" });
        } else if (path === "/profile") {
            crumbs.push({ label: "Dashboard", path: "/dashboard" });
            crumbs.push({ label: "Profile", path: "/profile" });
        } else if (path.startsWith("/workspaces")) {
            crumbs.push({ label: "Dashboard", path: "/dashboard" });
            if (currentWorkspace) {
                crumbs.push({
                    label: currentWorkspace.name,
                    path: `/workspaces/${currentWorkspace._id}`,
                });
            }
            if (path.includes("/boards/")) {
                crumbs.push({ label: "Board", path: path });
            } else if (path.endsWith("/tasks")) {
                crumbs.push({ label: "Tasks", path: path });
            } else if (path.endsWith("/members")) {
                crumbs.push({ label: "Members", path: path });
            }
        }

        return crumbs;
    };

    const breadcrumbs = buildBreadcrumbs();

    const handleLogout = () => {
        logout(null, {
            onSuccess: () => navigate("/login")
        });
    };

    return (
        <header className="h-[60px] border-b border-slate-800/40 bg-slate-950/60 backdrop-blur-xl flex items-center justify-between px-6 shrink-0 relative z-10">
            {/* Left: Breadcrumbs */}
            <div className="flex items-center gap-4">
                <nav className="flex items-center gap-1.5 text-[12px]">
                    {breadcrumbs.map((crumb, index) => (
                        <span key={crumb.path} className="flex items-center gap-1.5">
                            {index > 0 && (
                                <svg className="w-3 h-3 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            )}
                            {index === breadcrumbs.length - 1 ? (
                                <span className="font-semibold text-slate-300">{crumb.label}</span>
                            ) : (
                                <Link
                                    to={crumb.path}
                                    className="font-medium text-slate-500 hover:text-slate-300 transition-colors"
                                >
                                    {crumb.label}
                                </Link>
                            )}
                        </span>
                    ))}
                </nav>
            </div>

            {/* Right: Search + Actions + Avatar */}
            <div className="flex items-center gap-3">
                {/* Search placeholder */}
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-slate-800/60 text-slate-500 text-[12px] font-medium hover:bg-white/[0.05] hover:border-slate-700/60 transition-all duration-200 min-w-[180px]">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span>Search...</span>
                    <span className="ml-auto text-[10px] text-slate-600 font-mono border border-slate-800 rounded px-1 py-0.5">⌘K</span>
                </button>

                {/* Notification bell */}
                <button className="relative p-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/[0.04] transition-all duration-200">
                    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-purple-500 rounded-full border-2 border-slate-950" />
                </button>

                {/* User avatar & dropdown */}
                <div className="relative" ref={menuRef}>
                    <div 
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-[11px] font-bold text-white uppercase shadow-sm cursor-pointer hover:shadow-purple-500/20 hover:shadow-md transition-shadow duration-200"
                    >
                        {user?.name ? user.name.slice(0, 2) : "US"}
                    </div>

                    {showUserMenu && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-1 z-50 overflow-hidden">
                            <div className="px-4 py-2 border-b border-slate-800 mb-1">
                                <p className="text-[12px] font-bold text-white truncate">{user?.name}</p>
                                <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
                            </div>
                            <Link
                                to="/profile"
                                onClick={() => setShowUserMenu(false)}
                                className="flex items-center gap-2 px-4 py-2 text-[12px] font-semibold text-slate-300 hover:text-white hover:bg-white/[0.04] transition-colors"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                My Profile
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-2 px-4 py-2 text-[12px] font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/[0.04] transition-colors text-left"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

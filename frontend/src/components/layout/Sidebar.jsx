import { Link, useLocation } from "react-router-dom";
import useAuthStore from "../../store/auth.store.js";
import useLogout from "../../hooks/useLogout.js";
import useWorkspaceStore from "../../store/workspace.store.js";
import WorkspaceSwitcher from "./WorkspaceSwitcher.jsx";

/*
|--------------------------------------------------------------------------
| SIDEBAR COMPONENT
|--------------------------------------------------------------------------
|
| Navigation items dynamically link to the currently-selected workspace.
| When no workspace is selected, workspace-scoped links are disabled
| and visually muted to guide the user to select one first.
|
*/

export default function Sidebar() {
    const { user } = useAuthStore();
    const { logout, isPending } = useLogout();
    const location = useLocation();
    const { currentWorkspaceId } = useWorkspaceStore();

    const isActive = (path) =>
        location.pathname === path || location.pathname.startsWith(path + "/");

    /*
    |----------------------------------------------------------------------
    | Navigation items
    |----------------------------------------------------------------------
    | Dashboard is always available.
    | Boards, Tasks, Members require a selected workspace.
    |
    */
    const navItems = [
        {
            name: "Dashboard",
            path: "/dashboard",
            requiresWorkspace: false,
            icon: (
                <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
                </svg>
            ),
        },
        {
            name: "Boards",
            path: currentWorkspaceId
                ? `/workspaces/${currentWorkspaceId}`
                : null,
            requiresWorkspace: true,
            icon: (
                <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
            ),
        },
        {
            name: "Tasks",
            path: currentWorkspaceId
                ? `/workspaces/${currentWorkspaceId}/tasks`
                : null,
            requiresWorkspace: true,
            icon: (
                <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
        },
        {
            name: "Members",
            path: currentWorkspaceId
                ? `/workspaces/${currentWorkspaceId}/members`
                : null,
            requiresWorkspace: true,
            icon: (
                <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            ),
        },
    ];

    const handleNavClick = (item, e) => {
        if (item.requiresWorkspace && !currentWorkspaceId) {
            e.preventDefault();
            // Could show a toast here; for now we just no-op
        }
    };

    return (
        <aside className="w-[272px] border-r border-slate-800/60 bg-slate-950/80 backdrop-blur-2xl flex flex-col justify-between shrink-0 relative overflow-hidden">
            {/* Decorative gradient orb */}
            <div className="absolute -top-20 -left-20 w-40 h-40 bg-purple-500/[0.04] rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col h-full">
                {/* Header Logo */}
                <div className="flex items-center gap-3 px-5 pt-6 pb-4">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                        <span className="font-extrabold text-white text-sm tracking-tight">C</span>
                    </div>
                    <span className="text-[17px] font-bold tracking-tight text-white">
                        CollabSphere
                    </span>
                </div>

                {/* Workspace Switcher */}
                <div className="px-3 mb-1">
                    <WorkspaceSwitcher />
                </div>

                {/* Navigation Menu */}
                <nav className="flex-1 px-3 pt-4 space-y-0.5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500 px-3 mb-2">
                        Navigation
                    </p>
                    {navItems.map((item) => {
                        const disabled = item.requiresWorkspace && !currentWorkspaceId;
                        const active = item.path ? isActive(item.path) : false;

                        if (disabled) {
                            return (
                                <div
                                    key={item.name}
                                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-semibold text-slate-600 cursor-not-allowed opacity-50"
                                    title="Select a workspace first"
                                >
                                    <span className="text-slate-700">
                                        {item.icon}
                                    </span>
                                    <span>{item.name}</span>
                                </div>
                            );
                        }

                        return (
                            <Link
                                key={item.name}
                                to={item.path}
                                onClick={(e) => handleNavClick(item, e)}
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-semibold transition-all duration-200 group relative ${active
                                        ? "bg-purple-500/[0.08] text-purple-300"
                                        : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]"
                                    }`}
                            >
                                {/* Active indicator bar */}
                                {active && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-purple-500 rounded-r-full" />
                                )}
                                <span className={active ? "text-purple-400" : "text-slate-500 group-hover:text-slate-400"}>
                                    {item.icon}
                                </span>
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Profile Card & Logout Footer */}
            <div className="p-3 border-t border-slate-800/60">
                <div className="flex items-center gap-3 px-3 py-2 mb-2">
                    {/* Profile Avatar */}
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center font-bold text-white text-xs shadow-md uppercase shrink-0">
                        {user?.name ? user.name.slice(0, 2) : "US"}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-bold text-white truncate capitalize">
                            {user?.name || "User"}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">
                            {user?.email || "user@email.com"}
                        </p>
                    </div>
                </div>

                <button
                    onClick={logout}
                    disabled={isPending}
                    className="w-full flex items-center justify-center gap-2 bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/60 text-slate-400 hover:text-red-400 hover:border-red-500/20 py-2 px-4 rounded-lg text-[13px] font-semibold transition-all duration-200 disabled:opacity-50"
                >
                    {isPending ? (
                        <span>Signing out...</span>
                    ) : (
                        <>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span>Sign Out</span>
                        </>
                    )}
                </button>
            </div>
        </aside>
    );
}

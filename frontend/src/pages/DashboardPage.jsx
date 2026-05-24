import { useState } from "react";
import useAuthStore from "../store/auth.store.js";
import { useWorkspaces } from "../hooks/useWorkspaces.js";
import WorkspaceCard from "../components/workspace/WorkspaceCard.jsx";
import CreateWorkspaceModal from "../components/modals/CreateWorkspaceModal.jsx";

export default function DashboardPage() {
    const { user } = useAuthStore();
    const { data: workspacesResponse, isLoading } = useWorkspaces();
    const [showCreateModal, setShowCreateModal] = useState(false);

    const workspaces = workspacesResponse?.data || [];

    // Get current time greeting
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 17) return "Good afternoon";
        return "Good evening";
    };

    return (
        <div className="space-y-8 text-left">
            {/* Header Greeting */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-white mb-1">
                        {getGreeting()},{" "}
                        <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent capitalize">
                            {user?.name || "User"}
                        </span>
                    </h1>
                    <p className="text-slate-400 text-sm">
                        Here's what's happening across your workspaces today.
                    </p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-[13px] font-semibold shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 transition-all duration-200 shrink-0"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Workspace
                </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-white/[0.02] border border-slate-800/60 p-5 rounded-2xl relative overflow-hidden group hover:border-purple-500/20 transition-all duration-300">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-colors" />
                    <div className="relative">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                                <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Workspaces</p>
                        </div>
                        <p className="text-3xl font-extrabold text-white">{isLoading ? "—" : workspaces.length}</p>
                        <p className="text-[11px] text-purple-400 mt-1 font-medium">Active Projects</p>
                    </div>
                </div>

                <div className="bg-white/[0.02] border border-slate-800/60 p-5 rounded-2xl relative overflow-hidden group hover:border-indigo-500/20 transition-all duration-300">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors" />
                    <div className="relative">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                                <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Team Members</p>
                        </div>
                        <p className="text-3xl font-extrabold text-white">
                            {isLoading ? "—" : workspaces.reduce((sum, ws) => sum + (ws.members?.length || 0), 0)}
                        </p>
                        <p className="text-[11px] text-indigo-400 mt-1 font-medium">Across all workspaces</p>
                    </div>
                </div>

                <div className="bg-white/[0.02] border border-slate-800/60 p-5 rounded-2xl relative overflow-hidden group hover:border-blue-500/20 transition-all duration-300">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors" />
                    <div className="relative">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                                </svg>
                            </div>
                            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Boards</p>
                        </div>
                        <p className="text-3xl font-extrabold text-white">
                            {isLoading ? "—" : workspaces.reduce((sum, ws) => sum + (ws.boardCount || 0), 0)}
                        </p>
                        <p className="text-[11px] text-blue-400 mt-1 font-medium">Active boards</p>
                    </div>
                </div>

                <div className="bg-white/[0.02] border border-slate-800/60 p-5 rounded-2xl relative overflow-hidden group hover:border-emerald-500/20 transition-all duration-300">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors" />
                    <div className="relative">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Status</p>
                        </div>
                        <p className="text-3xl font-extrabold text-white flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                            Live
                        </p>
                        <p className="text-[11px] text-emerald-400 mt-1 font-medium">System Connected</p>
                    </div>
                </div>
            </div>

            {/* Workspaces Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white">Your Workspaces</h3>
                    {workspaces.length > 0 && (
                        <span className="text-[11px] font-medium text-slate-500">
                            {workspaces.length} workspace{workspaces.length !== 1 ? "s" : ""}
                        </span>
                    )}
                </div>

                {isLoading ? (
                    /* Skeleton loader */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="p-5 rounded-2xl bg-white/[0.02] border border-slate-800/60 space-y-3 animate-pulse">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-slate-800" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-slate-800 rounded w-3/4" />
                                        <div className="h-3 bg-slate-800/60 rounded w-1/2" />
                                    </div>
                                </div>
                                <div className="h-px bg-slate-800/40" />
                                <div className="flex justify-between">
                                    <div className="h-3 bg-slate-800/60 rounded w-1/3" />
                                    <div className="h-3 bg-slate-800/60 rounded w-1/4" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : workspaces.length === 0 ? (
                    /* Empty state */
                    <div className="flex flex-col items-center justify-center py-16 px-4 rounded-2xl bg-white/[0.01] border border-dashed border-slate-800/60">
                        <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4">
                            <svg className="w-7 h-7 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                        <h4 className="text-[15px] font-bold text-white mb-1">No workspaces yet</h4>
                        <p className="text-[12px] text-slate-500 mb-4 text-center max-w-xs">
                            Create your first workspace to start organizing boards and tasks.
                        </p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[13px] font-semibold shadow-lg shadow-purple-500/20 transition-all duration-200"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Create Workspace
                        </button>
                    </div>
                ) : (
                    /* Workspace grid */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {workspaces.map((workspace) => (
                            <WorkspaceCard key={workspace._id} workspace={workspace} />
                        ))}
                    </div>
                )}
            </div>

            {/* Recent Activity placeholder */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-white">Recent Activity</h3>
                <div className="p-6 rounded-2xl bg-white/[0.01] border border-slate-800/40">
                    <div className="flex flex-col items-center justify-center py-8">
                        <div className="w-12 h-12 rounded-2xl bg-slate-800/40 flex items-center justify-center mb-3">
                            <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <p className="text-[13px] text-slate-500 font-medium">Activity feed coming soon</p>
                        <p className="text-[11px] text-slate-600 mt-1">Your recent actions will appear here.</p>
                    </div>
                </div>
            </div>

            {/* Create Workspace Modal */}
            <CreateWorkspaceModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
            />
        </div>
    );
}

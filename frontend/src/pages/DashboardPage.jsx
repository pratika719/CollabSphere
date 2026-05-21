import { useState } from "react";
import useAuthStore from "../store/auth.store.js";
import { refreshAccessToken, getCurrentUser } from "../services/auth.api.js";

export default function DashboardPage() {
    const { user } = useAuthStore();
    const [refreshing, setRefreshing] = useState(false);
    const [refreshLogs, setRefreshLogs] = useState([]);
    const [apiTesting, setApiTesting] = useState(false);

    const logMessage = (msg) => {
        setRefreshLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
    };

    const handleManualRefresh = async () => {
        setRefreshing(true);
        logMessage("Initiating manual token refresh request...");
        try {
            const data = await refreshAccessToken();
            logMessage(`Success! Access token refreshed. Message: ${data.message}`);
        } catch (error) {
            logMessage(`Failed: ${error.response?.data?.message || error.message}`);
        } finally {
            setRefreshing(false);
        }
    };

    const handleTestAuthEndpoint = async () => {
        setApiTesting(true);
        logMessage("Testing authenticated GET /auth/me route...");
        try {
            const data = await getCurrentUser();
            logMessage(`Success! Fetched user details: ID = ${data.data?._id}, Email = ${data.data?.email}`);
        } catch (error) {
            logMessage(`Failed: ${error.response?.data?.message || error.message}`);
        } finally {
            setApiTesting(false);
        }
    };

    return (
        <div className="space-y-8 text-left">
            {/* Header Greeting */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900 pb-6">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-white mb-1">
                        Welcome back, <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent capitalize">{user?.name || "User"}</span>!
                    </h1>
                    <p className="text-slate-400 text-sm">
                        Here is what's happening across your workspaces today.
                    </p>
                </div>
                <div className="flex items-center space-x-3 text-sm text-slate-500 font-mono">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                    <span>System Connected</span>
                </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900/40 border border-slate-900 p-6 rounded-2xl relative overflow-hidden group hover:border-purple-500/20 transition-all duration-300">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-colors"></div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Total Workspaces</p>
                    <p className="text-3xl font-extrabold text-white">4</p>
                    <p className="text-xs text-purple-400 mt-2 flex items-center space-x-1">
                        <span>Active Projects</span>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </p>
                </div>
                <div className="bg-slate-900/40 border border-slate-900 p-6 rounded-2xl relative overflow-hidden group hover:border-indigo-500/20 transition-all duration-300">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors"></div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Board Views</p>
                    <p className="text-3xl font-extrabold text-white">12</p>
                    <p className="text-xs text-indigo-400 mt-2 flex items-center space-x-1">
                        <span>Updated 5m ago</span>
                    </p>
                </div>
                <div className="bg-slate-900/40 border border-slate-900 p-6 rounded-2xl relative overflow-hidden group hover:border-pink-500/20 transition-all duration-300">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/5 rounded-full blur-2xl group-hover:bg-pink-500/10 transition-colors"></div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Pending Assignments</p>
                    <p className="text-3xl font-extrabold text-white">3</p>
                    <p className="text-xs text-pink-400 mt-2 flex items-center space-x-1">
                        <span>2 due today</span>
                    </p>
                </div>
            </div>

            {/* Layout Split: Core Workspace info + Session Monitor */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Left Side: Mock Projects */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-white">Recent Boards</h3>
                        <a href="#" className="text-xs text-purple-400 hover:text-purple-300 font-semibold transition">View All</a>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-5 rounded-2xl bg-white/[0.02] border border-slate-900 hover:border-slate-800 transition duration-150 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">Design System</span>
                                <span className="text-[10px] font-medium text-slate-500">Updated today</span>
                            </div>
                            <h4 className="font-bold text-white text-base">Figma Integration</h4>
                            <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-purple-500 h-full w-3/4 rounded-full"></div>
                            </div>
                        </div>
                        <div className="p-5 rounded-2xl bg-white/[0.02] border border-slate-900 hover:border-slate-800 transition duration-150 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">Development</span>
                                <span className="text-[10px] font-medium text-slate-500">Yesterday</span>
                            </div>
                            <h4 className="font-bold text-white text-base">JWT Middleware Fixes</h4>
                            <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-indigo-500 h-full w-1/2 rounded-full"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Auth details panel */}
                <div className="lg:col-span-2 space-y-6">
                    <h3 className="text-lg font-bold text-white">Security & Session Inspector</h3>
                    
                    <div className="p-6 rounded-2xl bg-slate-900/20 border border-slate-900 space-y-6">
                        {/* Token Details */}
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between items-center py-1.5 border-b border-slate-900">
                                <span className="text-slate-400 font-semibold">User Role</span>
                                <span className="font-mono text-purple-400 text-xs px-2 py-0.5 rounded bg-purple-500/10 uppercase font-bold">{user?.role || "member"}</span>
                            </div>
                            <div className="flex justify-between items-center py-1.5 border-b border-slate-900">
                                <span className="text-slate-400 font-semibold">Session Status</span>
                                <span className="font-mono text-emerald-400 text-xs flex items-center space-x-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                    <span>Active</span>
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-1.5 border-b border-slate-900">
                                <span className="text-slate-400 font-semibold">Refresh Mechanism</span>
                                <span className="text-slate-300 font-semibold">Silent Cookie JWT</span>
                            </div>
                        </div>

                        {/* Interactive Verification Console */}
                        <div className="space-y-3">
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Diagnostic Tests</p>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={handleManualRefresh}
                                    disabled={refreshing}
                                    className="bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 border border-purple-500/20 text-xs font-semibold py-2 px-3 rounded-lg transition disabled:opacity-50"
                                >
                                    {refreshing ? "Refreshing..." : "Silent Refresh"}
                                </button>
                                <button
                                    onClick={handleTestAuthEndpoint}
                                    disabled={apiTesting}
                                    className="bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 text-xs font-semibold py-2 px-3 rounded-lg transition disabled:opacity-50"
                                >
                                    {apiTesting ? "Testing..." : "Verify Auth API"}
                                </button>
                            </div>
                        </div>

                        {/* Log Console Output */}
                        {refreshLogs.length > 0 && (
                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Console Logs</p>
                                    <button onClick={() => setRefreshLogs([])} className="text-[10px] text-purple-400 hover:text-purple-300 font-semibold">Clear</button>
                                </div>
                                <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-900 font-mono text-[10px] text-slate-400 h-28 overflow-y-auto space-y-1 scrollbar-thin">
                                    {refreshLogs.map((log, index) => (
                                        <div key={index} className="truncate">{log}</div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

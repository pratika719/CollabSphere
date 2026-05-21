import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWorkspaces } from "../../hooks/useWorkspaces.js";
import useWorkspaceStore from "../../store/workspace.store.js";

export default function WorkspaceSwitcher() {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    const { data: workspacesResponse, isLoading } = useWorkspaces();
    const { currentWorkspaceId, setCurrentWorkspace } = useWorkspaceStore();

    const workspaces = workspacesResponse?.data || [];
    const currentWorkspace = workspaces.find((ws) => ws._id === currentWorkspaceId);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Auto-select first workspace if none selected
    useEffect(() => {
        if (!currentWorkspaceId && workspaces.length > 0) {
            setCurrentWorkspace(workspaces[0]._id);
        }
    }, [currentWorkspaceId, workspaces, setCurrentWorkspace]);

    const handleSelect = (workspace) => {
        setCurrentWorkspace(workspace._id);
        setIsOpen(false);
        navigate(`/workspaces/${workspace._id}`);
    };

    // Generate color from workspace name for avatar
    const getWorkspaceColor = (name) => {
        const colors = [
            "from-purple-500 to-indigo-500",
            "from-pink-500 to-rose-500",
            "from-cyan-500 to-blue-500",
            "from-emerald-500 to-teal-500",
            "from-amber-500 to-orange-500",
            "from-violet-500 to-fuchsia-500",
        ];
        const index = name ? name.charCodeAt(0) % colors.length : 0;
        return colors[index];
    };

    if (isLoading) {
        return (
            <div className="px-3 py-2.5">
                <div className="h-10 rounded-xl bg-white/[0.03] animate-pulse" />
            </div>
        );
    }

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 hover:bg-white/[0.04] border border-transparent hover:border-slate-800 group"
            >
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${getWorkspaceColor(currentWorkspace?.name || "W")} flex items-center justify-center text-xs font-bold text-white shadow-md shrink-0`}>
                    {currentWorkspace?.name?.charAt(0)?.toUpperCase() || "W"}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-200 truncate">
                        {currentWorkspace?.name || "Select Workspace"}
                    </p>
                    <p className="text-[10px] text-slate-500 font-medium">
                        {workspaces.length} workspace{workspaces.length !== 1 ? "s" : ""}
                    </p>
                </div>
                <svg
                    className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-xl shadow-2xl shadow-black/40 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                    <div className="p-1.5 max-h-64 overflow-y-auto">
                        {workspaces.map((ws) => (
                            <button
                                key={ws._id}
                                onClick={() => handleSelect(ws)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-150 ${
                                    ws._id === currentWorkspaceId
                                        ? "bg-purple-600/10 border border-purple-500/20"
                                        : "hover:bg-white/[0.04] border border-transparent"
                                }`}
                            >
                                <div className={`w-7 h-7 rounded-lg bg-gradient-to-tr ${getWorkspaceColor(ws.name)} flex items-center justify-center text-[10px] font-bold text-white shadow-sm shrink-0`}>
                                    {ws.name?.charAt(0)?.toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-semibold truncate ${ws._id === currentWorkspaceId ? "text-purple-300" : "text-slate-300"}`}>
                                        {ws.name}
                                    </p>
                                    {ws.description && (
                                        <p className="text-[10px] text-slate-500 truncate">{ws.description}</p>
                                    )}
                                </div>
                                {ws._id === currentWorkspaceId && (
                                    <svg className="w-4 h-4 text-purple-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Divider + Create button */}
                    <div className="border-t border-slate-800 p-1.5">
                        <button
                            onClick={() => {
                                setIsOpen(false);
                                // This will be connected to CreateWorkspaceModal later
                                document.dispatchEvent(new CustomEvent("open-create-workspace-modal"));
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-slate-400 hover:text-purple-400 hover:bg-purple-600/5 transition-all duration-150"
                        >
                            <div className="w-7 h-7 rounded-lg border border-dashed border-slate-700 flex items-center justify-center">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            </div>
                            <span className="text-sm font-semibold">Create Workspace</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

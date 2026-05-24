import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useArchiveWorkspace } from "../../hooks/useWorkspaces.js";
import EditWorkspaceModal from "../modals/EditWorkspaceModal.jsx";
import ConfirmDialog from "../modals/ConfirmDialog.jsx";

/*
|--------------------------------------------------------------------------
| WORKSPACE CARD
|--------------------------------------------------------------------------
|
| Represents a single workspace in a grid/list.
| Includes a context menu for Edit / Archive operations.
|
| Props:
|   workspace: { _id, name, description, members, updatedAt }
|
*/

export default function WorkspaceCard({ workspace }) {
    const navigate = useNavigate();
    const [showMenu, setShowMenu] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
    const menuRef = useRef(null);

    const { mutate: archiveWorkspace, isPending: isArchiving } = useArchiveWorkspace();

    // Close menu on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setShowMenu(false);
            }
        };
        if (showMenu) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [showMenu]);

    const getWorkspaceGradient = (name) => {
        const gradients = [
            "from-purple-500 to-indigo-500",
            "from-pink-500 to-rose-500",
            "from-cyan-500 to-blue-500",
            "from-emerald-500 to-teal-500",
            "from-amber-500 to-orange-500",
            "from-violet-500 to-fuchsia-500",
        ];
        const index = name ? name.charCodeAt(0) % gradients.length : 0;
        return gradients[index];
    };

    const getAccentColor = (name) => {
        const colors = [
            { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/20", hoverBorder: "hover:border-purple-500/30" },
            { bg: "bg-pink-500/10", text: "text-pink-400", border: "border-pink-500/20", hoverBorder: "hover:border-pink-500/30" },
            { bg: "bg-cyan-500/10", text: "text-cyan-400", border: "border-cyan-500/20", hoverBorder: "hover:border-cyan-500/30" },
            { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20", hoverBorder: "hover:border-emerald-500/30" },
            { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20", hoverBorder: "hover:border-amber-500/30" },
            { bg: "bg-violet-500/10", text: "text-violet-400", border: "border-violet-500/20", hoverBorder: "hover:border-violet-500/30" },
        ];
        const index = name ? name.charCodeAt(0) % colors.length : 0;
        return colors[index];
    };

    const accent = getAccentColor(workspace.name);
    const memberCount = workspace.members?.length || 0;

    const formatDate = (dateStr) => {
        if (!dateStr) return "—";
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return "Today";
        if (diffDays === 1) return "Yesterday";
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    };

    const handleArchive = () => {
        archiveWorkspace(workspace._id, {
            onSuccess: () => {
                setShowArchiveConfirm(false);
                navigate("/dashboard");
            },
        });
    };

    return (
        <>
            <div
                onClick={() => navigate(`/workspaces/${workspace._id}`)}
                className={`w-full text-left p-5 rounded-2xl bg-white/[0.02] border border-slate-800/60 ${accent.hoverBorder} hover:bg-white/[0.04] transition-all duration-300 group relative overflow-hidden cursor-pointer`}
            >
                {/* Decorative gradient blob */}
                <div className={`absolute top-0 right-0 w-24 h-24 ${accent.bg} rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />

                <div className="relative space-y-3">
                    {/* Header: Avatar + Name + Menu */}
                    <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${getWorkspaceGradient(workspace.name)} flex items-center justify-center text-sm font-bold text-white shadow-md shrink-0 group-hover:shadow-lg transition-shadow duration-300`}>
                            {workspace.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                            <h4 className="text-[15px] font-bold text-white truncate group-hover:text-white/90">
                                {workspace.name}
                            </h4>
                            {workspace.description && (
                                <p className="text-[12px] text-slate-500 truncate mt-0.5">
                                    {workspace.description}
                                </p>
                            )}
                        </div>

                        {/* Context Menu Trigger */}
                        <div className="relative" ref={menuRef}>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowMenu(!showMenu);
                                }}
                                className="p-1.5 rounded-lg text-slate-600 opacity-0 group-hover:opacity-100 hover:text-slate-300 hover:bg-white/[0.06] transition-all duration-150"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01" />
                                </svg>
                            </button>

                            {/* Dropdown Menu */}
                            {showMenu && (
                                <div className="absolute right-0 top-full mt-1 z-20 w-40 bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-xl shadow-2xl shadow-black/40 overflow-hidden py-1">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowMenu(false);
                                            setShowEditModal(true);
                                        }}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-[12px] font-semibold text-slate-300 hover:text-white hover:bg-white/[0.04] transition-colors text-left"
                                    >
                                        <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        Edit
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowMenu(false);
                                            setShowArchiveConfirm(true);
                                        }}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-[12px] font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/[0.06] transition-colors text-left"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        Archive
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer: Meta info */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/40">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5">
                                <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="text-[11px] font-medium text-slate-500">
                                    {memberCount} member{memberCount !== 1 ? "s" : ""}
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                                </svg>
                                <span className="text-[11px] font-medium text-slate-500">
                                    {workspace.boardCount || 0} board{(workspace.boardCount || 0) !== 1 ? "s" : ""}
                                </span>
                            </div>
                        </div>
                        <span className="text-[10px] font-medium text-slate-600">
                            {formatDate(workspace.updatedAt)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            <EditWorkspaceModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                workspace={workspace}
            />

            {/* Archive Confirm */}
            <ConfirmDialog
                isOpen={showArchiveConfirm}
                onClose={() => setShowArchiveConfirm(false)}
                onConfirm={handleArchive}
                title="Archive Workspace"
                message={`Are you sure you want to archive "${workspace.name}"? This action can be undone later.`}
                confirmLabel="Archive"
                isPending={isArchiving}
            />
        </>
    );
}

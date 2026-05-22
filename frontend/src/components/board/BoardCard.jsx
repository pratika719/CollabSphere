import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useArchiveBoard } from "../../hooks/useBoards.js";
import EditBoardModal from "../modals/EditBoardModal.jsx";
import ConfirmDialog from "../modals/ConfirmDialog.jsx";

/*
|--------------------------------------------------------------------------
| BOARD CARD
|--------------------------------------------------------------------------
|
| Represents a single board in a grid.
| Includes context menu for Edit / Archive operations.
|
| Props:
|   board: { _id, title, position, color, workspace, createdAt, updatedAt }
|   workspaceId: string
|   taskCount: number (optional)
|
*/

export default function BoardCard({ board, workspaceId, taskCount = 0 }) {
    const navigate = useNavigate();
    const [showMenu, setShowMenu] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
    const menuRef = useRef(null);

    const { mutate: archiveBoard, isPending: isArchiving } = useArchiveBoard();

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

    const boardColors = {
        "#FFFFFF": { bg: "bg-slate-500/10", text: "text-slate-300", border: "border-slate-500/20", dot: "bg-slate-400" },
        "#FF6B6B": { bg: "bg-red-500/10", text: "text-red-300", border: "border-red-500/20", dot: "bg-red-400" },
        "#4ECDC4": { bg: "bg-teal-500/10", text: "text-teal-300", border: "border-teal-500/20", dot: "bg-teal-400" },
        "#45B7D1": { bg: "bg-sky-500/10", text: "text-sky-300", border: "border-sky-500/20", dot: "bg-sky-400" },
        "#96CEB4": { bg: "bg-emerald-500/10", text: "text-emerald-300", border: "border-emerald-500/20", dot: "bg-emerald-400" },
        "#FFEAA7": { bg: "bg-amber-500/10", text: "text-amber-300", border: "border-amber-500/20", dot: "bg-amber-400" },
        "#DDA0DD": { bg: "bg-purple-500/10", text: "text-purple-300", border: "border-purple-500/20", dot: "bg-purple-400" },
    };

    const defaultColor = { bg: "bg-purple-500/10", text: "text-purple-300", border: "border-purple-500/20", dot: "bg-purple-400" };
    const colorScheme = boardColors[board.color] || defaultColor;

    const formatDate = (dateStr) => {
        if (!dateStr) return "—";
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return "Updated today";
        if (diffDays === 1) return "Yesterday";
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    };

    const handleArchive = () => {
        archiveBoard(
            { boardId: board._id, workspaceId },
            {
                onSuccess: () => setShowArchiveConfirm(false),
            }
        );
    };

    return (
        <>
            <div
                onClick={() => navigate(`/workspaces/${workspaceId}/boards/${board._id}`)}
                className="w-full text-left p-5 rounded-2xl bg-white/[0.02] border border-slate-800/60 hover:border-slate-700/60 hover:bg-white/[0.04] transition-all duration-300 group relative overflow-hidden cursor-pointer"
            >
                {/* Decorative top bar */}
                <div className={`absolute top-0 left-0 right-0 h-[2px] ${colorScheme.dot} opacity-40 group-hover:opacity-80 transition-opacity duration-300`} />

                <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className={`w-2 h-2 rounded-full ${colorScheme.dot} shrink-0`} />
                            <h4 className="text-[15px] font-bold text-white group-hover:text-white/90 truncate">
                                {board.title}
                            </h4>
                        </div>

                        {/* Context Menu */}
                        <div className="relative" ref={menuRef}>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowMenu(!showMenu);
                                }}
                                className="p-1 rounded-md text-slate-600 opacity-0 group-hover:opacity-100 hover:text-slate-300 hover:bg-white/[0.06] transition-all duration-150"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01" />
                                </svg>
                            </button>

                            {showMenu && (
                                <div className="absolute right-0 top-full mt-1 z-20 w-36 bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-xl shadow-2xl shadow-black/40 overflow-hidden py-1">
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

                    {/* Stats */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${colorScheme.bg} ${colorScheme.text} border ${colorScheme.border}`}>
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                {taskCount} task{taskCount !== 1 ? "s" : ""}
                            </span>
                        </div>
                        <span className="text-[10px] font-medium text-slate-600">
                            {formatDate(board.updatedAt)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            <EditBoardModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                board={board}
                workspaceId={workspaceId}
            />

            {/* Archive Confirm */}
            <ConfirmDialog
                isOpen={showArchiveConfirm}
                onClose={() => setShowArchiveConfirm(false)}
                onConfirm={handleArchive}
                title="Archive Board"
                message={`Are you sure you want to archive "${board.title}"? All tasks in this board will also be archived.`}
                confirmLabel="Archive"
                isPending={isArchiving}
            />
        </>
    );
}

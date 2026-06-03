import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useWorkspace, useArchiveWorkspace } from "../hooks/useWorkspaces.js";
import { useBoards } from "../hooks/useBoards.js";
import useWorkspaceStore from "../store/workspace.store.js";
import BoardCard from "../components/board/BoardCard.jsx";
import CreateBoardModal from "../components/modals/CreateBoardModal.jsx";
import EditWorkspaceModal from "../components/modals/EditWorkspaceModal.jsx";
import ConfirmDialog from "../components/modals/ConfirmDialog.jsx";
import { useWorkspaceSocket } from "../realtime/useWorkspaceSocket.js";

/*
|--------------------------------------------------------------------------
| WORKSPACE PAGE
|--------------------------------------------------------------------------
|
| Route: /workspaces/:workspaceId
| Displays workspace header with edit/archive actions + board grid.
|
*/

export default function WorkspacePage() {
    const { workspaceId } = useParams();
    const navigate = useNavigate();
    const [showCreateBoard, setShowCreateBoard] = useState(false);
    const [showEditWorkspace, setShowEditWorkspace] = useState(false);
    const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
    const { setCurrentWorkspace } = useWorkspaceStore();

    const { data: workspaceResponse, isLoading: wsLoading } = useWorkspace(workspaceId);
    const { data: boardsResponse, isLoading: boardsLoading } = useBoards(workspaceId);
    const { mutate: archiveWorkspace, isPending: isArchiving } = useArchiveWorkspace();

    useWorkspaceSocket(workspaceId);

    const workspace = workspaceResponse?.data;
    const boards = boardsResponse?.data || [];

    // Sync workspace selection when navigating directly to a workspace URL
    useEffect(() => {
        if (workspaceId) {
            setCurrentWorkspace(workspaceId);
        }
    }, [workspaceId, setCurrentWorkspace]);

    const handleArchive = () => {
        archiveWorkspace(workspaceId, {
            onSuccess: () => {
                setShowArchiveConfirm(false);
                navigate("/dashboard");
            },
        });
    };

    if (wsLoading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-8 bg-slate-800 rounded w-1/3" />
                <div className="h-4 bg-slate-800/60 rounded w-1/2" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-32 rounded-2xl bg-white/[0.02] border border-slate-800/60" />
                    ))}
                </div>
            </div>
        );
    }

    if (!workspace) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h3 className="text-lg font-bold text-white mb-1">Workspace Not Found</h3>
                <p className="text-[13px] text-slate-500 mb-4">This workspace doesn't exist or you don't have access.</p>
                <Link to="/dashboard" className="text-[13px] font-semibold text-purple-400 hover:text-purple-300 transition-colors">
                    ← Back to Dashboard
                </Link>
            </div>
        );
    }

    const memberCount = workspace.members?.length || 0;

    return (
        <div className="space-y-8 text-left">
            {/* Workspace Header */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-6 border-b border-slate-800/40">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-lg font-bold text-white shadow-lg shadow-purple-500/20 shrink-0">
                        {workspace.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold text-white tracking-tight">
                            {workspace.name}
                        </h1>
                        {workspace.description && (
                            <p className="text-[13px] text-slate-400 mt-1">{workspace.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-3">
                            <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {memberCount} member{memberCount !== 1 ? "s" : ""}
                            </span>
                            <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                {boards.length} board{boards.length !== 1 ? "s" : ""}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 shrink-0">
                    <button
                        onClick={() => setShowEditWorkspace(true)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] border border-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] text-[12px] font-semibold transition-all duration-200"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                    </button>
                    <button
                        onClick={() => setShowArchiveConfirm(true)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] border border-slate-800/60 text-slate-400 hover:text-red-400 hover:border-red-500/20 hover:bg-red-500/[0.04] text-[12px] font-semibold transition-all duration-200"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Archive
                    </button>
                    <button
                        onClick={() => setShowCreateBoard(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-[13px] font-semibold shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 transition-all duration-200"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        New Board
                    </button>
                </div>
            </div>

            {/* Board Grid */}
            <div className="space-y-4">
                <h3 className="text-[15px] font-bold text-slate-300 uppercase tracking-wide">Boards</h3>

                {boardsLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-28 rounded-2xl bg-white/[0.02] border border-slate-800/60 animate-pulse" />
                        ))}
                    </div>
                ) : boards.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 px-4 rounded-2xl bg-white/[0.01] border border-dashed border-slate-800/60">
                        <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4">
                            <svg className="w-7 h-7 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <h4 className="text-[15px] font-bold text-white mb-1">No boards yet</h4>
                        <p className="text-[12px] text-slate-500 mb-4 text-center max-w-xs">
                            Create your first board to start organizing tasks in this workspace.
                        </p>
                        <button
                            onClick={() => setShowCreateBoard(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[13px] font-semibold shadow-lg shadow-purple-500/20 transition-all duration-200"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Create Board
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {boards.map((board) => (
                            <BoardCard
                                key={board._id}
                                board={board}
                                workspaceId={workspaceId}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Modals */}
            <CreateBoardModal
                isOpen={showCreateBoard}
                onClose={() => setShowCreateBoard(false)}
                workspaceId={workspaceId}
            />

            <EditWorkspaceModal
                isOpen={showEditWorkspace}
                onClose={() => setShowEditWorkspace(false)}
                workspace={workspace}
            />

            <ConfirmDialog
                isOpen={showArchiveConfirm}
                onClose={() => setShowArchiveConfirm(false)}
                onConfirm={handleArchive}
                title="Archive Workspace"
                message={`Are you sure you want to archive "${workspace.name}"? All boards and tasks will also be archived.`}
                confirmLabel="Archive"
                isPending={isArchiving}
            />
        </div>
    );
}

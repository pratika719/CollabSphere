import { useState, useEffect } from "react";
import { useUpdateBoard } from "../../hooks/useBoards.js";

/*
|--------------------------------------------------------------------------
| EDIT BOARD MODAL
|--------------------------------------------------------------------------
|
| Props:
|   isOpen: boolean
|   onClose: () => void
|   board: { _id, title }
|   workspaceId: string
|
*/

export default function EditBoardModal({ isOpen, onClose, board, workspaceId }) {
    const [title, setTitle] = useState("");
    const [prevBoard, setPrevBoard] = useState(null);
    const { mutate: updateBoard, isPending } = useUpdateBoard();

    // Derived state for board changes
    if (board !== prevBoard) {
        setPrevBoard(board);
        setTitle(board?.title || "");
    }

    // Close on Escape
    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen || !board) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim()) return;

        updateBoard(
            {
                boardId: board._id,
                workspaceId,
                updateData: { title: title.trim() },
            },
            {
                onSuccess: () => onClose(),
            }
        );
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) onClose();
    };

    const hasChanges = title.trim() !== (board.title || "");

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={handleBackdropClick}
        >
            <div className="w-full max-w-md mx-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/60">
                    <h2 className="text-[15px] font-bold text-white">Edit Board</h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/[0.05] transition-all duration-150"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">
                            Board Title *
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Sprint Backlog"
                            maxLength={100}
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-[13px] font-medium placeholder:text-slate-600 focus:outline-none focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/20 transition-all duration-200"
                            autoFocus
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg text-[13px] font-semibold text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] transition-all duration-150"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!title.trim() || !hasChanges || isPending}
                            className="px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[13px] font-semibold shadow-lg shadow-purple-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isPending ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

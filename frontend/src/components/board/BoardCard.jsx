import { useNavigate } from "react-router-dom";

/**
 * BoardCard — Domain-driven card component
 *
 * Represents a single board in a grid.
 * Used in WorkspacePage's BoardGrid.
 *
 * Props:
 *   board: { _id, title, position, color, workspace, createdAt, updatedAt }
 *   workspaceId: string
 *   taskCount: number (optional, from parent)
 */
export default function BoardCard({ board, workspaceId, taskCount = 0 }) {
    const navigate = useNavigate();

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

    return (
        <button
            onClick={() => navigate(`/workspaces/${workspaceId}/boards/${board._id}`)}
            className="w-full text-left p-5 rounded-2xl bg-white/[0.02] border border-slate-800/60 hover:border-slate-700/60 hover:bg-white/[0.04] transition-all duration-300 group relative overflow-hidden"
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
                    {/* Arrow icon on hover */}
                    <svg className="w-4 h-4 text-slate-600 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-0.5 transition-all duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
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
        </button>
    );
}

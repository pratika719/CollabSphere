/**
 * TaskCard — Reusable domain-driven component
 *
 * Used in: BoardColumn, search results, filtered views, assigned tasks.
 *
 * Props:
 *   task: { _id, title, description, priority, status, dueDate, labels, assignee }
 */
export default function TaskCard({ task }) {
    const priorityConfig = {
        high: {
            icon: (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
                </svg>
            ),
            color: "text-red-400",
            bg: "bg-red-500/10",
            border: "border-red-500/20",
            label: "High",
        },
        medium: {
            icon: (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
                </svg>
            ),
            color: "text-amber-400",
            bg: "bg-amber-500/10",
            border: "border-amber-500/20",
            label: "Medium",
        },
        low: {
            icon: (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
            ),
            color: "text-blue-400",
            bg: "bg-blue-500/10",
            border: "border-blue-500/20",
            label: "Low",
        },
    };

    const priority = priorityConfig[task.priority] || priorityConfig.medium;

    const labelColors = [
        "bg-purple-500/15 text-purple-300 border-purple-500/20",
        "bg-cyan-500/15 text-cyan-300 border-cyan-500/20",
        "bg-pink-500/15 text-pink-300 border-pink-500/20",
        "bg-emerald-500/15 text-emerald-300 border-emerald-500/20",
        "bg-amber-500/15 text-amber-300 border-amber-500/20",
    ];

    const isOverdue = () => {
        if (!task.dueDate) return false;
        return new Date(task.dueDate) < new Date() && task.status !== "completed";
    };

    const formatDueDate = (dateStr) => {
        if (!dateStr) return null;
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = date - now;
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return `${Math.abs(diffDays)}d overdue`;
        if (diffDays === 0) return "Due today";
        if (diffDays === 1) return "Due tomorrow";
        if (diffDays < 7) return `${diffDays}d left`;
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    };

    const getAssigneeInitials = () => {
        if (!task.assignee) return null;
        if (typeof task.assignee === "string") return "?";
        return task.assignee.name?.slice(0, 2)?.toUpperCase() || "?";
    };

    return (
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/50 hover:border-slate-700/60 hover:bg-slate-900/80 transition-all duration-200 cursor-pointer group">
            {/* Labels */}
            {task.labels && task.labels.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2.5">
                    {task.labels.map((label, index) => (
                        <span
                            key={index}
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border ${labelColors[index % labelColors.length]}`}
                        >
                            {label}
                        </span>
                    ))}
                </div>
            )}

            {/* Title */}
            <h5 className="text-[13px] font-semibold text-slate-200 leading-snug mb-2 group-hover:text-white transition-colors">
                {task.title}
            </h5>

            {/* Description preview */}
            {task.description && (
                <p className="text-[11px] text-slate-500 line-clamp-2 mb-3 leading-relaxed">
                    {task.description}
                </p>
            )}

            {/* Footer: Priority + Due Date + Assignee */}
            <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center gap-2">
                    {/* Priority badge */}
                    <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold ${priority.bg} ${priority.color} border ${priority.border}`}>
                        {priority.icon}
                        {priority.label}
                    </span>

                    {/* Due date */}
                    {task.dueDate && (
                        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold ${isOverdue() ? "text-red-400" : "text-slate-500"}`}>
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {formatDueDate(task.dueDate)}
                        </span>
                    )}
                </div>

                {/* Assignee avatar */}
                {getAssigneeInitials() && (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-[8px] font-bold text-white">
                        {getAssigneeInitials()}
                    </div>
                )}
            </div>
        </div>
    );
}

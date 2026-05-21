import TaskCard from "../task/TaskCard.jsx";

/**
 * BoardColumn — Kanban column container
 *
 * Large component that ORCHESTRATES.
 * Small components (TaskCard) DISPLAY.
 *
 * Props:
 *   title: string (e.g. "To Do", "In Progress", "Completed")
 *   status: string (e.g. "todo", "in-progress", "completed")
 *   tasks: array of task objects filtered to this column's status
 *   onCreateTask: function to open create task modal for this column
 */
export default function BoardColumn({ title, status, tasks = [], onCreateTask }) {
    const statusConfig = {
        "todo": {
            dot: "bg-slate-400",
            bg: "bg-slate-500/5",
            border: "border-slate-800/50",
            headerBg: "bg-slate-500/10",
        },
        "in-progress": {
            dot: "bg-amber-400",
            bg: "bg-amber-500/[0.02]",
            border: "border-amber-500/10",
            headerBg: "bg-amber-500/10",
        },
        "completed": {
            dot: "bg-emerald-400",
            bg: "bg-emerald-500/[0.02]",
            border: "border-emerald-500/10",
            headerBg: "bg-emerald-500/10",
        },
    };

    const config = statusConfig[status] || statusConfig["todo"];

    return (
        <div className={`flex flex-col w-[320px] shrink-0 rounded-2xl ${config.bg} border ${config.border}`}>
            {/* Column Header */}
            <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2.5">
                    <div className={`w-2 h-2 rounded-full ${config.dot}`} />
                    <h3 className="text-[13px] font-bold text-slate-300 uppercase tracking-wide">
                        {title}
                    </h3>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold text-slate-500 ${config.headerBg}`}>
                        {tasks.length}
                    </span>
                </div>
                {/* Add task button */}
                <button
                    onClick={() => onCreateTask?.(status)}
                    className="p-1 rounded-md text-slate-500 hover:text-slate-300 hover:bg-white/[0.05] transition-all duration-150"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                </button>
            </div>

            {/* Task List */}
            <div className="flex-1 px-2 pb-2 space-y-2 overflow-y-auto max-h-[calc(100vh-240px)] scrollbar-thin">
                {tasks.map((task) => (
                    <TaskCard key={task._id} task={task} />
                ))}

                {/* Empty state */}
                {tasks.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-8 px-4">
                        <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-dashed border-slate-800 flex items-center justify-center mb-3">
                            <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                        <p className="text-[11px] text-slate-600 font-medium text-center">
                            No tasks yet
                        </p>
                        <button
                            onClick={() => onCreateTask?.(status)}
                            className="mt-2 text-[11px] font-semibold text-purple-400 hover:text-purple-300 transition-colors"
                        >
                            Add a task
                        </button>
                    </div>
                )}
            </div>

            {/* Bottom add task button */}
            {tasks.length > 0 && (
                <div className="px-2 pb-2">
                    <button
                        onClick={() => onCreateTask?.(status)}
                        className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-[12px] font-semibold text-slate-500 hover:text-slate-300 hover:bg-white/[0.03] border border-dashed border-slate-800/60 hover:border-slate-700 transition-all duration-200"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Task
                    </button>
                </div>
            )}
        </div>
    );
}

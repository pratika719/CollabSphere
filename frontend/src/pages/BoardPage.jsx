import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useTasks } from "../hooks/useTasks.js";
import { useBoards } from "../hooks/useBoards.js";
import BoardColumn from "../components/board/BoardColumn.jsx";
import CreateTaskModal from "../components/modals/CreateTaskModal.jsx";

export default function BoardPage() {
    const { workspaceId, boardId } = useParams();
    const [showCreateTask, setShowCreateTask] = useState(false);
    const [defaultStatus, setDefaultStatus] = useState("todo");

    const { data: tasksResponse, isLoading: tasksLoading } = useTasks(boardId);
    const { data: boardsResponse } = useBoards(workspaceId);

    const tasks = tasksResponse?.data || [];
    const boards = boardsResponse?.data || [];
    const currentBoard = boards.find((b) => b._id === boardId);

    // Group tasks by status for Kanban columns
    const tasksByStatus = useMemo(() => {
        const grouped = {
            "todo": [],
            "in-progress": [],
            "completed": [],
        };

        tasks.forEach((task) => {
            if (grouped[task.status]) {
                grouped[task.status].push(task);
            } else {
                grouped["todo"].push(task);
            }
        });

        // Sort each group by position
        Object.keys(grouped).forEach((status) => {
            grouped[status].sort((a, b) => (a.position || 0) - (b.position || 0));
        });

        return grouped;
    }, [tasks]);

    const handleCreateTask = (status) => {
        setDefaultStatus(status);
        setShowCreateTask(true);
    };

    const columns = [
        { title: "To Do", status: "todo" },
        { title: "In Progress", status: "in-progress" },
        { title: "Completed", status: "completed" },
    ];

    if (tasksLoading) {
        return (
            <div className="space-y-6">
                <div className="h-8 bg-slate-800 rounded w-1/4 animate-pulse" />
                <div className="flex gap-4 overflow-x-auto pb-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="w-[320px] h-[400px] shrink-0 rounded-2xl bg-white/[0.02] border border-slate-800/60 animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 text-left">
            {/* Board Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/40">
                <div className="flex items-center gap-3">
                    <Link
                        to={`/workspaces/${workspaceId}`}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/[0.04] transition-all duration-200"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </Link>
                    <div>
                        <h1 className="text-xl font-extrabold text-white tracking-tight">
                            {currentBoard?.title || "Board"}
                        </h1>
                        <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                            {tasks.length} task{tasks.length !== 1 ? "s" : ""} · Kanban View
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => handleCreateTask("todo")}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-[13px] font-semibold shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 transition-all duration-200"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Task
                </button>
            </div>

            {/* Kanban Board — Horizontal scroll */}
            <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2">
                {columns.map((col) => (
                    <BoardColumn
                        key={col.status}
                        title={col.title}
                        status={col.status}
                        tasks={tasksByStatus[col.status]}
                        onCreateTask={handleCreateTask}
                    />
                ))}
            </div>

            {/* Create Task Modal */}
            <CreateTaskModal
                isOpen={showCreateTask}
                onClose={() => setShowCreateTask(false)}
                boardId={boardId}
                defaultStatus={defaultStatus}
            />
        </div>
    );
}

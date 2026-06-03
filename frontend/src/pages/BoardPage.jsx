import { useState, useMemo, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useTasks } from "../hooks/useTasks.js";
import { useBoards, useArchiveBoard } from "../hooks/useBoards.js";
import { useMoveTaskDnd } from "../hooks/useMoveTaskDnd.js";
import { useReorderTasksDnd } from "../hooks/useReorderTasksDnd.js";
import BoardColumn from "../components/board/BoardColumn.jsx";
import CreateTaskModal from "../components/modals/CreateTaskModal.jsx";
import EditBoardModal from "../components/modals/EditBoardModal.jsx";
import TaskDetailModal from "../components/modals/TaskDetailModal.jsx";
import ConfirmDialog from "../components/modals/ConfirmDialog.jsx";
import { DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove } from "@dnd-kit/sortable";
import TaskCard from "../components/task/TaskCard.jsx";
import { useRealtimeTasks } from "../realtime/useRealtimeTasks.js";
import { useWorkspaceSocket } from "../realtime/useWorkspaceSocket.js";


/*
|--------------------------------------------------------------------------
| BOARD PAGE — Kanban Board View
|--------------------------------------------------------------------------
|
| Route: /workspaces/:workspaceId/boards/:boardId
|
| Features:
| - Kanban columns (To Do, In Progress, Completed)
| - Create task with default status
| - Click task to open detail modal (edit all fields)
| - Edit board title
| - Archive board with confirmation
|
*/

export default function BoardPage() {
    const { workspaceId, boardId } = useParams();
    const navigate = useNavigate();

    const [showCreateTask, setShowCreateTask] = useState(false);
    const [defaultStatus, setDefaultStatus] = useState("todo");
    const [selectedTask, setSelectedTask] = useState(null);
    const [showEditBoard, setShowEditBoard] = useState(false);
    const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
    const [activeTask, setActiveTask] = useState(null)
    const { data: tasksResponse, isLoading: tasksLoading } = useTasks(boardId);
    const { data: boardsResponse } = useBoards(workspaceId);
    const { mutate: archiveBoard, isPending: isArchiving } = useArchiveBoard();
    const { mutate: moveTaskDnd } = useMoveTaskDnd();
    const { mutate: reorderTasksDnd } = useReorderTasksDnd();

    useWorkspaceSocket(workspaceId);
    useRealtimeTasks(workspaceId);

    const tasks = useMemo(() => tasksResponse?.data || [], [tasksResponse?.data]);
    const boards = boardsResponse?.data || [];
    const currentBoard = boards.find((b) => b._id === boardId);
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        })
    );
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

    const handleTaskClick = (task) => {
        setSelectedTask(task);
    };

    const handleArchiveBoard = () => {
        archiveBoard(
            { boardId, workspaceId },
            {
                onSuccess: () => {
                    setShowArchiveConfirm(false);
                    navigate(`/workspaces/${workspaceId}`);
                },
            }
        );
    };

    // Helper: find which column a task belongs to
    const findColumnForTask = useCallback((taskId) => {
        const columnStatuses = ["todo", "in-progress", "completed"];
        if (columnStatuses.includes(taskId)) return taskId;

        for (const [status, statusTasks] of Object.entries(tasksByStatus)) {
            if (statusTasks.some((t) => t._id === taskId)) {
                return status;
            }
        }
        return null;
    }, [tasksByStatus]);

    // DRAG START — record which task the user picked up
    const handleDragStart = useCallback((event) => {
        const { active } = event;
        const task = tasks.find((t) => t._id === active.id);
        setActiveTask(task || null);
    }, [tasks]);

    // DRAG END — handles both status change and within-column reordering
    const handleDragEnd = useCallback((event) => {
        const { active, over } = event;
        setActiveTask(null);

        if (!over || active.id === over.id) return;

        const activeId = active.id;
        const overId = over.id;

        const sourceColumn = findColumnForTask(activeId);
        const destColumn = findColumnForTask(overId);

        if (!sourceColumn || !destColumn) return;

        if (sourceColumn === destColumn) {
            const columnTasks = tasksByStatus[sourceColumn];
            const oldIndex = columnTasks.findIndex((t) => t._id === activeId);
            const newIndex = columnTasks.findIndex((t) => t._id === overId);

            if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;

            const reordered = arrayMove(columnTasks, oldIndex, newIndex);
            const reorderedIds = reordered.map((t) => t._id);

            reorderTasksDnd({
                boardId,
                tasks: reorderedIds,
                reorderedTasks: reordered,
                status: sourceColumn,
            });
            return;
        }

        moveTaskDnd({
            taskId: activeId,
            boardId,
            updateData: { status: destColumn },
        });
    }, [findColumnForTask, tasksByStatus, moveTaskDnd, reorderTasksDnd, boardId]);


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

                {/* Action buttons */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowEditBoard(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] text-[12px] font-semibold transition-all duration-200"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                    </button>
                    <button
                        onClick={() => setShowArchiveConfirm(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-slate-800/60 text-slate-400 hover:text-red-400 hover:border-red-500/20 hover:bg-red-500/[0.04] text-[12px] font-semibold transition-all duration-200"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Archive
                    </button>
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
            </div>

            {/* Kanban Board — Horizontal scroll */}
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2">
                    {columns.map((col) => (
                        <BoardColumn
                            key={col.status}
                            title={col.title}
                            status={col.status}
                            tasks={tasksByStatus[col.status]}
                            onCreateTask={handleCreateTask}
                            onTaskClick={handleTaskClick}
                        />
                    ))}
                </div>

                <DragOverlay dropAnimation={null}>
                    {activeTask ? (
                        <div className="rotate-[3deg] scale-105 pointer-events-none">
                            <TaskCard task={activeTask} />
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>

            {/* Create Task Modal */}
            <CreateTaskModal
                isOpen={showCreateTask}
                onClose={() => setShowCreateTask(false)}
                boardId={boardId}
                workspaceId={workspaceId}
                defaultStatus={defaultStatus}
            />

            {/* Task Detail Modal */}
            <TaskDetailModal
                isOpen={!!selectedTask}
                onClose={() => setSelectedTask(null)}
                task={selectedTask}
                boardId={boardId}
                workspaceId={workspaceId}
            />

            {/* Edit Board Modal */}
            <EditBoardModal
                isOpen={showEditBoard}
                onClose={() => setShowEditBoard(false)}
                board={currentBoard}
                workspaceId={workspaceId}
            />

            {/* Archive Board Confirm */}
            <ConfirmDialog
                isOpen={showArchiveConfirm}
                onClose={() => setShowArchiveConfirm(false)}
                onConfirm={handleArchiveBoard}
                title="Archive Board"
                message={`Are you sure you want to archive "${currentBoard?.title}"? All tasks in this board will also be archived.`}
                confirmLabel="Archive"
                isPending={isArchiving}
            />
        </div>
    );
}

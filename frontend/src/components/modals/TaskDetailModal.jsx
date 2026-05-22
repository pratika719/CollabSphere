import { useState, useEffect } from "react";
import { useUpdateTask, useArchiveTask } from "../../hooks/useTasks.js";

/*
|--------------------------------------------------------------------------
| TASK DETAIL MODAL
|--------------------------------------------------------------------------
|
| Full task detail view with inline editing for all fields.
| Opens when a user clicks a TaskCard in the Kanban board.
|
| Architecture:
| - Local form state synced from `task` prop on open
| - "Save" button only enabled when changes are detected
| - Archive action with inline confirmation
|
| Props:
|   isOpen: boolean
|   onClose: () => void
|   task: { _id, title, description, priority, status, dueDate, labels, assignee, board }
|   boardId: string
|
*/

export default function TaskDetailModal({ isOpen, onClose, task, boardId }) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState("medium");
    const [status, setStatus] = useState("todo");
    const [dueDate, setDueDate] = useState("");
    const [labelInput, setLabelInput] = useState("");
    const [labels, setLabels] = useState([]);
    const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
    const [prevTask, setPrevTask] = useState(null);

    const { mutate: updateTask, isPending: isUpdating } = useUpdateTask();
    const { mutate: archiveTask, isPending: isArchiving } = useArchiveTask();

    // Derived state for task changes
    if (task !== prevTask) {
        setPrevTask(task);
        setTitle(task?.title || "");
        setDescription(task?.description || "");
        setPriority(task?.priority || "medium");
        setStatus(task?.status || "todo");
        setDueDate(task?.dueDate ? task.dueDate.split("T")[0] : "");
        setLabels(task?.labels || []);
        setShowArchiveConfirm(false);
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

    if (!isOpen || !task) return null;

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) onClose();
    };

    // Detect changes
    const hasChanges =
        title.trim() !== (task.title || "") ||
        description.trim() !== (task.description || "") ||
        priority !== (task.priority || "medium") ||
        status !== (task.status || "todo") ||
        dueDate !== (task.dueDate ? task.dueDate.split("T")[0] : "") ||
        JSON.stringify(labels) !== JSON.stringify(task.labels || []);

    const handleSave = () => {
        if (!title.trim()) return;

        updateTask(
            {
                taskId: task._id,
                boardId,
                updateData: {
                    title: title.trim(),
                    description: description.trim(),
                    priority,
                    status,
                    dueDate: dueDate || null,
                    labels,
                },
            },
            {
                onSuccess: () => onClose(),
            }
        );
    };

    const handleArchive = () => {
        archiveTask(
            { taskId: task._id, boardId },
            {
                onSuccess: () => onClose(),
            }
        );
    };

    const handleAddLabel = () => {
        const trimmed = labelInput.trim();
        if (trimmed && !labels.includes(trimmed)) {
            setLabels([...labels, trimmed]);
            setLabelInput("");
        }
    };

    const handleRemoveLabel = (label) => {
        setLabels(labels.filter((l) => l !== label));
    };

    const handleLabelKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleAddLabel();
        }
    };

    const priorityOptions = [
        { value: "low", label: "Low", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
        { value: "medium", label: "Medium", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
        { value: "high", label: "High", color: "text-red-400 bg-red-500/10 border-red-500/20" },
    ];

    const statusOptions = [
        { value: "todo", label: "To Do", dot: "bg-slate-400" },
        { value: "in-progress", label: "In Progress", dot: "bg-amber-400" },
        { value: "completed", label: "Completed", dot: "bg-emerald-400" },
    ];

    const labelColors = [
        "bg-purple-500/15 text-purple-300 border-purple-500/20",
        "bg-cyan-500/15 text-cyan-300 border-cyan-500/20",
        "bg-pink-500/15 text-pink-300 border-pink-500/20",
        "bg-emerald-500/15 text-emerald-300 border-emerald-500/20",
        "bg-amber-500/15 text-amber-300 border-amber-500/20",
    ];

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={handleBackdropClick}
        >
            <div className="w-full max-w-xl mx-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/60 sticky top-0 bg-slate-900 z-10">
                    <h2 className="text-[15px] font-bold text-white">Task Details</h2>
                    <div className="flex items-center gap-2">
                        {/* Archive button */}
                        {!showArchiveConfirm ? (
                            <button
                                onClick={() => setShowArchiveConfirm(true)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150"
                                title="Archive task"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        ) : (
                            <div className="flex items-center gap-1.5">
                                <span className="text-[11px] text-red-400 font-medium">Archive?</span>
                                <button
                                    onClick={handleArchive}
                                    disabled={isArchiving}
                                    className="px-2 py-1 rounded text-[11px] font-bold bg-red-600 text-white hover:bg-red-500 transition-colors disabled:opacity-50"
                                >
                                    {isArchiving ? "..." : "Yes"}
                                </button>
                                <button
                                    onClick={() => setShowArchiveConfirm(false)}
                                    className="px-2 py-1 rounded text-[11px] font-bold text-slate-400 hover:text-slate-200 transition-colors"
                                >
                                    No
                                </button>
                            </div>
                        )}
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/[0.05] transition-all duration-150"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Form Body */}
                <div className="p-6 space-y-5">
                    {/* Title */}
                    <div className="space-y-1.5">
                        <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">
                            Title *
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            maxLength={100}
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-[13px] font-medium placeholder:text-slate-600 focus:outline-none focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/20 transition-all duration-200"
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                        <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Add more details..."
                            maxLength={500}
                            rows={3}
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-[13px] font-medium placeholder:text-slate-600 focus:outline-none focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/20 transition-all duration-200 resize-none"
                        />
                    </div>

                    {/* Status + Priority row */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Status */}
                        <div className="space-y-1.5">
                            <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">
                                Status
                            </label>
                            <div className="flex flex-col gap-1.5">
                                {statusOptions.map((opt) => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => setStatus(opt.value)}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-semibold border transition-all duration-150 ${
                                            status === opt.value
                                                ? "bg-white/[0.06] border-slate-700 text-white"
                                                : "text-slate-500 bg-slate-950 border-slate-800 hover:border-slate-700"
                                        }`}
                                    >
                                        <div className={`w-2 h-2 rounded-full ${opt.dot}`} />
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Priority */}
                        <div className="space-y-1.5">
                            <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">
                                Priority
                            </label>
                            <div className="flex flex-col gap-1.5">
                                {priorityOptions.map((opt) => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => setPriority(opt.value)}
                                        className={`px-3 py-2 rounded-lg text-[12px] font-bold border transition-all duration-150 ${
                                            priority === opt.value
                                                ? opt.color
                                                : "text-slate-500 bg-slate-950 border-slate-800 hover:border-slate-700"
                                        }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Due Date */}
                    <div className="space-y-1.5">
                        <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">
                            Due Date
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                className="flex-1 px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-[13px] font-medium focus:outline-none focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/20 transition-all duration-200 [color-scheme:dark]"
                            />
                            {dueDate && (
                                <button
                                    type="button"
                                    onClick={() => setDueDate("")}
                                    className="px-3 py-2 rounded-xl text-[12px] font-semibold text-slate-500 hover:text-slate-300 bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Labels */}
                    <div className="space-y-1.5">
                        <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">
                            Labels
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={labelInput}
                                onChange={(e) => setLabelInput(e.target.value)}
                                onKeyDown={handleLabelKeyDown}
                                placeholder="Type and press Enter"
                                className="flex-1 px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-[13px] font-medium placeholder:text-slate-600 focus:outline-none focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/20 transition-all duration-200"
                            />
                            <button
                                type="button"
                                onClick={handleAddLabel}
                                disabled={!labelInput.trim()}
                                className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 text-[12px] font-semibold hover:bg-slate-700 transition-colors disabled:opacity-40"
                            >
                                Add
                            </button>
                        </div>
                        {labels.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                                {labels.map((label, index) => (
                                    <span
                                        key={label}
                                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${labelColors[index % labelColors.length]}`}
                                    >
                                        {label}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveLabel(label)}
                                            className="hover:opacity-70 transition-opacity"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Metadata */}
                    {task.assignee && (
                        <div className="flex items-center gap-2 pt-2 border-t border-slate-800/40">
                            <span className="text-[11px] font-medium text-slate-500">Assigned to:</span>
                            <div className="flex items-center gap-1.5">
                                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-[8px] font-bold text-white">
                                    {typeof task.assignee === "object"
                                        ? task.assignee.name?.slice(0, 2)?.toUpperCase()
                                        : "?"}
                                </div>
                                <span className="text-[12px] text-slate-300 font-medium">
                                    {typeof task.assignee === "object"
                                        ? task.assignee.name
                                        : "Unknown"}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-800/60 bg-slate-950/40 sticky bottom-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg text-[13px] font-semibold text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] transition-all duration-150"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={!title.trim() || !hasChanges || isUpdating}
                        className="px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[13px] font-semibold shadow-lg shadow-purple-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isUpdating ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    );
}

import { useState } from "react";
import { useCreateTask } from "../../hooks/useTasks.js";
import { useWorkspaceMembers } from "../../hooks/useWorkspaces.js";

/**
 * CreateTaskModal
 *
 * Full task creation form with title, description, priority, labels, due date, and assignee.
 * Uses useMutation → invalidates task cache → closes.
 *
 * Props:
 *   isOpen: boolean
 *   onClose: function
 *   boardId: string
 *   workspaceId: string
 *   defaultStatus: string ("todo", "in-progress", "completed")
 */
export default function CreateTaskModal({ isOpen, onClose, boardId, workspaceId, defaultStatus = "todo" }) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState("medium");
    const [dueDate, setDueDate] = useState("");
    const [labelInput, setLabelInput] = useState("");
    const [labels, setLabels] = useState([]);
    const [assignee, setAssignee] = useState("");

    const { data: membersResponse } = useWorkspaceMembers(workspaceId);
    const members = membersResponse?.data || [];

    const { mutate: createTask, isPending } = useCreateTask();

    if (!isOpen) return null;

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

    const resetForm = () => {
        setTitle("");
        setDescription("");
        setPriority("medium");
        setDueDate("");
        setLabelInput("");
        setLabels([]);
        setAssignee("");
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!title.trim() || !boardId) return;

        createTask(
            {
                boardId,
                title: title.trim(),
                description: description.trim(),
                priority,
                status: defaultStatus,
                dueDate: dueDate || undefined,
                labels: labels.length > 0 ? labels : undefined,
                assignee: assignee || undefined,
            },
            {
                onSuccess: () => {
                    resetForm();
                    onClose();
                },
            }
        );
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) onClose();
    };

    const priorityOptions = [
        { value: "low", label: "Low", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
        { value: "medium", label: "Medium", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
        { value: "high", label: "High", color: "text-red-400 bg-red-500/10 border-red-500/20" },
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
            <div className="w-full max-w-lg mx-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/60 sticky top-0 bg-slate-900 z-10">
                    <h2 className="text-[15px] font-bold text-white">Create Task</h2>
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
                    {/* Title */}
                    <div className="space-y-1.5">
                        <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">
                            Task Title *
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Implement user authentication"
                            maxLength={100}
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-[13px] font-medium placeholder:text-slate-600 focus:outline-none focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/20 transition-all duration-200"
                            autoFocus
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
                            placeholder="Add more details about this task..."
                            maxLength={500}
                            rows={3}
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-[13px] font-medium placeholder:text-slate-600 focus:outline-none focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/20 transition-all duration-200 resize-none"
                        />
                    </div>

                    {/* Assignee */}
                    <div className="space-y-1.5">
                        <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">
                            Assignee
                        </label>
                        <select
                            value={assignee}
                            onChange={(e) => setAssignee(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-[13px] font-medium focus:outline-none focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/20 transition-all duration-200 [color-scheme:dark]"
                        >
                            <option value="">Unassigned</option>
                            {members.map((member) => (
                                <option key={member.user._id} value={member.user._id}>
                                    {member.user.name} ({member.user.email})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Priority + Due Date row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">
                                Priority
                            </label>
                            <div className="flex gap-2">
                                {priorityOptions.map((opt) => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => setPriority(opt.value)}
                                        className={`flex-1 px-2 py-2 rounded-lg text-[11px] font-bold border transition-all duration-150 ${
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

                        <div className="space-y-1.5">
                            <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">
                                Due Date
                            </label>
                            <input
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-[13px] font-medium focus:outline-none focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/20 transition-all duration-200 [color-scheme:dark]"
                            />
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
                            disabled={!title.trim() || isPending}
                            className="px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[13px] font-semibold shadow-lg shadow-purple-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isPending ? "Creating..." : "Create Task"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

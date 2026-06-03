import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import useWorkspaceStore from "../store/workspace.store.js";
import { useWorkspace } from "../hooks/useWorkspaces.js";
import { useFilteredTasks } from "../hooks/useTasks.js";
import { useRealtimeTasks } from "../realtime/useRealtimeTasks.js";
import { useWorkspaceSocket } from "../realtime/useWorkspaceSocket.js";

/*
|--------------------------------------------------------------------------
| TASKS PAGE — Filtered & Paginated Task View
|--------------------------------------------------------------------------
|
| Route: /workspaces/:workspaceId/tasks
|
| Features:
| - Search by title
| - Filter by priority (all / low / medium / high)
| - Filter by status (all / todo / in-progress / completed)
| - Sort by (createdAt / dueDate / priority)
| - Pagination controls
|
*/

export default function TasksPage() {
    const { workspaceId } = useParams();
    const { setCurrentWorkspace } = useWorkspaceStore();

    useWorkspaceSocket(workspaceId);
    useRealtimeTasks(workspaceId);

    // Sync workspace selection
    useEffect(() => {
        if (workspaceId) setCurrentWorkspace(workspaceId);
    }, [workspaceId, setCurrentWorkspace]);

    // Filter state
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [priority, setPriority] = useState("");
    const [sortBy, setSortBy] = useState("createdAt");
    const [order, setOrder] = useState("desc");
    const [page, setPage] = useState(1);
    const limit = 12;

    // Debounce search input (300ms)
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1); // Reset to first page on new search
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    const [prevFilters, setPrevFilters] = useState("");
    const currentFilters = `${priority}-${sortBy}-${order}`;
    
    if (currentFilters !== prevFilters) {
        setPrevFilters(currentFilters);
        setPage(1);
    }

    const { data: workspaceResponse } = useWorkspace(workspaceId);
    const workspace = workspaceResponse?.data;

    // Build query params — only include non-empty filters
    const filters = {
        page,
        limit,
        sortBy,
        order,
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(priority && { priority }),
    };

    const { data: tasksResponse, isLoading, isFetching } = useFilteredTasks(workspaceId, filters);

    const tasks = tasksResponse?.data?.tasks || [];
    const pagination = tasksResponse?.data?.pagination || { page: 1, totalPages: 1, total: 0 };

    const priorityOptions = [
        { value: "", label: "All" },
        { value: "low", label: "Low", color: "text-blue-400" },
        { value: "medium", label: "Medium", color: "text-amber-400" },
        { value: "high", label: "High", color: "text-red-400" },
    ];

    const sortOptions = [
        { value: "createdAt", label: "Created" },
        { value: "dueDate", label: "Due Date" },
        { value: "priority", label: "Priority" },
    ];

    const priorityConfig = {
        high: { icon: "↑", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
        medium: { icon: "—", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
        low: { icon: "↓", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    };

    const statusConfig = {
        "todo": { label: "To Do", dot: "bg-slate-400" },
        "in-progress": { label: "In Progress", dot: "bg-amber-400" },
        "completed": { label: "Completed", dot: "bg-emerald-400" },
    };

    const formatDueDate = (dateStr) => {
        if (!dateStr) return null;
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = date - now;
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return { text: `${Math.abs(diffDays)}d overdue`, overdue: true };
        if (diffDays === 0) return { text: "Due today", overdue: false };
        if (diffDays === 1) return { text: "Tomorrow", overdue: false };
        if (diffDays < 7) return { text: `${diffDays}d left`, overdue: false };
        return { text: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }), overdue: false };
    };

    return (
        <div className="space-y-6 text-left">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/40">
                <div>
                    <h1 className="text-2xl font-extrabold text-white tracking-tight">
                        Tasks
                    </h1>
                    <p className="text-[13px] text-slate-400 mt-1">
                        All tasks in <span className="text-slate-300 font-semibold">{workspace?.name || "..."}</span>
                        {pagination.total > 0 && (
                            <span className="text-slate-500"> · {pagination.total} total</span>
                        )}
                    </p>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-wrap items-center gap-3">
                {/* Search */}
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search tasks..."
                        className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/[0.03] border border-slate-800/60 text-slate-200 text-[13px] font-medium placeholder:text-slate-600 focus:outline-none focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/20 transition-all duration-200"
                    />
                    {search && (
                        <button
                            onClick={() => setSearch("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>

                {/* Priority filter pills */}
                <div className="flex items-center gap-1.5 bg-white/[0.02] rounded-xl border border-slate-800/60 p-1">
                    {priorityOptions.map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => setPriority(opt.value)}
                            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all duration-150 ${
                                priority === opt.value
                                    ? "bg-white/[0.08] text-white shadow-sm"
                                    : `${opt.color || "text-slate-500"} hover:bg-white/[0.04]`
                            }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>

                {/* Sort */}
                <div className="flex items-center gap-1.5">
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-3 py-2 rounded-xl bg-white/[0.03] border border-slate-800/60 text-slate-300 text-[12px] font-semibold focus:outline-none focus:border-purple-500/40 transition-all duration-200 appearance-none cursor-pointer [color-scheme:dark]"
                    >
                        {sortOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>

                    <button
                        onClick={() => setOrder(order === "desc" ? "asc" : "desc")}
                        className="p-2 rounded-xl bg-white/[0.03] border border-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] transition-all duration-150"
                        title={order === "desc" ? "Newest first" : "Oldest first"}
                    >
                        <svg className={`w-4 h-4 transition-transform duration-200 ${order === "asc" ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                </div>

                {/* Loading indicator */}
                {isFetching && !isLoading && (
                    <div className="w-4 h-4 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                )}
            </div>

            {/* Tasks List */}
            {isLoading ? (
                <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-20 rounded-2xl bg-white/[0.02] border border-slate-800/60 animate-pulse" />
                    ))}
                </div>
            ) : tasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4 rounded-2xl bg-white/[0.01] border border-dashed border-slate-800/60">
                    <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4">
                        <svg className="w-7 h-7 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h4 className="text-[15px] font-bold text-white mb-1">No tasks found</h4>
                    <p className="text-[12px] text-slate-500 text-center max-w-xs">
                        {debouncedSearch || priority
                            ? "Try adjusting your search or filters."
                            : "Create tasks from a board to see them here."}
                    </p>
                </div>
            ) : (
                <div className="space-y-2">
                    {tasks.map((task) => {
                        const pConfig = priorityConfig[task.priority] || priorityConfig.medium;
                        const sConfig = statusConfig[task.status] || statusConfig.todo;
                        const due = formatDueDate(task.dueDate);

                        return (
                            <Link
                                key={task._id}
                                to={task.board?._id ? `/workspaces/${workspaceId}/boards/${task.board._id || task.board}` : "#"}
                                className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-slate-800/60 hover:border-slate-700/60 hover:bg-white/[0.04] transition-all duration-200 group"
                            >
                                {/* Status dot */}
                                <div className={`w-2.5 h-2.5 rounded-full ${sConfig.dot} shrink-0`} />

                                {/* Task info */}
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-[14px] font-semibold text-slate-200 truncate group-hover:text-white transition-colors">
                                        {task.title}
                                    </h4>
                                    <div className="flex items-center gap-3 mt-1">
                                        {/* Board name */}
                                        {task.board?.name && (
                                            <span className="text-[10px] font-medium text-slate-500 truncate">
                                                {task.board.name}
                                            </span>
                                        )}
                                        {/* Status */}
                                        <span className="text-[10px] font-semibold text-slate-500">
                                            {sConfig.label}
                                        </span>
                                    </div>
                                </div>

                                {/* Labels */}
                                {task.labels?.length > 0 && (
                                    <div className="hidden md:flex items-center gap-1">
                                        {task.labels.slice(0, 2).map((label, i) => (
                                            <span key={i} className="px-1.5 py-0.5 rounded text-[9px] font-bold text-slate-400 bg-white/[0.04] border border-slate-800">
                                                {label}
                                            </span>
                                        ))}
                                        {task.labels.length > 2 && (
                                            <span className="text-[10px] text-slate-600">+{task.labels.length - 2}</span>
                                        )}
                                    </div>
                                )}

                                {/* Priority */}
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${pConfig.bg} ${pConfig.color} border ${pConfig.border} shrink-0`}>
                                    {pConfig.icon} {task.priority}
                                </span>

                                {/* Due date */}
                                {due && (
                                    <span className={`text-[10px] font-semibold shrink-0 ${due.overdue ? "text-red-400" : "text-slate-500"}`}>
                                        {due.text}
                                    </span>
                                )}

                                {/* Assignee */}
                                {task.assignee && typeof task.assignee === "object" && (
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-[8px] font-bold text-white shrink-0" title={task.assignee.name}>
                                        {task.assignee.name?.slice(0, 2)?.toUpperCase()}
                                    </div>
                                )}

                                {/* Arrow */}
                                <svg className="w-4 h-4 text-slate-600 opacity-0 group-hover:opacity-100 transition-all duration-200 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        );
                    })}
                </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-slate-800/40">
                    <p className="text-[12px] text-slate-500 font-medium">
                        Showing {(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                    </p>

                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={() => setPage(page - 1)}
                            disabled={page <= 1}
                            className="px-3 py-1.5 rounded-lg text-[12px] font-semibold text-slate-400 hover:text-white bg-white/[0.03] border border-slate-800/60 hover:bg-white/[0.06] transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            ← Prev
                        </button>

                        {/* Page numbers */}
                        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                            .filter((p) => {
                                // Show first, last, and pages near current
                                return p === 1 || p === pagination.totalPages || Math.abs(p - page) <= 1;
                            })
                            .reduce((acc, p, idx, arr) => {
                                // Insert "..." between gaps
                                if (idx > 0 && p - arr[idx - 1] > 1) {
                                    acc.push("...");
                                }
                                acc.push(p);
                                return acc;
                            }, [])
                            .map((p, idx) =>
                                p === "..." ? (
                                    <span key={`dots-${idx}`} className="px-1.5 text-[12px] text-slate-600">…</span>
                                ) : (
                                    <button
                                        key={p}
                                        onClick={() => setPage(p)}
                                        className={`w-8 h-8 rounded-lg text-[12px] font-bold transition-all duration-150 ${
                                            page === p
                                                ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20"
                                                : "text-slate-400 hover:text-white bg-white/[0.03] border border-slate-800/60 hover:bg-white/[0.06]"
                                        }`}
                                    >
                                        {p}
                                    </button>
                                )
                            )}

                        <button
                            onClick={() => setPage(page + 1)}
                            disabled={page >= pagination.totalPages}
                            className="px-3 py-1.5 rounded-lg text-[12px] font-semibold text-slate-400 hover:text-white bg-white/[0.03] border border-slate-800/60 hover:bg-white/[0.06] transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Next →
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

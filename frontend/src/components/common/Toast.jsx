import useToastStore from "../../store/toast.store.js";

export default function ToastContainer() {
    const toasts = useToastStore((state) => state.toasts);
    const removeToast = useToastStore((state) => state.removeToast);

    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3.5 max-w-sm w-full pointer-events-none">
            {toasts.map((t) => (
                <div
                    key={t.id}
                    className={`pointer-events-auto flex items-start justify-between p-4 rounded-xl shadow-2xl backdrop-blur-lg border animate-slide-in transition-all duration-300 ${
                        t.type === "success"
                            ? "bg-emerald-950/80 border-emerald-500/20 text-emerald-100 shadow-emerald-500/5"
                            : t.type === "error"
                            ? "bg-rose-950/80 border-rose-500/20 text-rose-100 shadow-rose-500/5"
                            : t.type === "warning"
                            ? "bg-amber-950/80 border-amber-500/20 text-amber-100 shadow-amber-500/5"
                            : "bg-slate-900/90 border-slate-800 text-slate-100 shadow-slate-500/5"
                    }`}
                >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                        {t.type === "success" && (
                            <div className="p-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        )}
                        {t.type === "error" && (
                            <div className="p-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 shrink-0">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                        )}
                        {t.type === "warning" && (
                            <div className="p-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                        )}
                        {t.type === "info" && (
                            <div className="p-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 shrink-0">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        )}
                        <p className="text-[13px] font-medium leading-relaxed break-words pt-0.5">
                            {t.message}
                        </p>
                    </div>
                    <button
                        onClick={() => removeToast(t.id)}
                        className="text-slate-400 hover:text-slate-200 transition ml-3 shrink-0 p-0.5 rounded-lg hover:bg-white/[0.04]"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            ))}
        </div>
    );
}

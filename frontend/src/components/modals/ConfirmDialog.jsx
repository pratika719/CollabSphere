import { useEffect, useRef } from "react";

/*
|--------------------------------------------------------------------------
| CONFIRM DIALOG
|--------------------------------------------------------------------------
|
| Reusable destructive-action confirmation modal.
| Follows the same visual language as other modals in the app.
|
| Props:
|   isOpen: boolean
|   onClose: () => void
|   onConfirm: () => void
|   title: string
|   message: string
|   confirmLabel?: string    (default: "Confirm")
|   confirmVariant?: "danger" | "warning"  (default: "danger")
|   isPending?: boolean
|
*/

export default function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmLabel = "Confirm",
    confirmVariant = "danger",
    isPending = false,
}) {
    const cancelRef = useRef(null);

    // Close on Escape key
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    // Focus cancel button on open for accessibility
    useEffect(() => {
        if (isOpen) cancelRef.current?.focus();
    }, [isOpen]);

    if (!isOpen) return null;

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) onClose();
    };

    const variantClasses = {
        danger: "bg-red-600 hover:bg-red-500 shadow-red-500/20",
        warning: "bg-amber-600 hover:bg-amber-500 shadow-amber-500/20",
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={handleBackdropClick}
        >
            <div className="w-full max-w-sm mx-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                {/* Icon + Content */}
                <div className="p-6 space-y-3">
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0 mt-0.5">
                            <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-[15px] font-bold text-white">{title}</h3>
                            <p className="text-[13px] text-slate-400 mt-1 leading-relaxed">{message}</p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-800/60 bg-slate-950/40">
                    <button
                        ref={cancelRef}
                        type="button"
                        onClick={onClose}
                        disabled={isPending}
                        className="px-4 py-2 rounded-lg text-[13px] font-semibold text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] transition-all duration-150"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isPending}
                        className={`px-5 py-2 rounded-lg text-white text-[13px] font-semibold shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[confirmVariant]}`}
                    >
                        {isPending ? "Processing..." : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}

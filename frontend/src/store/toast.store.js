import { create } from "zustand";

const useToastStore = create((set) => ({
    toasts: [],
    addToast: (message, type = "info", duration = 4000) => {
        const id = Math.random().toString(36).substring(2, 9);
        set((state) => ({
            toasts: [...state.toasts, { id, message, type, duration }],
        }));
        
        setTimeout(() => {
            set((state) => ({
                toasts: state.toasts.filter((t) => t.id !== id),
            }));
        }, duration);
    },
    removeToast: (id) => {
        set((state) => ({
            toasts: state.toasts.filter((t) => t.id !== id),
        }));
    },
}));

export const toast = {
    success: (message, duration) => useToastStore.getState().addToast(message, "success", duration),
    error: (message, duration) => useToastStore.getState().addToast(message, "error", duration),
    info: (message, duration) => useToastStore.getState().addToast(message, "info", duration),
    warning: (message, duration) => useToastStore.getState().addToast(message, "warning", duration),
};

export default useToastStore;

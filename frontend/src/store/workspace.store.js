import { create } from "zustand";

/**
 * Workspace UI state store
 *
 * WHY Zustand (not React Query)?
 * The currently selected workspace is frontend-controlled UI state.
 * The workspace LIST belongs in React Query because the backend owns it.
 * This is professional state separation.
 */
const useWorkspaceStore = create((set) => ({
    currentWorkspaceId: localStorage.getItem("currentWorkspaceId") || null,

    setCurrentWorkspace: (workspaceId) => {
        localStorage.setItem("currentWorkspaceId", workspaceId);
        set({ currentWorkspaceId: workspaceId });
    },

    clearCurrentWorkspace: () => {
        localStorage.removeItem("currentWorkspaceId");
        set({ currentWorkspaceId: null });
    },
}));

export default useWorkspaceStore;

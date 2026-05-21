import { create } from "zustand";
import { getCurrentUser } from "../services/auth.api.js";
import { appEvents } from "../utils/eventEmitter.js";

const initialState = {
    user: null,
    isAuthenticated: false,
    isAuthLoading: true,
};

const useAuthStore = create((set) => ({
    ...initialState,

    setUser: (user) =>
        set({
            user,
            isAuthenticated: !!user,
            isAuthLoading: false,
        }),

    clearUser: () =>
        set({
            user: null,
            isAuthenticated: false,
            isAuthLoading: false,
        }),

    setAuthLoading: (loading) =>
        set({
            isAuthLoading: loading,
        }),

    resetAuthStore: () => set(initialState),

    checkAuth: async () => {
        set({ isAuthLoading: true });
        try {
            const response = await getCurrentUser();
            // Since API returns ApiResponse with { data: user }, response.data is the user object
            const user = response?.data;
            if (user) {
                set({ user, isAuthenticated: true, isAuthLoading: false });
            } else {
                set({ user: null, isAuthenticated: false, isAuthLoading: false });
            }
        } catch (error) {
            // Silence 401 warnings on boot since they are expected if the user isn't logged in
            if (error.response?.status !== 401) {
                console.error("Session restoration check failed:", error);
            }
            set({ user: null, isAuthenticated: false, isAuthLoading: false });
        }
    },
}));

appEvents.on("auth:clear", () => {
    useAuthStore.getState().clearUser();
});

export default useAuthStore;


import { create } from "zustand";


const initialState = {
    user: null,

    isAuthenticated: false,

    isAuthLoading: true,
};


const useAuthStore = create(
    (set) => ({


        ...initialState,


        setUser: (user) =>
            set({
                user,

                isAuthenticated:
                    !!user,
            }),



        clearUser: () =>
            set({
                user: null,

                isAuthenticated: false,
            }),



        setAuthLoading: (
            loading
        ) =>
            set({
                isAuthLoading:
                    loading,
            }),



        resetAuthStore: () =>
            set(initialState),
    })
);

export default useAuthStore;


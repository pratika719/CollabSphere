import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import {
    loginUser,
} from "../services/auth.api.js";

import useAuthStore from "../store/auth.store.js";

const useLogin = () => {
    const navigate = useNavigate();
    const { setUser } = useAuthStore();

    const mutation = useMutation({
        mutationFn: loginUser,

        onSuccess: (response) => {
            const user = response?.data?.data?.user;

            if (user) {
                setUser(user);
            }

            navigate("/dashboard");
        },

        onError: (error) => {
            console.error(
                error?.response?.data?.message || "Login failed"
            );
        },
    });

    return {
        /*
        |--------------------------------------------------------------------------
        | ACTIONS
        |--------------------------------------------------------------------------
        */

        login: mutation.mutate,

        loginAsync: mutation.mutateAsync,

        /*
        |--------------------------------------------------------------------------
        | STATES
        |--------------------------------------------------------------------------
        */

        isPending: mutation.isPending,

        isSuccess: mutation.isSuccess,

        isError: mutation.isError,

        error: mutation.error,

        data: mutation.data,
    };
};

export default useLogin;
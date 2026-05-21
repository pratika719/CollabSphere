import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../services/auth.api.js";
import useAuthStore from "../store/auth.store.js";

export default function useLogout() {
    const navigate = useNavigate();
    const { clearUser } = useAuthStore();

    const mutation = useMutation({
        mutationFn: logoutUser,
        onSuccess: () => {
            clearUser();
            navigate("/login");
        },
        onError: (error) => {
            console.error("Logout request failed, cleaning local session:", error);
            clearUser();
            navigate("/login");
        },
    });

    return {
        logout: mutation.mutate,
        isPending: mutation.isPending,
    };
}

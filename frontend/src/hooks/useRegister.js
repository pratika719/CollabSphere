import { useMutation } from "react-query";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/auth.api.js";
import useAuthStore from "../../store/auth.store";
export default function useRegister() {
    const navigate = useNavigate();

    const { setUser, } = useAuthStore()

    const mutation = useMutation({
        mutationFn: registerUser,
        onSuccess: (response) => {

            const user =
                response?.data?.user;


            setUser(user);
            navigate("/dashboard");
        },
        onError: (error) => {
            console.error(
                error?.response?.data
                    ?.message ||
                "Registration failed"
            )
        },
    });

    return {
        register: mutation.mutate,
        registerAsync: mutation.mutateAsync,
        isPending: mutation.isPending,
        isSuccess: mutation.isSuccess,
        isError: mutation.isError,
        error: mutation.error,
        data: mutation.data,
    };
}



import axios from "../api/axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true

headers: {
        "Content-Type": "application/json",

    },

    timeout: 10000,





});

api.interceptors.request.use(
    async (config) => {
        return config;
    },

    (error) => {
        return Promise.reject(
            error
        );
    }
);



api.interceptors.response.use(
    (response) => {
        return response;
    },

    async (error) => {
        /*
        |--------------------------------------------------------------------------
        | Unauthorized
        |--------------------------------------------------------------------------
        */

        if (
            error.response?.status ===
            401
        ) {
            console.error(
                "Unauthorized request"
            );

            /*
            |--------------------------------------------------------------------------
            | Future:
            | Refresh token logic
            |--------------------------------------------------------------------------
            */
        }

        /*
        |--------------------------------------------------------------------------
        | Forbidden
        |--------------------------------------------------------------------------
        */

        if (
            error.response?.status ===
            403
        ) {
            console.error(
                "Access denied"
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Server Error
        |--------------------------------------------------------------------------
        */

        if (
            error.response?.status >=
            500
        ) {
            console.error(
                "Server error"
            );
        }

        return Promise.reject(
            error
        );
    }
);

export default api;




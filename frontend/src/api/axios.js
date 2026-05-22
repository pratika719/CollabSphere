import axios from "axios";
import { appEvents } from "../utils/eventEmitter.js";

const api = axios.create({
    baseURL: "/api/v1",
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 10000,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

api.interceptors.request.use(
    async (config) => {
        //config is req object
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // If the error is 401 Unauthorized and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            // Prevent looping retries on the refresh token endpoint itself
            if (originalRequest.url === "/auth/refresh") {
                return Promise.reject(error);
            }

            if (isRefreshing) {
                return new Promise(function (resolve, reject) {
                    failedQueue.push({ resolve, reject });
                })
                    .then(() => {
                        return api(originalRequest);
                    })
                    .catch((err) => {
                        return Promise.reject(err);
                    });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Call backend refresh route. Cookies will be sent automatically.
                await api.post("/auth/refresh");
                isRefreshing = false;
                processQueue(null);
                return api(originalRequest);
            } catch (refreshError) {
                isRefreshing = false;
                processQueue(refreshError, null);

                // Clear user store and session on refresh failure
                try {
                    appEvents.emit("auth:clear");
                } catch (e) {
                    console.error("Failed to clear auth state on session expiration:", e);
                }

                return Promise.reject(refreshError);
            }
        }

        if (error.response?.status === 403) {
            console.error("Access denied");
        }

        if (error.response?.status >= 500) {
            console.error("Server error");
        }

        return Promise.reject(error);
    }
);

export default api;



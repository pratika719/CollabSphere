import axios from "axios";
import { appEvents } from "../utils/eventEmitter.js";
import { toast } from "../store/toast.store.js";

const isTransientError = (error) => {
    if (!error.response) {
        return error.code !== "ERR_CANCELED";
    }
    const status = error.response.status;
    return status === 502 || status === 503 || status === 504;
};

const shouldSkipToast = (config) => {
    if (!config) return true;
    if (config._skipToast) return true;

    const url = config.url || "";
    if (url.includes("/auth/me") && config.method?.toLowerCase() === "get") return true;
    if (url.includes("/auth/refresh")) return true;
    if (url.includes("/auth/login")) return true;
    if (url.includes("/auth/register")) return true;

    return false;
};

const api = axios.create({
    baseURL: "/api/v1",
    withCredentials: true,
    // NOTE: Do NOT set a global Content-Type header here.
    // For JSON requests the interceptor below adds it automatically.
    // For FormData (file uploads), Axios must auto-generate the header
    // with the correct multipart boundary string.
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
        // Auto-set Content-Type for non-FormData requests
        // FormData requests MUST NOT have a manual Content-Type —
        // Axios needs to auto-generate it with the multipart boundary.
        if (!(config.data instanceof FormData)) {
            config.headers["Content-Type"] = "application/json";
        }

        // Give file uploads more time (30 seconds instead of default 10)
        if (config.data instanceof FormData) {
            config.timeout = 30000;
        }

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

        // --- RETRY LOGIC FOR TRANSIENT ERRORS ---
        if (originalRequest && isTransientError(error)) {
            originalRequest._retryCount = originalRequest._retryCount || 0;

            if (originalRequest._retryCount < 3) {
                originalRequest._retryCount += 1;
                const backoffDelay = originalRequest._retryCount * 1000;

                console.warn(`[Axios Retry] Retrying request ${originalRequest.url} (Attempt ${originalRequest._retryCount}/3) in ${backoffDelay}ms`);

                await new Promise((resolve) => setTimeout(resolve, backoffDelay));
                return api(originalRequest);
            }
        }

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

        // --- TRIGGER GLOBAL ERROR TOAST ---
        if (!shouldSkipToast(originalRequest) && error.code !== "ERR_CANCELED") {
            const serverMessage = error.response?.data?.message;
            const fallbackMessage = error.message || "An unexpected error occurred";
            toast.error(serverMessage || fallbackMessage);
        }

        return Promise.reject(error);
    }
);

export default api;



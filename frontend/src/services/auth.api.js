import api from "../api/axios.js";

/**
 * Register a new user
 * @param {Object} userData - Contains name, email, password
 */
export const registerUser = async (userData) => {
    const response = await api.post("/auth/register", userData);
    return response.data;
};

/**
 * Login a user
 * @param {Object} credentials - Contains email, password
 */
export const loginUser = async (credentials) => {
    const response = await api.post("/auth/login", credentials);
    return response.data;
};

/**
 * Logout the current user session
 */
export const logoutUser = async () => {
    const response = await api.post("/auth/logout");
    return response.data;
};

/**
 * Fetch current user profile
 */
export const getCurrentUser = async () => {
    const response = await api.get("/auth/me");
    return response.data;
};

/**
 * Trigger manual token refresh
 */
export const refreshAccessToken = async () => {
    const response = await api.post("/auth/refresh");
    return response.data;
};

/**
 * Change current user password
 * @param {Object} passwordData - Contains oldPassword, newPassword
 */
export const changePassword = async (passwordData) => {
    const response = await api.put("/auth/change-password", passwordData);
    return response.data;
};
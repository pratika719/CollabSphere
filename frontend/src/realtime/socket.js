import { io } from "socket.io-client";

let socket = null;

export const connectSocket = () => {
    if (socket?.connected || socket?.active) {
        return socket;
    }

    socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:3000", {
        withCredentials: true,
        autoConnect: true,
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
    });

    return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
    if (!socket) return;

    socket.disconnect();
    socket = null;
};

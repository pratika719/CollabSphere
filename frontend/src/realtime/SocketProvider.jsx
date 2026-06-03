import { useEffect, useMemo, useState } from "react";
import useAuthStore from "../store/auth.store.js";
import { SocketContext } from "./socket.context.js";
import { connectSocket, disconnectSocket } from "./socket.js";
import { SOCKET_EVENTS } from "./socket.events.js";
import { toast } from "../store/toast.store.js";

export default function SocketProvider({ children }) {
    const { isAuthenticated, isAuthLoading, user } = useAuthStore();
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (isAuthLoading) return;

        if (!isAuthenticated || !user) {
            disconnectSocket();
            queueMicrotask(() => {
                setSocket(null);
                setIsConnected(false);
            });
            return;
        }

        const activeSocket = connectSocket();

        const handleConnect = () => setIsConnected(true);
        const handleDisconnect = (reason) => {
            setIsConnected(false);
            if (reason === "io server disconnect") {
                toast.error("Disconnected from real-time server.");
            } else {
                toast.warning("Lost connection. Reconnecting...");
            }
        };
        const handleConnectError = (error) => {
            setIsConnected(false);
            console.error("Socket connection failed:", error.message);
        };
        const handleReconnect = () => {
            setIsConnected(true);
            toast.success("Connection restored!");
        };
        const handleReconnectFailed = () => {
            toast.error("Real-time connection failed permanently. Please reload.");
        };
        const handleGlobalSocketError = (payload) => {
            toast.error(payload?.message || "A real-time synchronization error occurred.");
        };

        activeSocket.on(SOCKET_EVENTS.CONNECT, handleConnect);
        activeSocket.on(SOCKET_EVENTS.DISCONNECT, handleDisconnect);
        activeSocket.on(SOCKET_EVENTS.CONNECT_ERROR, handleConnectError);
        activeSocket.on("reconnect", handleReconnect);
        activeSocket.on("reconnect_failed", handleReconnectFailed);
        activeSocket.on("socket:error", handleGlobalSocketError);

        queueMicrotask(() => {
            setSocket(activeSocket);
            setIsConnected(activeSocket.connected);
        });

        return () => {
            activeSocket.off(SOCKET_EVENTS.CONNECT, handleConnect);
            activeSocket.off(SOCKET_EVENTS.DISCONNECT, handleDisconnect);
            activeSocket.off(SOCKET_EVENTS.CONNECT_ERROR, handleConnectError);
            activeSocket.off("reconnect", handleReconnect);
            activeSocket.off("reconnect_failed", handleReconnectFailed);
            activeSocket.off("socket:error", handleGlobalSocketError);
        };
    }, [isAuthenticated, isAuthLoading, user]);

    const value = useMemo(
        () => ({
            socket,
            isConnected,
        }),
        [socket, isConnected]
    );

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
}

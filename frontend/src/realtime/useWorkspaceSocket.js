import { useEffect } from "react";
import { useSocket } from "./socket.context.js";
import { SOCKET_EVENTS } from "./socket.events.js";

export const useWorkspaceSocket = (workspaceId) => {
    const { socket, isConnected } = useSocket() || {};

    useEffect(() => {
        if (!socket || !isConnected || !workspaceId) {
            return;
        }

        const handleWorkspaceError = (payload) => {
            if (payload?.workspaceId !== workspaceId) return;
            console.error("Workspace socket error:", payload.message);
        };

        socket.on(SOCKET_EVENTS.WORKSPACE_ERROR, handleWorkspaceError);
        socket.emit(SOCKET_EVENTS.WORKSPACE_JOIN, { workspaceId });

        return () => {
            socket.emit(SOCKET_EVENTS.WORKSPACE_LEAVE, { workspaceId });
            socket.off(SOCKET_EVENTS.WORKSPACE_ERROR, handleWorkspaceError);
        };
    }, [socket, isConnected, workspaceId]);
};

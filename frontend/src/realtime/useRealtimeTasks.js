import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSocket } from "./socket.context.js";
import { SOCKET_EVENTS } from "./socket.events.js";

export const useRealtimeTasks = (workspaceId) => {
    const queryClient = useQueryClient();
    const { socket, isConnected } = useSocket() || {};

    useEffect(() => {
        if (!socket || !isConnected || !workspaceId) {
            return;
        }

        const refreshWorkspaceTasks = (payload) => {
            if (payload?.workspaceId !== workspaceId) return;

            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            queryClient.invalidateQueries({ queryKey: ["filtered-tasks"] });
            queryClient.invalidateQueries({ queryKey: ["boards", workspaceId] });
            queryClient.invalidateQueries({ queryKey: ["workspace", workspaceId] });
        };

        socket.on(SOCKET_EVENTS.TASK_CREATED, refreshWorkspaceTasks);
        socket.on(SOCKET_EVENTS.TASK_UPDATED, refreshWorkspaceTasks);
        socket.on(SOCKET_EVENTS.TASK_MOVED, refreshWorkspaceTasks);
        socket.on(SOCKET_EVENTS.TASK_REORDERED, refreshWorkspaceTasks);
        socket.on(SOCKET_EVENTS.TASK_ARCHIVED, refreshWorkspaceTasks);

        return () => {
            socket.off(SOCKET_EVENTS.TASK_CREATED, refreshWorkspaceTasks);
            socket.off(SOCKET_EVENTS.TASK_UPDATED, refreshWorkspaceTasks);
            socket.off(SOCKET_EVENTS.TASK_MOVED, refreshWorkspaceTasks);
            socket.off(SOCKET_EVENTS.TASK_REORDERED, refreshWorkspaceTasks);
            socket.off(SOCKET_EVENTS.TASK_ARCHIVED, refreshWorkspaceTasks);
        };
    }, [socket, isConnected, workspaceId, queryClient]);
};

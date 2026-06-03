import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    getNotifications,
    markAllNotificationsRead,
    markNotificationRead,
} from "../services/notification.api.js";
import { useSocket } from "../realtime/socket.context.js";
import { SOCKET_EVENTS } from "../realtime/socket.events.js";

export function useNotifications(options = {}) {
    return useQuery({
        queryKey: ["notifications", options],
        queryFn: () => getNotifications(options),
    });
}

export function useNotificationSocket() {
    const queryClient = useQueryClient();
    const { socket, isConnected } = useSocket() || {};

    useEffect(() => {
        if (!socket || !isConnected) return;

        const handleNewNotification = () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
        };

        socket.on(SOCKET_EVENTS.NOTIFICATION_NEW, handleNewNotification);

        return () => {
            socket.off(SOCKET_EVENTS.NOTIFICATION_NEW, handleNewNotification);
        };
    }, [socket, isConnected, queryClient]);
}

export function useMarkNotificationRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: markNotificationRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
        },
    });
}

export function useMarkAllNotificationsRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: markAllNotificationsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
        },
    });
}

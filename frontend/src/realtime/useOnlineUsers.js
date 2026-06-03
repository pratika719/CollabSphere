import { useEffect, useMemo, useState } from "react";
import { useSocket } from "./socket.context.js";
import { SOCKET_EVENTS } from "./socket.events.js";

export const useOnlineUsers = (workspaceId) => {
    const { socket, isConnected } = useSocket() || {};
    const [onlineUsers, setOnlineUsers] = useState([]);

    const canReceivePresence = !!socket && isConnected && !!workspaceId;

    useEffect(() => {
        if (!canReceivePresence) return;

        const handleOnlineUsers = (payload) => {
            if (payload?.workspaceId !== workspaceId) return;
            setOnlineUsers(payload.users || []);
        };

        socket.on(SOCKET_EVENTS.PRESENCE_ONLINE_USERS, handleOnlineUsers);

        return () => {
            socket.off(SOCKET_EVENTS.PRESENCE_ONLINE_USERS, handleOnlineUsers);
        };
    }, [socket, canReceivePresence, workspaceId]);

    const visibleOnlineUsers = useMemo(
        () => (canReceivePresence ? onlineUsers : []),
        [canReceivePresence, onlineUsers]
    );

    const onlineUserIds = useMemo(
        () => new Set(visibleOnlineUsers.map((user) => user._id?.toString())),
        [visibleOnlineUsers]
    );

    return {
        onlineUsers: visibleOnlineUsers,
        onlineUserIds,
    };
};

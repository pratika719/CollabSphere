const userSockets = new Map();
const workspacePresence = new Map();
const socketWorkspaces = new Map();

const toId = (value) => value.toString();

export const addUserSocket = (userId, socketId) => {
    userId = toId(userId);

    if (!userSockets.has(userId)) {
        userSockets.set(userId, new Set());
    }

    userSockets.get(userId).add(socketId);
};

export const removeUserSocket = (userId, socketId) => {
    userId = toId(userId);

    const sockets = userSockets.get(userId);
    if (!sockets) return;

    sockets.delete(socketId);

    if (sockets.size === 0) {
        userSockets.delete(userId);
    }
};

export const addWorkspacePresence = ({ workspaceId, user, socketId }) => {
    workspaceId = toId(workspaceId);
    const userId = toId(user._id);

    if (!workspacePresence.has(workspaceId)) {
        workspacePresence.set(workspaceId, new Map());
    }

    const workspaceUsers = workspacePresence.get(workspaceId);

    if (!workspaceUsers.has(userId)) {
        workspaceUsers.set(userId, {
            user,
            socketIds: new Set(),
        });
    }

    workspaceUsers.get(userId).socketIds.add(socketId);

    if (!socketWorkspaces.has(socketId)) {
        socketWorkspaces.set(socketId, new Set());
    }

    socketWorkspaces.get(socketId).add(workspaceId);
};

export const removeWorkspacePresence = ({ workspaceId, userId, socketId }) => {
    workspaceId = toId(workspaceId);
    userId = toId(userId);

    const workspaceUsers = workspacePresence.get(workspaceId);
    if (!workspaceUsers) return;

    const presence = workspaceUsers.get(userId);
    if (!presence) return;

    presence.socketIds.delete(socketId);

    if (presence.socketIds.size === 0) {
        workspaceUsers.delete(userId);
    }

    if (workspaceUsers.size === 0) {
        workspacePresence.delete(workspaceId);
    }

    const joinedWorkspaces = socketWorkspaces.get(socketId);
    if (joinedWorkspaces) {
        joinedWorkspaces.delete(workspaceId);

        if (joinedWorkspaces.size === 0) {
            socketWorkspaces.delete(socketId);
        }
    }
};

export const removeSocketFromAllWorkspaces = ({ socketId, userId }) => {
    const joinedWorkspaces = socketWorkspaces.get(socketId);

    if (!joinedWorkspaces) {
        return [];
    }

    const affectedWorkspaceIds = Array.from(joinedWorkspaces);

    for (const workspaceId of affectedWorkspaceIds) {
        removeWorkspacePresence({
            workspaceId,
            userId,
            socketId,
        });
    }

    socketWorkspaces.delete(socketId);

    return affectedWorkspaceIds;
};

export const getOnlineUsersForWorkspace = (workspaceId) => {
    workspaceId = toId(workspaceId);

    const workspaceUsers = workspacePresence.get(workspaceId);

    if (!workspaceUsers) {
        return [];
    }

    return Array.from(workspaceUsers.values()).map((entry) => entry.user);
};

import { Server } from "socket.io";
import { authenticateSocket } from "./socket.auth.js";
import { SOCKET_EVENTS } from "./socket.events.js";
import { userRoom } from "./socket.rooms.js";
import {
    addUserSocket,
    removeSocketFromAllWorkspaces,
    removeUserSocket,
} from "./socket.presence.js";
import { emitOnlineUsers, registerWorkspaceHandlers } from "./socket.workspace.js";

let io;

export const initSocketServer = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: process.env.CLIENT_URL || "http://localhost:5173",
            credentials: true,
        },
        pingInterval: 25000,
        pingTimeout: 30000,
    });

    io.use(authenticateSocket);

    io.on(SOCKET_EVENTS.CONNECTION, (socket) => {
        const userId = socket.user._id.toString();

        addUserSocket(userId, socket.id);
        socket.join(userRoom(userId));
        registerWorkspaceHandlers(io, socket);

        socket.on(SOCKET_EVENTS.DISCONNECT, () => {
            removeUserSocket(userId, socket.id);

            const affectedWorkspaceIds = removeSocketFromAllWorkspaces({
                socketId: socket.id,
                userId,
            });

            for (const workspaceId of affectedWorkspaceIds) {
                emitOnlineUsers(io, workspaceId);
            }
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error("Socket.IO server has not been initialized");
    }

    return io;
};

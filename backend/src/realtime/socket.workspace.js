import mongoose from "mongoose";
import * as workspaceRepository from "../modules/workspaces/workspace.repository.js";
import { SOCKET_EVENTS } from "./socket.events.js";
import { workspaceRoom } from "./socket.rooms.js";
import {
    addWorkspacePresence,
    getOnlineUsersForWorkspace,
    removeWorkspacePresence,
} from "./socket.presence.js";

export const emitOnlineUsers = (io, workspaceId) => {
    io.to(workspaceRoom(workspaceId)).emit(
        SOCKET_EVENTS.PRESENCE_ONLINE_USERS,
        {
            workspaceId: workspaceId.toString(),
            users: getOnlineUsersForWorkspace(workspaceId),
        }
    );
};

export const registerWorkspaceHandlers = (io, socket) => {
    socket.on(SOCKET_EVENTS.WORKSPACE_JOIN, async ({ workspaceId } = {}) => {
        try {
            if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
                socket.emit(SOCKET_EVENTS.WORKSPACE_ERROR, {
                    workspaceId,
                    message: "Invalid workspace ID",
                });
                return;
            }

            const isMember = await workspaceRepository.isWorkspaceMember(
                workspaceId,
                socket.user._id
            );

            if (!isMember) {
                socket.emit(SOCKET_EVENTS.WORKSPACE_ERROR, {
                    workspaceId,
                    message: "You are not a member of this workspace",
                });
                return;
            }

            socket.join(workspaceRoom(workspaceId));

            addWorkspacePresence({
                workspaceId,
                user: socket.user,
                socketId: socket.id,
            });

            socket.emit(SOCKET_EVENTS.WORKSPACE_JOINED, {
                workspaceId,
            });

            emitOnlineUsers(io, workspaceId);
        } catch {
            socket.emit(SOCKET_EVENTS.WORKSPACE_ERROR, {
                workspaceId,
                message: "Failed to join workspace",
            });
        }
    });

    socket.on(SOCKET_EVENTS.WORKSPACE_LEAVE, ({ workspaceId } = {}) => {
        if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
            return;
        }

        socket.leave(workspaceRoom(workspaceId));

        removeWorkspacePresence({
            workspaceId,
            userId: socket.user._id,
            socketId: socket.id,
        });

        socket.emit(SOCKET_EVENTS.WORKSPACE_LEFT, {
            workspaceId,
        });

        emitOnlineUsers(io, workspaceId);
    });
};

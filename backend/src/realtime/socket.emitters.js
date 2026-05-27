import { getIO } from "./socket.server.js";
import { SOCKET_EVENTS } from "./socket.events.js";
import { userRoom, workspaceRoom } from "./socket.rooms.js";

const actorPayload = (user) => ({
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    avatar: user.avatar,
});
//use helper function object for security so that frontend accidently does not expose sensetive info 

//this file is for live changes sync if something happens update ui instantly without any refresh 


export const emitTaskCreated = ({ workspaceId, task, actor }) => {
    getIO().to(workspaceRoom(workspaceId)).emit(SOCKET_EVENTS.TASK_CREATED, {
        workspaceId: workspaceId.toString(),
        task,
        actor: actorPayload(actor),
    });
};

export const emitTaskUpdated = ({ workspaceId, task, actor }) => {
    getIO().to(workspaceRoom(workspaceId)).emit(SOCKET_EVENTS.TASK_UPDATED, {
        workspaceId: workspaceId.toString(),
        task,
        actor: actorPayload(actor),
    });
};

export const emitTaskMoved = ({ workspaceId, task, actor }) => {
    getIO().to(workspaceRoom(workspaceId)).emit(SOCKET_EVENTS.TASK_MOVED, {
        workspaceId: workspaceId.toString(),
        task,
        actor: actorPayload(actor),
    });
};

export const emitTaskReordered = ({ workspaceId, boardId, tasks, actor }) => {
    getIO().to(workspaceRoom(workspaceId)).emit(SOCKET_EVENTS.TASK_REORDERED, {
        workspaceId: workspaceId.toString(),
        boardId: boardId.toString(),
        tasks,
        actor: actorPayload(actor),
    });
};

export const emitTaskArchived = ({ workspaceId, task, actor }) => {
    getIO().to(workspaceRoom(workspaceId)).emit(SOCKET_EVENTS.TASK_ARCHIVED, {
        workspaceId: workspaceId.toString(),
        task,
        actor: actorPayload(actor),
    });
};

export const emitNotificationNew = ({ userId, notification }) => {
    getIO().to(userRoom(userId)).emit(SOCKET_EVENTS.NOTIFICATION_NEW, {
        notification,
    });
};

/**
 * Socket handler wrapper to catch and gracefully handle any synchronous or asynchronous
 * exceptions thrown during realtime event execution.
 *
 * Emits a unified 'socket:error' event back to the client instead of crashing or failing silently.
 */
export const wrapSocketHandler = (io, socket, handler) => {
    return async (...args) => {
        try {
            await handler(io, socket, ...args);
        } catch (error) {
            console.error(`[SOCKET HANDLER ERROR]:`, error);
            
            socket.emit("socket:error", {
                message: error.message || "An unexpected error occurred in real-time connection",
                errorCode: error.errorCode || "SOCKET_INTERNAL_ERROR",
                timestamp: new Date().toISOString(),
            });
        }
    };
};

import { parse } from "cookie";
import jwt from "jsonwebtoken";
import * as authRepository from "../modules/auth/auth.repository.js";

const publicUser = (user) => ({
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    avatar: user.avatar,
});

export const authenticateSocket = async (socket, next) => {
    try {
        const cookies = parse(socket.handshake.headers.cookie || "");
        const token = cookies.accessToken || socket.handshake.auth?.token;

        if (!token) {
            return next(new Error("Unauthorized"));
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await authRepository.findUserById(decodedToken._id);

        if (!user) {
            return next(new Error("Unauthorized"));
        }

        socket.user = publicUser(user);
        next();
    } catch {
        next(new Error("Unauthorized"));
    }
};

import jwt from "jsonwebtoken";

import ApiError from "../../utils/ApiError.js";
import * as authRepository from "../auth/auth.repository.js";


export const verifyJWT = async (req, res, next) => {


    const token =
        req.cookies?.accessToken ||
        req.header("Authorization")?.replace("Bearer ", "");

    console.log("TOKEN:", token);

    console.log(
        "ACCESS SECRET:",
        process.env.ACCESS_TOKEN_SECRET
    );

    if (!token) {
        throw new ApiError(401, "Unauthorized request");
    }

    const decodedToken = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET
    );

    console.log("DECODED:", decodedToken);

    const user = await authRepository.findUserById(decodedToken._id);

    if (!user) {
        throw new ApiError(401, "Invalid Access Token");
    }

    req.user = user;

    return next();
};


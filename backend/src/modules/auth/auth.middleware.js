import jwt from "jsonwebtoken";

import ApiError from "../../utils/ApiError.js";
import * as authRepository from "../auth/auth.repository.js";


import asyncHandler from "../../utils/asyncHandler.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {


    const token =
        req.cookies?.accessToken ||
        req.header("Authorization")?.replace("Bearer ", "");



    if (!token) {
        throw new ApiError(401, "Unauthorized request");
    }

    const decodedToken = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET
    );



    const user = await authRepository.findUserById(decodedToken._id);

    if (!user) {
        throw new ApiError(401, "Invalid Access Token");
    }

    req.user = user;

    next();
});


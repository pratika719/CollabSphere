import jwt from "jsonwebtoken";

import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";

import * as authRepository from "../modules/auth/auth.repository.js";


export const veifyJWT = asyncHandler(async (req, res, next) => {
    const token = req.cookies?.accessToken || req.header("Authorization").replace("Bearer ", "");

    if (!token) {
        throw new ApiError(
            401,
            "Unauthorized request"
        );
    }

    let decodedToken
    try {
        decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    } catch (error) {
        throw new ApiError(401, "Invalid Access Token");
    }





    const user = await authRepository.findUserById(decodedToken._id)

    if (!user) {
        throw new ApiError(401, "Invalid Access Token");
    }

    req.user = user;



    next()

}


)


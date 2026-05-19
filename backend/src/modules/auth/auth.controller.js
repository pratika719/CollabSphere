import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import * as authService from "./auth.service.js";
import asyncHandler from "../../utils/asyncHandler.js";

const accessTokenOptions = {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 15 * 60 * 1000,
}

const refreshTokenOptions = {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
}

export const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        throw new ApiError(400, "All Fields Are Required");
    }

    const user = await authService.registerUser(email, password, name);

    const { accessToken, refreshToken } = await authService.generateAuthTokens(user._id);

    res.cookie("accessToken", accessToken, accessTokenOptions);
    res.cookie("refreshToken", refreshToken, refreshTokenOptions);

    return res.status(201).json(
        new ApiResponse(201, user, "User Registered Successfully")
    )
});

export const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new ApiError(400, "All Fields Are Required");
    }
    const {
        sanitizedUser,
        accessToken,
        refreshToken,
    } = await authService.loginUser(email, password);

    res.cookie("accessToken", accessToken, accessTokenOptions);
    res.cookie("refreshToken", refreshToken, refreshTokenOptions);
    return res.status(200).json(
        new ApiResponse(200, { user: sanitizedUser, accessToken, refreshToken }, "User Logged In Successfully")
    )
});

export const logoutUser = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    await authService.logoutUser(userId);
    res.clearCookie("accessToken", accessTokenOptions);
    res.clearCookie("refreshToken", refreshTokenOptions);

    return res.status(200).json(
        new ApiResponse(200, null, "User Logged Out Successfully")
    )
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if (!incomingRefreshToken) {
        throw new ApiError(401, "Invalid Refresh Token");
    }

    let decodedToken;
    try {
        decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch (error) {
        throw new ApiError(401, "Invalid Refresh Token");
    }

    const { accessToken, refreshToken } = await authService.refreshUserAccessToken({
        userId: decodedToken._id,
        incomingRefreshToken,
    });

    res.cookie("accessToken", accessToken, accessTokenOptions);
    res.cookie("refreshToken", refreshToken, refreshTokenOptions);

    return res.status(200).json(
        new ApiResponse(200, { accessToken }, "Access Token Refreshed Successfully")
    )
});

export const changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        throw new ApiError(400, "Old and new passwords are required");
    }

    const userId = req.user?._id;

    await authService.changePassword({
        userId, oldPassword,
        newPassword,
    });

    return res.status(200).json(
        new ApiResponse(200, null, "Password changed successfully")
    );
});

export const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200).json(
        new ApiResponse(200, req.user, "User Fetched Successfully")
    );
});

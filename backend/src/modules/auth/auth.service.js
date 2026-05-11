import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as authRepository from "./auth.repository.js";
import ApiError from "../../utils/ApiError.js";



const generateAccessToken = (userId) => {
    return jwt.sign(
        {
            _id: userId,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }

    );
};

const generateRefreshToken = (userId) => {
    return jwt.sign(
        {
            _id: userId,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }

    );
};

const generateAuthTokens = async (userId) => {
    const accessToken = generateAccessToken(userId);
    const refreshToken = generateRefreshToken(userId);

    await authRepository.saveRefreshToken(userId, refreshToken);

    return { accessToken, refreshToken };
}


const registerUser = async (email, password, name) => {


    const existingUser = await authRepository.finduserByEmail(email);

    if (existingUser) {
        throw new ApiError("User Already Exists", 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const createdUser = await authRepository.createUser({ email, password: hashedPassword, role: "member" });


    const sanitizedUser = await authRepository.findUserById(createdUser._id);
    return sanitizedUser;
}

export const loginUser = async (email, password) => {
    const user = await authRepository.finduserWithpasswordByEmail(email);
    if (!user) {
        throw new ApiError("Invalid credentials", 401``);
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
        throw new ApiError(401, "Invalid credentials");
    }
    const { accessToken, refreshToken } = await generateAuthTokens(user._id);

    const sanitizedUser = await authRepository.findUserById(user._id);
    return { sanitizedUser, accessToken, refreshToken }
}


export const logoutUser = async (userId) => {
    await authRepository.removeRefreshToken(userId);
    return true
}

export const refreshUserAccessToken = async ({ userId, incomingRefreshToken }) => {

    const user = await authRepository.findUserById(userId);
    if (!user) {
        throw new ApiError(401, "Invalid Refresh Token");
    }
    const storedUser = await authRepository.findUserByRefreshToken(incomingRefreshToken);
    if (!storedUser) {
        throw new ApiError(401, "Invalid Refresh Token");
    }
    const { accessToken, refreshToken } = await generateAuthTokens(userId);
    return { accessToken, refreshToken }
}

export const changePassword = async ({ userId, oldPassword, newPassword }) => {
    const user = await authRepository.finduserWithpasswordByEmail(reqUserEmailFallback(userId))

    if (!user) {
        throw new ApiError(404, "User not found");
    }


    const isPasswordCorrect = await bcrypt.compare(
        oldPassword,
        user.password
    );

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Old password is incorrect");
    }
    const isSamePassword = await bcrypt.compare(newPassword, user.password);

    if (isSamePassword) {
        throw new ApiError(400, "New password is same as old password");
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await authRepository.updatePassword(userId, hashedNewPassword);
    return true


}

const reqUserEmailFallback = (userId) => {
    return userId;
};


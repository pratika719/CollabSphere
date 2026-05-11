import User from "../../models/User.js";

export const createUser = async (userData) => {
    const user = await User.create(userData);
    return user;
}

export const finduserByEmail = async (email) => {
    return await User.findOne({ email }).select("-password");
}

export const findUserById = async (userId) => {
    return await User.findById(userId).select("-password");
}

export const finduserWithpasswordByEmail = async (email) => {
    return await User.findOne({ email }).select("+password");
}

export const findUserWithPasswordById = async (userId) => {
    return await User.findById(userId).select("+password");
}

export const saveRefreshToken = async (userId, refreshToken) => {
    return await User.findByIdAndUpdate(
        userId,
        {
            refreshToken,
        },
        {
            new: true,
        }
    );
};

export const findUserByRefreshToken = async (refreshToken) => {
    return await User.findOne({ refreshToken });
};

export const removeRefreshToken = async (userId) => {
    return await User.findByIdAndUpdate(userId, {
        refreshToken: null
    }, { new: true })
}

export const updatePassword = async (userId, hashedPassword) => {
    return await User.findByIdAndUpdate(userId, {
        password: hashedPassword
    }, { new: true })
}


export const updateAvatar = async (UserId, avatarUrl) => {
    return await User.findByIdAndUpdate(UserId, {
        avatar: avatarUrl
    }, {
        new: true
    }).select("-password", "-refreshToken");

}


export const emailExists = async (email) => {
    const user = await User.exists({ email });
    return !!user;

}

export const deleteUserById = async (userId) => {
    return await User.findByIdAndDelete(userId);
};


export default {
    createUser,
    finduserByEmail,
    findUserById,
    finduserWithpasswordByEmail,
    findUserWithPasswordById,
    saveRefreshToken,
    findUserByRefreshToken,
    removeRefreshToken,
    updatePassword,
    updateAvatar,
    emailExists,
    deleteUserById,
};

import mongoose from "mongoose";


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: [2, "Name must be atleast 2 characters"],
        maxlength: [50, "name cannot be more than 50 characters"]
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true,
        match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Invalid email address"]
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [6, "Password must be atleast 6 characters"],
        select: false,
    },

    role: {
        type: String,
        enum: ["member", "admin"],
        default: "member",
    },
    refreshToken: {
        type: String,
        select: false,

    },
    avatar: {
        type: String,
        default: null,
    },
    bio: {
        type: String,
        trim: true,
        maxlength: [250, "Bio cannot exceed 250 characters"],
        default: "",
    },

    isActive: {
        type: Boolean,
        default: true,
    },

    isEmailVerified: {
        type: Boolean,
        default: false,
    },
    lastLogin: {
        type: Date,
        default: null,
    },

    passwordChangedAt: {
        type: Date,
        default: null,
    },

}, {
    timestamps: true,
    versionKey: false,

});

userSchema.index({ email: 1 });


userSchema.methods.toSafeObject = function () {
    const userObject = this.toObject();
    delete userObject.password;
    delete userObject.refreshToken;
    return userObject;
};

userSchema.statics.findActiveUserById = function (userId) {
    return this.findOne({
        _id: userId,
        isActive: true,

    });
};

userSchema.pre("save", async function () {
    if (this.isModified("password")) {
        this.passwordChangedAt = Date.now();
    }
});

const User = mongoose.model("User", userSchema);

export default User;

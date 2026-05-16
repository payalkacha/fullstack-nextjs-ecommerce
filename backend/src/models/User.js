import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true,
        select: false
    },

    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },

    otp: {
        type: String
    },

    otpExpire: {
        type: Date
    },

    isVerified: {
        type: Boolean,
        default: false
    },

    phone: {
        type: String,
        default: ""
    },

    address: {
        type: String,
        default: ""
    },

    gender: {
        type: String,
        default: ""
    },

    occupation: {
        type: String,
        default: ""
    },

    city: {
        type: String,
        default: ""
    },

    state: {
        type: String,
        default: ""
    },

    profilePic: {
        type: String,
        default: ""
    }
},
    { timestamps: true });

const User =
    mongoose.models.User || mongoose.model("User", userSchema);

export default User;
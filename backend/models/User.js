import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true
    },

    username: {
        type: String,
        required: true,
        unique: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    },

    profilePic: {
        type: String,
        default: ""
    },

    bio: {
        type: String,
        default: ""
    },

    followers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],

    following: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],

    isPrivate: {
        type: Boolean,
        default: false
    },

    followRequests: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],

}, { timestamps: true });

const User = mongoose.model("User", userSchema);

export default User;
import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    type: {
        type: String,
        enum: ["like", "comment", "follow", "storyLike"],
        required: true
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
    },
    story: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Story",
    },
    text: {
        type: String, 
    },
    read: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Delete automatically after 24 hours (86400 seconds)
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;

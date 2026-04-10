import Notification from "../models/Notification.js";

export const getNotifications = async (req, res) => {
    try {
        const userId = req.user._id;

        const notifications = await Notification.find({ receiver: userId })
            .sort({ createdAt: -1 })
            .populate("sender", "username profilePic")
            .populate("post", "images")
            .populate("story", "media type");

        return res.status(200).json({
            success: true,
            notifications
        });
    } catch (error) {
        console.log("get notifications error", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export const markAsRead = async (req, res) => {
    try {
        const userId = req.user._id;

        await Notification.updateMany(
            { receiver: userId, read: false },
            { read: true }
        );

        return res.status(200).json({
            success: true,
            message: "Notifications marked as read"
        });
    } catch (error) {
        console.log("mark as read error", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

import uploadImage from "../config/cloudinary.js";
import Story from "../models/Story.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import { getReceiverSocketId, io } from "../config/socket.js";

export const createStory = async (req, res) =>{
    try {
        if(!req.file){
            return res.status(400).json({
                success: false,
                message: "Media required"
            })
        }

        const mediaUrl = await uploadImage(req.file.path);

        if(!mediaUrl){
            return res.status(500).json({
                success: false,
                message: "Failed to upload media"
            })
        }

        const type = req.file.mimetype.includes("video") ? "video" : "image";

        const story = await Story.create({
            user: req.user._id,
            media: mediaUrl,
            type: type,
            song: req.body.song ? JSON.parse(req.body.song) : null,
            overlays: req.body.overlays ? JSON.parse(req.body.overlays) : null
        })

        return res.status(201).json({
            success: true,
            message: "Story created successfully",
            story
        })
    } catch (error) {
        console.log("Error in createStory",error);
        return res.status(500).json({
            success: false,
            message: "Failed to create story"
        })
    }
}


export const getStory = async (req, res) =>{
    try{

        const user = await User.findById(req.user.id);

        const users = [...user.following, ...user.followers, req.user.id];

        const stories = await Story.find({user: {$in: users}})
            .populate("user", "username profilePic")
            .populate("viewers.user", "username profilePic")
            .sort({createdAt: -1})

        return res.status(200).json({
            success: true,
            stories
        })
    } catch (error) {
        console.log("Error in getStory",error);
        return res.status(500).json({
            success: false,
            message: "Failed to get stories"
        })
    }
}


export const deleteStory = async (req, res) =>{
    try {
        const story = await Story.findById(req.params.id);

        if(!story){
            return res.status(404).json({
                success: false,
                message: "Story not found"
            })
        }

        if(story.user.toString() !== req.user._id.toString()){
            return res.status(403).json({
                success: false,
                message: "Unauthorized"
            })
        }

        await story.deleteOne();

        return res.status(200).json({
            success: true,
            message: "Story deleted successfully"
        })
    } catch (error) {
        console.log("Error in deleteStory",error);
        return res.status(500).json({
            success: false,
            message: "Failed to delete story"
        })
    }
}


export const toggleLikeStory = async (req, res) => {
    try {
        const { id } = req.params;
        const story = await Story.findById(id);

        if (!story) {
            return res.status(404).json({ success: false, message: "Story not found" });
        }

        const isLiked = story.likes.includes(req.user._id);

        if (isLiked) {
            story.likes = story.likes.filter(userId => userId.toString() !== req.user._id.toString());
        } else {
            story.likes.push(req.user._id);

            // Create notification if liking someone else's story
            if (story.user.toString() !== req.user._id.toString()) {
                const newNotification = new Notification({
                    sender: req.user._id,
                    receiver: story.user,
                    type: "storyLike",
                    story: story._id
                });
                await newNotification.save();

                const receiverSocketId = getReceiverSocketId(story.user.toString());
                if (receiverSocketId) {
                    await newNotification.populate("sender", "username profilePic");
                    await newNotification.populate("story", "type media");
                    io.to(receiverSocketId).emit("newNotification", newNotification);
                }
            }
        }

        await story.save();

        return res.status(200).json({
            success: true,
            message: isLiked ? "Story unliked" : "Story liked",
            likes: story.likes
        });

    } catch (error) {
        console.log("Error in toggleLikeStory", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const viewStory = async (req, res) => {
    try {
        const { id } = req.params;
        const story = await Story.findById(id);

        if (!story) {
            return res.status(404).json({ success: false, message: "Story not found" });
        }

        // Check if user already viewed
        const hasViewed = story.viewers.some(v => v.user.toString() === req.user._id.toString());

        if (!hasViewed) {
            story.viewers.push({ user: req.user._id, viewedAt: Date.now() });
            await story.save();
        }

        return res.status(200).json({
            success: true,
            message: "Story marked as viewed"
        });

    } catch (error) {
        console.log("Error in viewStory", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};
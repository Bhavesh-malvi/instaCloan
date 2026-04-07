import uploadImage from "../config/cloudinary.js";
import Story from "../models/Story.js";
import User from "../models/User.js";

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
            type: type
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

        const stories = await Story.find({user: {$in: users}}).populate("user", "username profilePic").sort({createdAt: -1})

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
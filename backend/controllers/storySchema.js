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

        const mediaUrl = await uploadImage(eq.file.path);

        if(!mediaUrl){
            return res.status(500).json({
                success: false,
                message: "Failed to upload media"
            })
        }

        const story = await Story.create({
            user: req.user._id,
            media: mediaUrl
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

        const users = [...user.following, req.user.id];

        const stories = await Story.find({user: {$in: users}}).populate("user", "username profilePic").sort({createdAt: -1})

        return res.status(200).json({
            success: true,
            message: "Stories fetched successfully",
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
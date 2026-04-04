import Post from "../models/Post.js";
import Comment from "../models/Comment.js";

export const addComment = async (req, res) =>{
    try {
        const {text} = req.body;
        const {postId} = req.params;

        if(!text){
            return res.status(400).json({
                success: false,
                message: "Comment is required"
            })
        }

        const post = await Post.findById(postId);

        if(!post){
            return res.status(400).json({
                success: false,
                message: "Post not found"
            })
        }

        const comment = await Comment.create({
            user: req.user._id,
            post: postId,
            text
        })

        return res.status(201).json({
            success: true,
            message: "Comment added successfully",
            comment
        })

    } catch (error) {
        console.log("comment controller error",error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

export const getComment = async (req, res) =>{
    try {
        const {postId} = req.params;

        const comment = await Comment.find({postId}).populate("user", "username profilePic").sort({createdAt: -1});

        return res.status(200).json({
            success: true,
            comment
        })

    } catch (error) {
        console.log("comment controller error",error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}


export const deleteComment = async (req, res) =>{
    try {
        const {commentId} = req.params;

        const comment = await Comment.findById(commentId);

        if(!comment){
            return res.status(400).json({
                success: false,
                message: "Comment not found"
            })
        }

        if(comment.user.toString() !== req.user._id.toString()){
            return res.status(400).json({
                success: false,
                message: "You are not authorized to delete this comment"
            })
        }

        await comment.deleteOne();

        return res.status(200).json({
            success: true,
            message: "Comment deleted successfully"
        })

    } catch (error) {
        console.log("comment controller error",error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}
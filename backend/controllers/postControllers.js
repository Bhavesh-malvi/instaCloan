import uploadImage from "../config/cloudinary.js";
import Post from "../models/Post.js";
import User from "../models/User.js";

export const createPost = async (req, res) => {
  try {
    const { caption } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one image is required"
      });
    }

    if (req.files.length > 10) {
      return res.status(400).json({
        success: false,
        message: "Maximum 10 images are allowed"
      });
    }

    const imageUrls = await Promise.all(
      req.files.map(file => uploadImage(file.path))
    );

    if (imageUrls.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Image upload failed"
      });
    }

    const post = await Post.create({
      user: req.user._id,
      caption,
      images: imageUrls
    });

    return res.status(201).json({
      success: true,
      message: "Post created successfully",
      post
    });

  } catch (error) {
    console.log("post controller error", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};


export const likePost = async (req, res) =>{
    try {
        const {postId} = req.params;

        const post = await Post.findById(postId);

        if(!post){
            return res.status(400).json({
                message: "Post not found",
                success:false
            })
        }

        const isLiked = post.likes.includes(req.user._id);


        if(isLiked){
            post.likes = post.likes.filter(
                id => id.toString() !== req.user._id.toString()
            )
        }else{
            post.likes.push(req.user._id)
        }

        await post.save();

        return res.status(200).json({
            success: true,
            likes: post.likes.length
        })

    } catch (error) {
        console.log("post controller error",error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

export const getAllPost = async (req, res) =>{
    try {
        const posts = await Post.find().populate("user", "username profilePic").sort({createdAt: -1});

        return res.status(200).json({
            success: true,
            posts
        })

    } catch (error) {
        console.log("post controller error",error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}


export const deletePost = async (req, res)=>{
    try {
        const {postId} = req.params;

        const post = await Post.findById(postId);

        if(!post){
            return res.status(400).json({
                success: false,
                message: "Post not found"
            })
        }

        if(post.user.toString() !== req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: "You are not authorized to delete this post"
            })
        }

        await post.deleteOne()
        
        
        return res.status(200).json({
            success: true,
            message: "Post deleted successfully"
        })

    } catch (error) {
        console.log("post controller error",error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}


export const getPostById = async (req, res) =>{
    try {
        const post = await Post.findById(req.params.postId).populate("user", "username profilePic");

        if(!post){
            return res.status(400).json({
                success: false,
                message: "Post not found"
            })
        }

        return res.status(200).json({
            success: true,
            post
        })

    } catch (error) {
        console.log("post controller error",error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}


export const getFeedPost = async (req, res) =>{
    try {
        const userId = req.user._id;

        const user = await User.findById(userId);

        const users = [...user.following, userId];

        const post = await Post.find({
            user: {$in: users}
        }).populate("user", "username profilePic").sort({createdAt: -1})

        return res.status(200).json({
            success: true,
            post
        })

    } catch (error) {
        console.log("post controller error",error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}
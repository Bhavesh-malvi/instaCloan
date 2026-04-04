import mongoose from "mongoose";


const postSchema = mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    image: [
        {
            type: String
        }
    ],
    caption: {
        type: String,
    },
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ]

}, {timestamps: true})


const Post = mongoose.model("Post", postSchema);

export default Post;
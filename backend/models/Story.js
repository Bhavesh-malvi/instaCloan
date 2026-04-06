import mongoose from "mongoose"

const storySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    media:{
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ["image", "video"],
        required: true
    },
    expiresAt: {
        type: Date,
        default: Date.now(),
        expires: 86400
    }
}, {timestamps: true})

const Story = mongoose.model("Story", storySchema);

export default Story;
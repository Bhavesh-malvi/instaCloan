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
    },
    song: {
        name: String,
        image: String,
        file: String,
        duration: String,
        startTime: {
            type: Number,
            default: 0
        }
    },
    overlays: {
        song: {
            x: { type: Number, default: 50 },
            y: { type: Number, default: 50 },
            visible: { type: Boolean, default: true }
        },
        text: {
            content: String,
            x: { type: Number, default: 50 },
            y: { type: Number, default: 50 },
            color: { type: String, default: "#ffffff" }
        }
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    viewers: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        viewedAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {timestamps: true})

const Story = mongoose.model("Story", storySchema);

export default Story;
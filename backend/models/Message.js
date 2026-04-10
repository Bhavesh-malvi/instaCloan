import mongoose from "mongoose";


const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }, 
    text:{
        type: String,
        default: ""
    },
    media:{
        type: String,
        default: ""
    },
    seen:{
        type: Boolean,
        default: false
    },
    delivered:{
        type: Boolean,
        default: false
    },
    deletedAt:{
        type: Date,
        default: null
    },
    story: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Story"
    }
}, {timestamps: true})

const Message = mongoose.model("Message", messageSchema);
export default Message;
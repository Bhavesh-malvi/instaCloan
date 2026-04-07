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
        required: true
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
    }
}, {timestamps: true})

const Message = mongoose.model("Message", messageSchema);
export default Message;
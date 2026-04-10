import uploadImage from "../config/cloudinary.js";
import Message from "../models/Message.js";

export const sendMessage = async (req, res) => {
    try {
        const {receiver, text, story} = req.body;

        let mediaUrl = "";

        if(req.file){
            mediaUrl = await uploadImage(req.file.path);
        }

        if(!text && !mediaUrl){
            res.status(400).json({
                success: false, 
                message: "Message is empty"
            })
        }

        const message = await Message.create({
            sender: req.user._id,
            receiver,
            text,
            media: mediaUrl,
            story: story ? story : null
        })

        return res.status(201).json({
            success: true,
            message
        })

    } catch (error) {
        console.log("Error in sendMessage",error);
        return res.status(500).json({
            success: false,
            message: "Failed to send message"
        })
    }
}


export const getMessages = async (req, res) =>{
    try {
        const { userId } = req.params;

        const messages = await Message.find({
            $or: [
                {sender: req.user.id, receiver: userId},
                {sender: userId, receiver: req.user.id}
            ],
            deletedAt: null
        }).sort({createdAt: 1})
          .populate("sender", "username profilePic")
          .populate("receiver", "username profilePic")
          .populate("story", "media type");

        return res.status(200).json({
            success: true,
            messages
        })

    } catch (error) {
        console.log("Error in getMessages",error);
        return res.status(500).json({
            success: false,
            message: "Failed to get messages"
        })
    }
}


export const markAsSeen = async (req, res) =>{
    try {
        const {userId} = req.params;

        await Message.updateMany({
            sender: userId,
            receiver: req.user.id,
            seen: false
        },
        {
            seen: true
        });

        return res.status(200).json({
            success: true,
            message: "Messages marked as seen"
        })
    } catch (error) {
        console.log("Error in markAsSeen",error);
        return res.status(500).json({
            success: false,
            message: "Failed to mark messages as seen"
        })
    }
}
    

export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found"
      });
    }

    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized"
      });
    }

    message.deletedAt = new Date();
    await message.save();

    return res.status(200).json({
      success: true,
      message: "Message deleted"
    });

  } catch (error) {
    console.log("deleteMessage error", error);
    return res.status(500).json({
      success: false
    });
  }
};

export const getUnreadMessageCount = async (req, res) => {
    try {
        const userId = req.user._id;

        const unreadMessages = await Message.distinct("sender", {
            receiver: userId,
            seen: false
        });

        return res.status(200).json({
            success: true,
            count: unreadMessages.length
        });
    } catch (error) {
        console.log("Error in getUnreadMessageCount", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch unread count"
        });
    }
};
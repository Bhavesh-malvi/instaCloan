import express from 'express'
import { getMessages, sendMessage, deleteMessage, markAsSeen, getUnreadMessageCount } from '../controllers/messageControllers.js';
import { AuthUser } from '../middleware/authUser.js';
import upload from '../middleware/multer.js';

const messageRouter = express.Router();

messageRouter.get("/unread/count", AuthUser, getUnreadMessageCount);
messageRouter.get("/:userId", AuthUser, getMessages);
messageRouter.post("/send/:userId", AuthUser, upload.single("media"), sendMessage);
messageRouter.put("/seen/:userId", AuthUser, markAsSeen);
messageRouter.delete("/:messageId", AuthUser, deleteMessage);

export default messageRouter;
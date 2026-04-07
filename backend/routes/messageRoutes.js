import express from 'express'
import { getMessages, sendMessage, deleteMessage, markAsSeen } from '../controllers/messageControllers.js';
import { AuthUser } from '../middleware/authUser.js';

const messageRouter = express.Router();

messageRouter.get("/:userId", AuthUser, getMessages);
messageRouter.post("/send/:userId", AuthUser, sendMessage);
messageRouter.put("/seen/:userId", AuthUser, markAsSeen);
messageRouter.delete("/:messageId", AuthUser, deleteMessage);

export default messageRouter;
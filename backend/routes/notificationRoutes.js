import express from "express";
import { AuthUser } from "../middleware/authUser.js";
import { getNotifications, markAsRead } from "../controllers/notificationControllers.js";

const router = express.Router();

router.get("/", AuthUser, getNotifications);
router.put("/read", AuthUser, markAsRead);

export default router;

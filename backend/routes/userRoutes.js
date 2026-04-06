import express from "express";
import { followUser, getProfile, getSuggestedUser, logout, searchUser, signin, signup, unfollowUser, updateUser, getUserProfileByUsername } from "../controllers/userControllers.js";
import { AuthUser } from "../middleware/authUser.js";
import upload from "../middleware/multer.js";


const userRouter = express.Router();


userRouter.post("/signup", signup);
userRouter.post("/signin", signin);
userRouter.get("/profile", AuthUser, getProfile);
userRouter.put("/update", AuthUser, upload.single("profilePic"), updateUser);
userRouter.post("/logout", logout);
userRouter.post("/follow/:userId", AuthUser, followUser);
userRouter.post("/unfollow/:userId", AuthUser, unfollowUser);
userRouter.get("/suggested", AuthUser, getSuggestedUser);
userRouter.get("/search", AuthUser, searchUser);
userRouter.get("/profile-info/:username", AuthUser, getUserProfileByUsername);

export default userRouter
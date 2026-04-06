import express from "express";
import { AuthUser } from "../middleware/authUser.js";
import { createPost, deletePost, getExplorePosts, getFeedPost, getPostById, getUserPost, likePost } from "../controllers/postControllers.js";
import upload from "../middleware/multer.js";

const postRouter = express.Router();

postRouter.post("/create", AuthUser, upload.array("image", 10), createPost);
postRouter.post("/like/:postId", AuthUser, likePost);
postRouter.get("/all", AuthUser, getExplorePosts);
postRouter.get("/post/:postId", AuthUser, getPostById);
postRouter.get("/user/:userId", getUserPost);
postRouter.delete("/delete/:postId", AuthUser, deletePost);
postRouter.get("/feed", AuthUser, getFeedPost);

export default postRouter;
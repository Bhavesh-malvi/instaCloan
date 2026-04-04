import express from "express"
import { AuthUser } from "../middleware/authUser.js";
import { addComment, deleteComment, getComment } from "../controllers/commentControllers.js";

const commentRouter = express.Router();

commentRouter.post("/add/:postId", AuthUser, addComment);
commentRouter.get("/get/:postId", AuthUser, getComment);
commentRouter.delete("/delete/:commentId", AuthUser, deleteComment)

export default commentRouter
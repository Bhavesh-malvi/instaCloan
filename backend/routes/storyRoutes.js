import express from 'express';
import upload from '../middleware/multer.js';
import { AuthUser } from '../middleware/authUser.js';
import { createStory, deleteStory, getStory } from '../controllers/storyControllers.js';


const storyRouter = express.Router();


storyRouter.post("/create", AuthUser, upload.single("media"), createStory);
storyRouter.get("/", AuthUser, getStory);
storyRouter.delete("/delete/:id", AuthUser, deleteStory);

export default storyRouter;
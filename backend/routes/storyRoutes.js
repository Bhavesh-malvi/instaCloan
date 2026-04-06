import express from 'express';
import upload from '../middleware/multer.js';
import { createStory, getStory } from '../controllers/storySchema.js';
import { AuthUser } from '../middleware/authUser.js';


const storyRouter = express.Router();


storyRouter.post("/create", AuthUser, upload.single("media"), createStory);
storyRouter.get("/", AuthUser, getStory);

export default storyRouter;
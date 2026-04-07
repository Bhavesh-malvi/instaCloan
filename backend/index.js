import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import http from "http"
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db.js";
import userRouter from "./routes/userRoutes.js";
import postRouter from "./routes/postRoutes.js";
import commentRouter from "./routes/commentRoutes.js";
import storyRouter from "./routes/storyRoutes.js";
import { initSocket } from "./config/socket.js";

dotenv.config();

const app = express();
app.use(express.json());

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}))

app.use(cookieParser());


app.get("/", (req, res)=>{
    res.send("Server is running")
})


app.use("/api/user", userRouter)
app.use("/api/posts", postRouter)
app.use("/api/comments", commentRouter)
app.use("/api/story", storyRouter)

const server = http.createServer(app)

initSocket(server);



server.listen(process.env.PORT, ()=>{
    console.log(`Server is running on port http://localhost:${process.env.PORT}`)
    connectDB();
})

import { Server } from "socket.io";
import Message from "../models/Message.js";

export let io;
const users = {}; 

export const getReceiverSocketId = (receiverId) => {
    return users[receiverId];
};

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true
    }
  });

  io.on("connection", (socket) => {

    socket.on("join", async (userId) => {
      users[userId] = socket.id;

      await Message.updateMany(
        {
          receiver: userId,
          delivered: false
        },
        {
          delivered: true
        }
      );
    });


    socket.on("sendMessage", async ({ sender, receiver, text }) => {
      try {
        const message = await Message.create({
          sender,
          receiver,
          text
        });

        const receiverSocket = users[receiver];

        if (receiverSocket) {
          io.to(receiverSocket).emit("receiveMessage", message);

          await Message.findByIdAndUpdate(message._id, {
            delivered: true
          });
        }

        socket.emit("messageSent", message);

      } catch (error) {
        console.log("Socket sendMessage error:", error);
      }
    });

    socket.on("markSeen", async ({ sender }) => {
      try {
        await Message.updateMany(
          {
            sender,
            receiver: Object.keys(users).find(
              (key) => users[key] === socket.id
            ),
            seen: false
          },
          {
            seen: true
          }
        );
      } catch (error) {
        console.log("Seen error:", error);
      }
    });

    socket.on("disconnect", () => {

      for (let userId in users) {
        if (users[userId] === socket.id) {
          delete users[userId];
          break;
        }
      }
    });
  });
};
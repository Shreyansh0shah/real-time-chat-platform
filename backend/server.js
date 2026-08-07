const express = require("express");
const connectDB = require("./config/db");
const dotenv = require("dotenv");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const path = require("path");
const Message = require("./models/messageModel"); // ✅ ADDED

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

// Routes
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/upload", require("./routes/uploadRoutes"));

const __dirname1 = path.resolve();
app.use(
  "/backend/uploads",
  express.static(path.join(__dirname1, "/backend/uploads"))
);

// ---------------- DEPLOYMENT ----------------
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname1, "/frontend/build")));

  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname1, "frontend", "build", "index.html"))
  );
} else {
  app.get("/", (req, res) => {
    res.send("API is running..");
  });
}
// ---------------- DEPLOYMENT ----------------

// Error Handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

const server = app.listen(
  PORT,
  console.log(`Server running on PORT ${PORT}...`)
);

// ---------------- SOCKET.IO ----------------
const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:3000",
  },
});

const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("Connected to socket.io");

  // Setup user
  socket.on("setup", (userData) => {
    if (!userData || !userData._id) return;

    const userId = String(userData._id);
    const sockets = onlineUsers.get(userId) || new Set();
    sockets.add(socket.id);
    onlineUsers.set(userId, sockets);

    socket.join(userId);
    socket.emit("connected");
    io.emit("get-online-users", Array.from(onlineUsers.keys()));
  });

  // Join chat room
  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });

  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  // New message
  socket.on("new message", (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;

    if (!chat.users) return;

    chat.users.forEach((user) => {
      if (user._id == newMessageRecieved.sender._id) return;
      socket.in(user._id).emit("message recieved", newMessageRecieved);
    });
  });

  // ✅ MESSAGE SEEN (BLUE TICK LOGIC)
  socket.on("message seen", async ({ chatId, userId }) => {
    try {
      await Message.updateMany(
        {
          chat: chatId,
          sender: { $ne: userId },
          isSeen: false,
        },
        { $set: { isSeen: true } }
      );

      // Notify sender that messages are seen
      socket.to(chatId).emit("message seen update", chatId);
    } catch (error) {
      console.error("Seen update error:", error.message);
    }
  });

  socket.on("disconnect", () => {
    for (const [userId, socketSet] of onlineUsers.entries()) {
      if (socketSet.has(socket.id)) {
        socketSet.delete(socket.id);
        if (socketSet.size === 0) {
          onlineUsers.delete(userId);
        } else {
          onlineUsers.set(userId, socketSet);
        }
        break;
      }
    }
    io.emit("get-online-users", Array.from(onlineUsers.keys()));
    console.log("USER DISCONNECTED");
  });
});

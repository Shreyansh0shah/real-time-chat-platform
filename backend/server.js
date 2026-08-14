const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const applyMiddleware = require("./middleware");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const { shutdown } = require("./serverUtils");
const Message = require("./models/messageModel");

const envFilePath = path.resolve(__dirname, "../.env");
dotenv.config({ path: envFilePath });
process.env.NODE_ENV = process.env.NODE_ENV || "development";
connectDB();

const app = express();
applyMiddleware(app);

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/user", require("./routes/userRoutes"));
app.use("/api/chat", require("./routes/chatRoutes"));
app.use("/api/message", require("./routes/messageRoutes"));
app.use("/api/upload", require("./routes/uploadRoutes"));

const appRoot = path.resolve();
app.use(
  "/backend/uploads",
  express.static(path.join(appRoot, "uploads"))
);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(appRoot, "/frontend/build")));

  app.get("*", (req, res) =>
    res.sendFile(path.resolve(appRoot, "frontend", "build", "index.html"))
  );
} else {
  app.get("/", (req, res) => {
    res.send("API is running..");
  });
}

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT} in ${process.env.NODE_ENV} mode...`);
});

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: function (origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      if (origin === "http://localhost:3000") {
        return callback(null, true);
      }

      if (/^https:\/\/[a-zA-Z0-9-]+\.vercel\.app$/.test(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("Connected to socket.io");

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

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });

  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageRecieved) => {
    const chat = newMessageRecieved.chat;

    if (!chat || !chat.users) return;

    chat.users.forEach((user) => {
      if (user._id == newMessageRecieved.sender._id) return;
      socket.in(user._id).emit("message recieved", newMessageRecieved);
    });
  });

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

const gracefulShutdown = shutdown(server, require("mongoose"));

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);


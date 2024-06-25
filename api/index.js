const express = require("express");
const app = express();
const mongoose = require("mongoose");
// gia na paroume tis metavlites apo to .env arxeio
require("dotenv/config");
const fs = require("fs");
const http = require("http").Server(app);
const bodyParser = require("body-parser");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const chatRoutes = require("./routes/chat");
const { sign } = require("crypto");

// const ws = require("ws");

// gia to avatar
app.use(express.json({ limit: "50mb" }));
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
  })
);
app.use(cors());

app.use(express.json());

const PORT = 8080;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/chats", chatRoutes);

const io = require("socket.io")(http, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const connectedUsers = new Map();

io.on("connection", (socket) => {
  // console.log("a user connected", socket.id);

  // Join the public room
  const publicRoom = "public_room";
  socket.on("join_public_room", () => {
    socket.join(publicRoom);
    console.log(`User ${socket.id} joined public room`);
  });

  socket.on("login", (data) => {
    const { userId, username, avatar } = data;
    connectedUsers.set(userId, {
      userId,
      username,
      avatar,
    });
    console.log(`User ${username} logged in with userId: ${userId}`);
    socket.emit("connected_users", Array.from(connectedUsers.values()) || []);
  });

  socket.on("join_room", (data) => {
    socket.join(data);
    console.log(`user with id: ${socket.id} joined room: ${data}`);

    socket.on("send_message", (data) => {
      console.log("receive_message", data);
      io.to(data.userChat).emit("receive_message", data);
    });
  });

  socket.on("public_chat", (data) => {
    console.log("public_chat", data);
    socket.broadcast.emit("receive_public_chat", data);
  });

  socket.on("callUser", (data) => {
    console.log(`User ${data.username} is calling ${data.userToCall}`);
    // console.log(data);
    io.to(data.userToCall).emit("r_callUser", {
      userToCall: data.userToCall,
      signal: data.signalData,
      from: data.from,
      username: data.username,
      roomId: data.roomId,
    });
  });

  socket.on("answerCall", (data) => {
    io.to(data.to).emit("callAccepted", data.signal);
    console.log(`User answered call`, data);
  });

  socket.on("disconnect", () => {
    socket.broadcast.emit("callEnded");
    const userId = socket.handshake.query.userId;
    connectedUsers.delete(userId);
    // console.log(`User ${userId} disconnected`);

    socket.emit("connected_users", Array.from(connectedUsers.values()));
  });
});

mongoose.connect(process.env.DB_CONNECTION).then(() => {
  http.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
  });
});

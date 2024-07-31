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
  res.send("welcome to port 8080!");
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
const sockets = new Map();

io.on("connection", (socket) => {
  // console.log("a user connected", socket.id);

  socket.emit("me", socket.id);

  socket.on("login", (data) => {
    const { userId, username, avatar } = data;
    connectedUsers.set(userId, {
      // socketId: socket.id,
      userId,
      username,
      avatar,
    });
    console.log(`User ${username} logged in with userId: ${userId}`);
    socket.emit("connected_users", Array.from(connectedUsers.values()) || []);
    // socket.emit("me", userId);

    sockets.set(userId, {
      socketId: socket.id,
      userId,
      username,
    });
    // console.log(sockets);
    socket.emit("connected_sockets", Array.from(sockets.values()) || []);
  });

  // Join the public room
  const publicRoom = "public_room";
  socket.on("join_public_room", () => {
    socket.join(publicRoom);
    console.log(`User ${socket.id} joined public room`);
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
    io.to(data.userToCall).emit("callUser", {
      signal: data.signalData,
      from: data.from,
      name: data.name,
    });
    // console.log("from", data.from);
    // console.log("name", data.name);
    // console.log("to", data.userToCall);
  });

  socket.on("answerCall", (data) => {
    io.to(data.to).emit("callAccepted", data.signal);
  });

  // tic tac toe
  socket.on("update_game", (message) => {
    const gameRoom = getSocketGameRoom(socket);
    if (gameRoom) {
      socket.to(gameRoom).emit("on_game_update", message);
    }
  });

  socket.on("game_win", (message) => {
    const gameRoom = getSocketGameRoom(socket);
    if (gameRoom) {
      socket.to(gameRoom).emit("on_game_win", message);
    }
  });

  socket.on("join_game", async (message) => {
    console.log("New User joining room: ", message);

    // const connectedSockets = io.sockets.adapter.rooms.get(message.roomId);
    // const socketRooms = Array.from(socket.rooms.values()).filter(
    //   (r) => r !== socket.id
    // );

    const connectedSockets = io.sockets.adapter.rooms.get(socket.id);
    const socketRooms = Array.from(socket.rooms.values()).filter(
      (r) => r !== socket.id
    );

    console.log("connectedSockets", connectedSockets);
    if (
      socketRooms.length > 0 ||
      (connectedSockets && connectedSockets.size === 2)
    ) {
      socket.emit("room_join_error", {
        error: "Room is full please choose another room to play!",
      });
    } else {
      await socket.join(message.roomId);
      socket.emit("room_joined");

      if (io.sockets.adapter.rooms.get(message.roomId).size === 2) {
        socket.emit("start_game", { start: true, symbol: "x" });
        socket
          .to(message.roomId)
          .emit("start_game", { start: false, symbol: "o" });
      }
    }
  });

  socket.on("disconnect", () => {
    const userId = Array.from(connectedUsers.keys()).find(
      (key) => connectedUsers.get(key).socketId === socket.id
    );
    if (userId) {
      connectedUsers.delete(userId);
      console.log(`User ${userId} disconnected`);
      socket.broadcast.emit(
        "connected_users",
        Array.from(connectedUsers.values())
      );
      // socket.emit("connected_users", Array.from(connectedUsers.values()));
    }
    socket.broadcast.emit("callEnded");
    // const userId = socket.handshake.query.userId;
    // connectedUsers.delete(userId);
    // console.log(`User ${userId} disconnected`);

    socket.emit("connected_users", Array.from(connectedUsers.values()));
  });
});

const getSocketGameRoom = (socket) => {
  const socketRooms = Array.from(socket.rooms.values()).filter(
    (r) => r !== socket.id
  );
  const gameRoom = socketRooms && socketRooms[0];

  return gameRoom;
};

mongoose.connect(process.env.DB_CONNECTION).then(() => {
  http.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
  });
});

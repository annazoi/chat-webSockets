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

// const wsServer = new ws.Server({ server: http });
const connectedUsers = new Map();

// wsServer.on("connection", (ws) => {
//   console.log(`socket connected`, ws.id);

//   ws.on("message", (message) => {
//     console.log("MESSAGEEE", message);
//     const data = JSON.parse(message);

//     if (data.type === "login") {
//       ws.username = data.username;
//       ws.avatar = data.avatar;
//       ws.userId = data.userId;

//       connectedUsers.set(ws.username, {
//         ws,
//         username: data.username,
//         avatar: data.avatar,
//         userId: data.userId,
//       });

//       console.log(`User ${ws.username} logged in with userId: ${ws.userId}`);
//       broadcastConnectedUsers();
//     }

//     if (data.type === "join_room") {
//       ws.room = data.room; //
//       console.log(`user joined room: ${data.room}`);
//     }

//     if (data.type === "send_message") {
//       wsServer.clients.forEach((client) => {
//         client.send(
//           JSON.stringify({
//             type: "receive_message",
//             message: data.message,
//           })
//         );
//       });
//       console.log("receive_message", data);
//     }

//     if (data.type === "public_chat") {
//       wsServer.clients.forEach((client) => {
//         client.send(
//           JSON.stringify({
//             type: "public_chat",
//             message: data.message,
//             username: data.username,
//             userId: data.userId,
//             avatar: data.avatar,
//           })
//         );
//       });

//       console.log("public_chat", data);
//     }

//     if (data.type === "dispatchEvent") {
//       wsServer.clients.forEach((client) => {
//         client.send(
//           JSON.stringify({
//             type: "onEvent",
//             data: data.data,
//           })
//         );
//       });
//       console.log("dispatchEvent", data);
//     }

//     if (data.type === "callUser") {
//       forwardToUser(data.targetUserId, {
//         type: "callAccepted",
//         from: data.userId,
//         username: data.username,
//         signal: data.signal,

//         // avatar: data.avatar,
//       });
//       console.log("callUser", data);
//     }

//     if (data.type === "answerCall") {
//       forwardToUser(data.targetUserId, {
//         type: "answerCall",
//         signal: data.signal,
//         to: data.userId,
//       });
//       console.log("answerCall", data);
//     }
//   });

//   ws.on("close", () => {
//     console.log("user disconnected");
//   });

//   ws.on("error", (err) => {
//     console.log(`connect_error due to ${err.message}`);
//   });
// });

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
      socket.to(data.userChat).emit("receive_message", data);
    });
  });

  socket.on("public_chat", (data) => {
    console.log("public_chat", data);
    socket.broadcast.emit("receive_public_chat", data);
  });

  socket.on("callUser", (data) => {
    socket.to(data.userToCall).emit("callUser", {
      signal: data.signalData,
      from: data.from,
      name: data.name,
    });
  });

  socket.on("answerCall", (data) => {
    io.to(data.to).emit("callAccepted", data.signal);
  });

  socket.on("disconnect", () => {
    socket.broadcast.emit("callEnded");
    const userId = socket.handshake.query.userId;
    connectedUsers.delete(userId);
    // console.log(`User ${userId} disconnected`);

    io.emit("connected_users", Array.from(connectedUsers.values()));
  });
});

mongoose.connect(process.env.DB_CONNECTION).then(() => {
  http.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
  });
});

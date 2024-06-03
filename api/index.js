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
const ws = require("ws");

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

const wsServer = new ws.Server({ server: http });
const connectedUsers = new Map();

wsServer.on("connection", (ws) => {
  console.log(`user connected`);

  ws.on("message", (message) => {
    const data = JSON.parse(message);

    if (data.type === "login") {
      ws.username = data.username;
      ws.avatar = data.avatar;
      ws.userId = data.userId;

      connectedUsers.set(ws.username, {
        ws,
        username: data.username,
        avatar: data.avatar,
        userId: data.userId,
      });

      console.log(`User ${ws.username} logged in with userId: ${ws.userId}`);
      broadcastConnectedUsers();
    }

    if (data.type === "join_room") {
      ws.room = data.room; //
      console.log(`user joined room: ${data.room}`);
    }

    if (data.type === "send_message") {
      wsServer.clients.forEach((client) => {
        // if (client.room === data.room) {
        client.send(
          JSON.stringify({
            type: "receive_message",
            message: data.message,
          })
        );
        // }
      });
      console.log("receive_message", data);
    }

    if (data.type === "public_chat") {
      wsServer.clients.forEach((client) => {
        client.send(
          JSON.stringify({
            type: "public_chat",
            message: data.message,
            username: data.username,
            userId: data.userId,
            avatar: data.avatar,
          })
        );
      });

      console.log("public_chat", data);
    }
  });

  ws.on("close", () => {
    console.log("user disconnected");
  });

  ws.on("error", (err) => {
    console.log(`connect_error due to ${err.message}`);
  });
});

function broadcastConnectedUsers() {
  // const usersList = Array.from(connectedUsers.keys());
  const usersList = Array.from(connectedUsers.values()).map((user) => ({
    username: user.username,
    avatar: user.avatar,
    userId: user.userId,
  }));
  wsServer.clients.forEach((client) => {
    client.send(JSON.stringify({ type: "connected_users", users: usersList }));
  });
}

mongoose.connect(process.env.DB_CONNECTION).then(() => {
  http.listen(8080, () => {
    console.log(`Server is running on port ${PORT}.`);
  });
});

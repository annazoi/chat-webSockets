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
app.use("/chat", chatRoutes);

mongoose.connect(process.env.DB_CONNECTION).then(() => {
  http.listen(8080, () => {
    console.log(`Server is running on port ${PORT}.`);
  });
});

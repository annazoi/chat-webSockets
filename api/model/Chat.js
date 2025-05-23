const mongoose = require("mongoose");
const User = require("../model/User");
const moment = require("moment-timezone");
moment.tz.setDefault("Europe/Athens");

const messageSchema = mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
    },
    createdAt: {
      type: String,
      default: () => moment().format("YYYY-MM-DD HH:mm:ss"),
    },
    image: {
      type: String,
    },
  },
  { timestamps: true }
);

const chatSchema = mongoose.Schema({
  name: {
    type: String,
  },
  type: {
    type: String,
    enum: ["private", "group"],
    required: true,
  },
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  members: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "User",
    required: true,
  },

  messages: {
    type: [messageSchema],
    required: true,
  },
});

module.exports = mongoose.model("Chat", chatSchema);

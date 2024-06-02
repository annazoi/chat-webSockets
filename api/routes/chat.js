const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chat");
const { protect } = require("../middlewares/authMiddleware");
const messageController = require("../controllers/message");

router.post("/", protect, chatController.createChat);
router.get("/", protect, chatController.getChats);
router.get("/:id", protect, chatController.getChat);

router.post("/:chatId/messages", protect, messageController.sendMessage);

module.exports = router;

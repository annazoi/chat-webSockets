const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chat");
const { protect } = require("../middlewares/authMiddleware");

router.post("/", protect, chatController.createChat);
router.get("/:id", protect, chatController.getChat);
router.get("/", protect, chatController.getChats);

module.exports = router;

const Chat = require("../model/Chat");

const createChat = async (req, res) => {
  const { name, type, members } = req.body;
  try {
    if (type === "private") {
      const existingChat = await Chat.findOne({
        type: "private",
        members: { $all: members },
      });
      if (existingChat) {
        return res
          .status(200)
          .json({ message: "return existing chat", chat: existingChat });
      }
    }
    const chat = await Chat.create({
      name,
      type,
      creatorId: req.userId,
      members,
    });
    res.status(201).json({ message: "Chat created", chat: chat });
  } catch (error) {
    res.status(500).json({ message: error.message, chat: null });
  }
};

const getChat = async (req, res) => {
  const chatId = req.params.id;
  try {
    const chat = await Chat.findById(chatId).populate(
      "members creatorId messages.senderId"
    );
    res.status(200).json({ message: "Chat found", chat: chat });
  } catch (error) {
    res.status(500).json({ message: error.message, chat: null });
  }
};

const getChats = async (req, res) => {
  try {
    const chats = await Chat.find({ members: req.userId }).populate(
      "members creatorId messages.senderId"
    );
    res.status(200).json({ message: "Chats found", chats: chats });
  } catch (error) {
    res.status(500).json({ message: error.message, chats: null });
  }
};

exports.createChat = createChat;
exports.getChat = getChat;
exports.getChats = getChats;

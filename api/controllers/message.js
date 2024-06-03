const Chat = require("../model/Chat");
const uploadImage = require("../lib/uploadImage");

const sendMessage = async (req, res) => {
  try {
    const { image } = req.body;
    let result;
    if (image) {
      result = await uploadImage(image);
    }
    console.log(image);

    const chat = await Chat.findById(req.params.chatId);
    chat.messages.push({
      senderId: req.userId,
      message: req.body.message || "",
      image: result || "",
    });

    await chat.populate("members creatorId messages.senderId");

    await chat.save();

    res.status(200).json({ message: "message sent successfully", chat: chat });
  } catch (err) {
    res.status(500).json({ message: err, chat: null });
    console.log(err);
  }
};

exports.sendMessage = sendMessage;

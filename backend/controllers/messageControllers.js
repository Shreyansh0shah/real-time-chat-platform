const asyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");

//@description     Get all Messages
//@route           GET /api/message/:chatId
//@access          Protected
const allMessages = asyncHandler(async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name pic email")
      .populate({
        path: "replyTo",
        populate: { path: "sender", select: "name pic email" },
      })
      .populate("chat");
    res.json(messages);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

//@description     Create New Message
//@route           POST /api/message/
//@access          Protected
const sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId, fileUrl, fileType, replyTo } = req.body;

  if ((!content && !fileUrl) || !chatId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  var newMessage = {
    sender: req.user._id,
    content: content || "",
    fileUrl: fileUrl,
    fileType: fileType,
    chat: chatId,
    replyTo: replyTo || null,
  };

  try {
    var message = await Message.create(newMessage);

    message = await message.populate("sender", "name pic").execPopulate();
    message = await message.populate("chat").execPopulate();
    message = await User.populate(message, {
      path: "chat.users",
      select: "name pic email",
    });
    message = await message.populate({
      path: "replyTo",
      populate: { path: "sender", select: "name pic email" },
    });

    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

    res.json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

//@description     Edit Message
//@route           PUT /api/message/:messageId
//@access          Protected
const editMessage = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const messageId = req.params.messageId;

  if (!content) {
    res.status(400);
    throw new Error("Content is required to edit message");
  }

  const message = await Message.findById(messageId);
  if (!message) {
    res.status(404);
    throw new Error("Message not found");
  }

  if (message.sender.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error("Not authorized to edit this message");
  }

  message.content = content;
  message.isEdited = true;
  await message.save();

  const updatedMessage = await Message.findById(messageId)
    .populate("sender", "name pic email")
    .populate({
      path: "replyTo",
      populate: { path: "sender", select: "name pic email" },
    })
    .populate("chat");

  res.json(updatedMessage);
});

//@description     Delete Message
//@route           DELETE /api/message/:messageId
//@access          Protected
const deleteMessage = asyncHandler(async (req, res) => {
  const messageId = req.params.messageId;
  const message = await Message.findById(messageId);

  if (!message) {
    res.status(404);
    throw new Error("Message not found");
  }

  if (message.sender.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error("Not authorized to delete this message");
  }

  await message.remove();

  // update latestMessage if the deleted message was latest
  const chat = await Chat.findById(message.chat).populate("latestMessage");
  if (chat.latestMessage && chat.latestMessage._id.toString() === messageId.toString()) {
    const latestMessage = await Message.findOne({ chat: chat._id })
      .sort({ createdAt: -1 })
      .populate("sender", "name pic email")
      .populate({
        path: "replyTo",
        populate: { path: "sender", select: "name pic email" },
      })
      .populate("chat");
    await Chat.findByIdAndUpdate(chat._id, { latestMessage: latestMessage || null });
  }

  res.json({ message: "Message deleted" });
});

module.exports = { allMessages, sendMessage, editMessage, deleteMessage };

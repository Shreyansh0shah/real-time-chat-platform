const mongoose = require("mongoose");

const messageSchema = mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    content: { type: String, trim: true },
    fileUrl: { type: String, default: "" },
    fileType: { type: String, default: "text" },
    chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
    replyTo: { type: mongoose.Schema.Types.ObjectId, ref: "Message", default: null },
    isDelivered: { type: Boolean, default: false },
    isEdited: { type: Boolean, default: false },
    isSeen: { type: Boolean, default: false },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;
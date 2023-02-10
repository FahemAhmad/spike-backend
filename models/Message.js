const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  conversationType: {
    type: String,
    enum: ["one-to-one", "group"],
    required: true,
  },
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: "conversationType",
  },
  messageType: {
    type: String,
    enum: ["text", "attachment"],
    required: true,
  },
  text: {
    type: String,
  },
  attachment: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  read: {
    type: Boolean,
    default: false,
  },
});

exports.Message = mongoose.model("Message", messageSchema);

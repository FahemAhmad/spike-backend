const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const groupChatSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  members: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  ],
  messages: [
    {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
  ],
});

exports.ChatGroup = mongoose.model("ChatGroup", groupChatSchema);

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const groupChatSchema = new Schema({
  name: {
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
      type: messageSchema,
    },
  ],
});

exports.ChatGroup = mongoose.model("ChatGroup", groupChatSchema);

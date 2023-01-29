const mongoose = require("mongoose");
const { Schema } = mongoose;

const oneToOneChatSchema = new Schema({
  users: [
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

exports.OneToOneChat = mongoose.model("OneToOneChat", oneToOneChatSchema);

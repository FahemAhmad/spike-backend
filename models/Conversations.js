const mongoose = require("mongoose");

let conversationSchema = mongoose.Schema(
  {
    members: {
      type: [mongoose.Schema.Types.ObjectId],
      required: true,
    },
    readMessageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
    counter: {
      type: Number,
      default: 0,
    },
  },

  { timestamps: true }
);

conversationSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

conversationSchema.set("toJSON", { virtuals: true });

exports.Conversations = mongoose.model("Conversations", conversationSchema);

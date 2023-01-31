const mongoose = require("mongoose");

const EventsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  eventType: {
    type: String,
    default: "personal",
    enum: ["shared", "personal"],
  },
  eventTime: {
    type: String,
  },
  sharedWith: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

exports.Events = mongoose.model("Events", EventsSchema);

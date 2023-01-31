const mongoose = require("mongoose");

const NotesSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  noteType: {
    type: String,
    default: "personal",
    enum: ["shared", "personal"],
  },
  sharedWith: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

exports.Notes = mongoose.model("Notes", NotesSchema);

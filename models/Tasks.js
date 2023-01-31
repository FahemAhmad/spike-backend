const mongoose = require("mongoose");

const TasksSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },

  taskType: {
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

exports.Tasks = mongoose.model("Tasks", TasksSchema);

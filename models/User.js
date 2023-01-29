const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  accountStatus: {
    type: String,
    enum: ["active", "inactive", "googleSignIn"],
  },
  password: {
    type: String,
  },
  profilePicture: String,
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  chatGroups: [{ type: mongoose.Schema.Types.ObjectId, ref: "ChatGroup" }],
});

userSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

userSchema.set("toJSON", { virtuals: true });

exports.User = mongoose.model("User", userSchema);

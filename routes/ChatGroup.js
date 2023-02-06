const express = require("express");
const router = express.Router();
const { ChatGroup } = require("../models/ChatGroup");
const { User } = require("../models/User");
const multer = require("multer");
const { Message } = require("../models/Message");

const FILE_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const filepath = "public/uploads";

    cb(null, filepath);
  },
  filename: function (req, file, cb) {
    const extension = FILE_TYPE_MAP[file.mimetype];
    cb(
      null,
      file.originalname.split(" ").join("-") +
        "-" +
        Date.now() +
        "." +
        extension
    );
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
  fileFilter: fileFilter,
});

router.post("/create", async (req, res) => {
  const { title, members } = req.body;

  try {
    // Check if all members are valid users
    let memberIds = [];
    for (const email of members) {
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error(`User with email ${email} does not exist`);
      }
      memberIds.push(user._id);
    }

    // Add the current user to the members list
    const currentUserId = req.auth.id;
    if (!memberIds.includes(currentUserId)) {
      memberIds.push(currentUserId);
    }

    // Remove duplicates from the members list
    memberIds = Array.from(new Set(memberIds));

    // Check if the group title is unique
    const existingGroup = await ChatGroup.findOne({ title: title });
    if (existingGroup) {
      throw new Error(`Group with title ${title} already exists`);
    }

    const groupChat = new ChatGroup({ title, members: memberIds });
    await groupChat.save();

    // Add the newly created group to each member's chatGroups list
    for (const memberId of memberIds) {
      const user = await User.findById(memberId);
      user.chatGroups.push(groupChat._id);
      await user.save();
    }

    res.status(201).json({
      message: "Group chat created successfully",
      groupChat,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error creating group chat",
      error: err.message,
    });
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const groupChat = await ChatGroup.findById(id).populate("members");
    if (!groupChat)
      return res.status(404).json({ message: "Group chat not found" });
    res.json({ groupChat });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching group chat", error: err.message });
  }
});

// Send message or attachment in group chat
router.post(
  "/:groupChatId/message",
  upload.single("content"),
  async (req, res) => {
    try {
      // Find the one-to-one chat by sender and receiver ID

      let oneToOneChat = await ChatGroup.findById(req.params.groupChatId);

      // Create a new message object with the sender and content
      let message = {
        sender: req.auth.id,
        conversationType: "group",
        conversationId: oneToOneChat._id,
      };

      if (req.body.type === "text") {
        message.text = req.body.content;
        message.messageType = "text";
      }
      let fileName;
      let basePath;

      if (req.body.type === "file") {
        fileName = req.file.filename;
        basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;

        message.attachment = `${basePath}${fileName}`;
        message.messageType = "attachment";
      }
      //create the message in db
      const messageDb = new Message(message);
      await messageDb.save();

      // Add the message id to the one-to-one chat's messages array
      oneToOneChat.messages.push(messageDb._id);
      await oneToOneChat.save();

      // Return the message to the client
      res.json(messageDb);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

router.get("/:id/messages", async (req, res) => {
  try {
    const groupChat = await ChatGroup.findById(req.params.id)
      .populate("messages")
      .exec();
    if (!groupChat) {
      throw new Error(`Group chat with id ${req.params.id} does not exist`);
    }

    res.status(200).json({
      message: "Messages retrieved successfully",
      messages: groupChat.messages,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error retrieving messages",
      error: err.message,
    });
  }
});

module.exports = router;

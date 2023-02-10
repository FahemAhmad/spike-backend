const express = require("express");
const router = express.Router();

const multer = require("multer");

const { OneToOneChat } = require("../models/OneToOneChat");
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

router.put("/mark-as-read", async (req, res) => {
  const friendId = req.body.friendId;
  const userId = req.auth.id;
  const chat = await OneToOneChat.findOne({
    users: {
      $all: [userId, friendId],
    },
  }).populate("messages");

  if (!chat) {
    return res.status(404).json({
      message: "Chat not found",
    });
  }

  const promises = chat.messages.map(async (message) => {
    if (message.sender.toString() !== userId.toString()) {
      message.read = true;
      await message.save();
    }
  });

  await Promise.all(promises);
  res.status(200).json({
    message: "Messages marked as read.",
  });
});

//get all chat
router.get("/:userId", async (req, res) => {
  try {
    // Find the one-to-one chat between the current user and the provided user ID
    const oneToOneChat = await OneToOneChat.findOne({
      users: { $all: [req.auth.id, req.params.userId] },
    });

    // Check if the one-to-one chat exists
    if (!oneToOneChat) {
      return res.status(404).json({
        error:
          "No one-to-one chat exists between the current user and the provided user.",
      });
    }

    // Find all the messages in the one-to-one chat
    const messages = await Message.find({ conversationId: oneToOneChat._id });

    // Return the messages to the client
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//send a message
router.post("/:id/message", upload.single("content"), async (req, res) => {
  try {
    // Find the one-to-one chat by sender and receiver ID
    let oneToOneChat = await OneToOneChat.findOne({
      users: { $all: [req.auth.id, req.params.id] },
    });

    if (!oneToOneChat) {
      // Create a new one-to-one chat if it doesn't exist
      oneToOneChat = new OneToOneChat({
        users: [req.auth.id, req.params.id],
        messages: [],
      });
      await oneToOneChat.save();
    }

    // Create a new message object with the sender and content
    let message = {
      sender: req.auth.id,
      conversationType: "one-to-one",
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
});

module.exports = router;

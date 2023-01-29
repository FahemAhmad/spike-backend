const express = require("express");
const router = express.Router();
const { GroupChat, OneToOneChat } = require("path/to/chat/model");

router.post("/create", async (req, res) => {
  const { name, members } = req.body;

  try {
    // check if all members are valid
    // check if the group name is unique

    const groupChat = new GroupChat({ name, members });
    await groupChat.save();
    res
      .status(201)
      .json({ message: "Group chat created successfully", groupChat });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error creating group chat", error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const groupChat = await GroupChat.findById(id).populate("members", "user");
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
  [auth, check("content", "Content is required").not().isEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { content, attachment } = req.body;
      const { groupChatId } = req.params;

      let groupChat = await GroupChat.findById(groupChatId);
      if (!groupChat) {
        return res.status(404).json({ msg: "Group chat not found" });
      }

      const message = {
        content: content,
        sender: req.user.id,
      };
      if (attachment) {
        message.attachment = attachment;
      }

      groupChat.messages.unshift(message);
      await groupChat.save();

      res.json(groupChat.messages);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

module.exports = router;

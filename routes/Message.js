const express = require("express");
const { Conversations } = require("../models/Conversations");
const router = express.Router();
const { Message } = require("../models/Message");

//add message
router.post("/", async (req, res) => {
  /*
When message comes

    1- if its the same sender -> increment the counter
    2- If its another user reset the counter



      1a- To check the sender, we need to get the last text from that 
          conversation from readMessageId
      1b- If the readMessageId is null, it means this is the first text of the convo
      

  */

  const newMessage = new Message(req.body);

  const getConversation = await Conversations.findById(
    newMessage.conversationId
  );

  if (getConversation) {
    if (String(newMessage.sender) === String(getConversation.readMessageId)) {
      getConversation.counter = getConversation.counter + 1;
    } else {
      getConversation.counter = 1;
      getConversation.readMessageId = newMessage.sender;
    }

    try {
      const saveMessage = await newMessage.save();

      const response = await getConversation.save();
      if (response) res.status(200).send(saveMessage);
      else res.status(500).send("Error sending message");
    } catch (err) {
      res.status(500).json(err);
    }
  } else return res.status(500).json("Error getting conversation");
});

//get Conversation
router.get("/:conversationId", async (req, res) => {
  console.log(req.body);
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId,
    });

    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;

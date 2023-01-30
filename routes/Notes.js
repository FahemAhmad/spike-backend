const express = require("express");
const router = express.Router();
const { Notes } = require("../models/Notes");
const { User } = require("../models/User");

//create a  new note
router.post("/", async (req, res) => {
  try {
    const emailArray = req.body.shared;
    const sharedWithIds = [];

    for (const email of emailArray) {
      const user = await User.findOne({ email: email });
      sharedWithIds.push(user._id);
    }

    const note = new Notes({
      title: req.body.title,
      description: req.body.description,
      sharedWith: [...sharedWithIds, req.auth.id],
    });

    let sharedWith = new Set(note.sharedWith);
    console.log("sharedWith", sharedWith);
    note.sharedWith = [...sharedWith];
    console.log("note", note);

    const savedNote = await note.save();
    res.json({ data: savedNote, message: "Note Added" });
  } catch (error) {
    res.status(400).json({ message: error });
  }
});

// Delete a task
router.delete("/:id", async (req, res) => {
  try {
    const deletedNote = await Notes.findByIdAndDelete(req.params.id);
    if (!deletedNote) {
      return res.status(404).send("Note not found");
    }
    res.send(deletedNote);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Get logged in user's tasks
router.get("/mytasks", async (req, res) => {
  try {
    const userId = req.auth.id;
    const notes = await Notes.find({
      sharedWith: { $elemMatch: { $eq: userId } },
    }).populate("sharedWith", "email");
    res.send(notes);
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;

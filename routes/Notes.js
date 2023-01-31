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

    let noteType = "personal";
    if (emailArray.length > 0) {
      noteType = "shared";
    }

    const note = new Notes({
      title: req.body.title,
      description: req.body.description,
      sharedWith: [...sharedWithIds, req.auth.id],
      noteType: noteType,
    });

    let sharedWith = new Set(note.sharedWith);
    note.sharedWith = [...sharedWith];

    const savedNote = await (await note.save()).populate("sharedWith", "email");
    res.json({ data: savedNote, message: "Note Added" });
  } catch (error) {
    res.status(400).json({ message: error });
  }
});

// Delete a task
router.delete("/:id", async (req, res) => {
  try {
    const deletedNote = await Notes.findByIdAndDelete(req.params.id);
    console.log("deletednoe", deletedNote);
    if (!deletedNote) {
      return res.status(404).json({ message: "Note not found" });
    }
    res.send(deletedNote);
  } catch (error) {
    res.status(400).send(error);
  }
});

//Get all tasks
router.get("/mytasks", async (req, res) => {
  try {
    const userId = req.auth.id;
    const notes = await Notes.find({
      sharedWith: { $elemMatch: { $eq: userId } },
      notesType: "personal",
    }).populate("sharedWith", "email");
    res.send(notes);
  } catch (error) {
    res.status(400).send(error);
  }
});

//Update endpoint
router.patch("/:id", async (req, res) => {
  try {
    const note = await Notes.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!note) return res.status(404).json({ message: "Note not found" });
    res.send(note);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.get("/shared/:email", async (req, res) => {
  const user1 = req.auth.id;
  const email = req.params.email;

  try {
    const user2 = await User.findOne({ email: email }).select("_id");
    if (!user2) {
      return res.status(400).json({ message: "User not found" });
    }
    const notes = await Notes.find({
      sharedWith: { $in: [user1, user2._id] },
    }).populate("sharedWith", "email");
    const sharedNotes = notes.filter((note) => {
      let res = note.sharedWith.some((e) => e._id === user1);
      let res2 = note.sharedWith.some((e) => e._id === user2._id);
      return true;
    });
    res.json(sharedNotes);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Logic 1
// app.get("/notes/shared/:user1/:user2", (req, res) => {
//     const { user1, user2 } = req.params;
//     Note.find({
//       $and: [
//         { shared: { $in: [user1, user2] } },
//         { shared: { $in: [user2, user1] } },
//       ],
//     })
//       .then((notes) => res.json(notes))
//       .catch((err) => res.status(400).json({ message: err.message }));
//   });

module.exports = router;

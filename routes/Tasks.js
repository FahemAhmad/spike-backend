const express = require("express");
const router = express.Router();
const { Tasks } = require("../models/Tasks");
const { User } = require("../models/User");

//create a  new task
router.post("/", async (req, res) => {
  console.log("post a new task");
  try {
    const emailArray = req.body.shared;
    const sharedWithIds = [];

    for (const email of emailArray) {
      const user = await User.findOne({ email: email });
      sharedWithIds.push(user._id);
    }

    let taskType = "personal";
    if (emailArray.length > 0) {
      taskType = "shared";
    }

    const task = new Tasks({
      title: req.body.title,
      sharedWith: [...sharedWithIds, req.auth.id],
      taskType: taskType,
    });

    let sharedWith = new Set(task.sharedWith);
    task.sharedWith = [...sharedWith];

    const savedtask = await (await task.save()).populate("sharedWith", "email");
    res.json({ data: savedtask, message: "task Added" });
  } catch (error) {
    res.status(400).json({ message: error });
  }
});

// Delete a task
router.delete("/:id", async (req, res) => {
  try {
    const deletedtask = await Tasks.findByIdAndDelete(req.params.id);
    console.log("deletednoe", deletedtask);
    if (!deletedtask) {
      return res.status(404).json({ message: "task not found" });
    }
    res.send(deletedtask);
  } catch (error) {
    res.status(400).send(error);
  }
});

//Get all tasks
router.get("/mytasks", async (req, res) => {
  try {
    const userId = req.auth.id;
    const tasks = await Tasks.find({
      sharedWith: { $elemMatch: { $eq: userId } },
      taskType: "personal",
    }).populate("sharedWith", "email");

    res.send(tasks);
  } catch (error) {
    res.status(400).send(error);
  }
});

//Update endpoint
router.patch("/:id", async (req, res) => {
  try {
    const task = await Tasks.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!task) return res.status(404).json({ message: "task not found" });
    res.send(task);
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
    const tasks = await Tasks.find({
      sharedWith: { $in: [user1, user2._id] },
    }).populate("sharedWith", "email");

    const sharedTasks = tasks.filter((task) => {
      let res = task.sharedWith.some(
        (e) => e._id.toString() === user1.toString()
      );
      let res2 = task.sharedWith.some(
        (e) => e._id.toString() === user2._id.toString()
      );
      return res & res2;
    });
    res.json(sharedTasks);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;

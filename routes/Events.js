const express = require("express");
const router = express.Router();
const { Events } = require("../models/Events");
const { User } = require("../models/User");

//create a  new event
router.post("/", async (req, res) => {
  try {
    const emailArray = req.body.shared;
    const sharedWithIds = [];

    for (const email of emailArray) {
      const user = await User.findOne({ email: email });
      sharedWithIds.push(user._id);
    }

    let eventType = "personal";
    if (emailArray.length > 0) {
      eventType = "shared";
    }

    const event = new Events({
      title: req.body.title,
      description: req.body.description,
      sharedWith: [...sharedWithIds, req.auth.id],
      eventTime: req.body.eventTime,
      eventType: eventType,
    });

    let sharedWith = new Set(event.sharedWith);
    event.sharedWith = [...sharedWith];

    const savedEvent = await (
      await event.save()
    ).populate("sharedWith", "email");
    res.json({ data: savedEvent, message: "Event Added" });
  } catch (error) {
    res.status(400).json({ message: error });
  }
});

// Delete a event
router.delete("/:id", async (req, res) => {
  try {
    const deletedEvent = await Events.findByIdAndDelete(req.params.id);
    if (!deletedEvent) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.send(deletedEvent);
  } catch (error) {
    res.status(400).send(error);
  }
});

//Get all events
router.get("/myevents", async (req, res) => {
  try {
    const userId = req.auth.id;
    const events = await Events.find({
      sharedWith: { $elemMatch: { $eq: userId } },
      eventType: "personal",
    }).populate("sharedWith", "email");
    res.send(events);
  } catch (error) {
    res.status(400).send(error);
  }
});

//Update endpoint
router.patch("/:id", async (req, res) => {
  try {
    const event = await Events.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.send(event);
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
    const events = await Events.find({
      sharedWith: { $in: [user1, user2._id] },
    }).populate("sharedWith", "email");
    const sharedEvents = events.filter((event) => {
      let res = event.sharedWith.some(
        (e) => e._id.toString() === user1.toString()
      );
      let res2 = event.sharedWith.some(
        (e) => e._id.toString() === user2._id.toString()
      );
      return ress & res2;
    });
    res.json(sharedEvents);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Logic 1
// app.get("/events/shared/:user1/:user2", (req, res) => {
//     const { user1, user2 } = req.params;
//     Event.find({
//       $and: [
//         { shared: { $in: [user1, user2] } },
//         { shared: { $in: [user2, user1] } },
//       ],
//     })
//       .then((events) => res.json(events))
//       .catch((err) => res.status(400).json({ message: err.message }));
//   });

module.exports = router;

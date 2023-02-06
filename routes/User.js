const { OAuth2Client } = require("google-auth-library");
const { ChatGroup } = require("../models/ChatGroup");
const router = require("express").Router();
const { User } = require("../models/User");

//search friends
router.get("/search", (req, res) => {
  const input = req.query.input;
  const email = new RegExp(input, "i");

  User.find({ email: email }, { password: 0 })
    .limit(5)
    .exec((err, users) => {
      if (err) {
        return res.status(500).json({ message: "Error searching for users" });
      }

      if (!users) {
        return res.status(404).json({ message: "Users not found" });
      }
      res.json(users);
    });
});

//get current friends
router.get("/friends", async (req, res) => {
  const user = await User.findOne({ email: req.auth.email }).populate(
    "friends",
    "name email profilePicture accountStatus"
  );

  res.status(201).json({ data: user.friends });
});

//add friends
router.put("/addfriend", (req, res) => {
  const currentUserEmail = req.auth.email;
  const friendEmail = req.body.friendEmail;

  User.findOne({ email: currentUserEmail }, (err, currentUser) => {
    if (err) {
      return res.status(500).json({ message: "Error finding current user" });
    }

    if (!currentUser) {
      return res.status(404).json({ message: "Current user not found" });
    }

    User.findOne({ email: friendEmail }, (err, friend) => {
      if (err) {
        return res.status(500).json({ message: "Error finding friend" });
      }

      if (!friend) {
        return res.status(404).json({ message: "Friend not bidirectional" });
      }

      if (currentUser.friends.includes(friend._id)) {
        return res.status(409).json({ message: "Friend already exists" });
      }

      currentUser.friends.push(friend._id);
      friend.friends.push(currentUser._id);
      currentUser.save((err) => {
        if (err) {
          return res.status(500).json({ message: "Error adding friend" });
        }
        friend.save((err) => {
          if (err) {
            return res.status(500).json({ message: "Error adding friend" });
          }
          res.json({ message: "Friend added successfully" });
        });
      });
    });
  });
});

router.get("/chatGroups", async (req, res) => {
  const userId = req.auth.id;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const chatGroups = await ChatGroup.find({
      _id: { $in: user.chatGroups },
    });

    res.json({ chatGroups });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error retrieving chat groups", error: err.message });
  }
});

module.exports = router;

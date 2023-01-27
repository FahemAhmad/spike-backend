const { OAuth2Client } = require("google-auth-library");
const router = require("express").Router();
const { User } = require("../models/User");

router.get("/friends", async (req, res) => {
  console.log("req", req);
  const user = await User.findById(req.body.id).populate("friends");

  res.status(201).send(user);
});

module.exports = router;

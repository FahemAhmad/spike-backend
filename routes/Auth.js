const { OAuth2Client } = require("google-auth-library");
const router = require("express").Router();
const jwt = require("jsonwebtoken");
const { User } = require("../models/User");
const bcrypt = require("bcrypt");
const multer = require("multer");

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
const upload = multer({ storage: storage });

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

async function verifyGoogleToken(token) {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });

    return { payload: ticket.getPayload() };
  } catch (error) {
    return { error: "Invalid user detected. Please try again" };
  }
}

router.post("/signup", upload.single("picture"), async (req, res) => {
  try {
    let profile;
    if (req.body.credential) {
      const verificationResponse = await verifyGoogleToken(req.body.credential);
      if (verificationResponse.error) {
        return res.status(400).json({
          message: verificationResponse.error,
        });
      }
      profile = verificationResponse?.payload;
      profile.given_name = profile?.given_name + " " + profile?.family_name;
      profile.accountStatus = "googleSignIn";
    } else {
      const fileName = req.file.filename;
      const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
      if (!req.body.password)
        return res.status(400).json({ message: "Invalid Input" });

      profile = {
        given_name: req.body.firstName + " " + req.body.lastName,
        email: req.body.email,
        password: req.body.password,
        profilePicture: `${basePath}${fileName}`,
        accountStatus: "active",
      };
    }

    let isUser = await User.findOne({ email: profile?.email });
    if (isUser) {
      // Check if the user has logged in with Google
      if (profile?.accountStatus === "googleSignIn") {
        // Return the user object with login response if the user already exists
        return res.status(200).json({
          message: "Login successful",
          user: {
            name: isUser.name,
            picture: profile?.profilePicture,
            email: isUser.email,
            id: isUser._id,
            token: jwt.sign(
              { email: isUser.email, id: isUser._id },
              process.env.JWT_SECRET,
              {}
            ),
          },
        });
      } else {
        return res.status(400).json({
          message: "User with this email already exists",
        });
      }
    }

    const user = new User({
      name: profile?.given_name,
      email: profile?.email,
      profilePicture: profile?.profilePicture,
      accountStatus: profile?.accountStatus,

      password: req.body.password
        ? await bcrypt.hash(req.body.password, 10)
        : undefined,
    });

    await user.save();

    res.status(201).json({
      message: "Signup was successful",
      user: {
        name: profile?.given_name,
        picture: profile?.profilePicture,
        email: profile?.email,
        id: user._id,
        token: jwt.sign(
          { email: user.email, id: user._id },
          process.env.JWT_SECRET,
          {}
        ),
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred. Registration failed.",
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    let profile;
    if (req.body.credential) {
      const verificationResponse = await verifyGoogleToken(req.body.credential);
      if (verificationResponse.error) {
        return res.status(400).json({
          message: verificationResponse.error,
        });
      }
      profile = verificationResponse?.payload;
    } else {
      profile = req.body;
    }

    const user = await User.findOne({ email: profile.email });

    if (!user) {
      return res.status(400).json({
        message: "You are not registered. Please sign up",
      });
    }
    if (user.accountStatus !== "active") {
      return res.status(400).json({
        message: "Your account is not active. Please contact admin.",
      });
    }
    const match = await bcrypt.compare(profile.password, user.password);
    if (!match) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    res.status(201).json({
      message: "Login was successful",
      user: {
        name: user.name,
        picture: user.profilePicture,
        email: user.email,
        id: user._id,
        token: jwt.sign(
          { email: user.email, id: user._id },
          process.env.JWT_SECRET,
          {}
        ),
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || error,
    });
  }
});
module.exports = router;

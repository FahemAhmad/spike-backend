const { OAuth2Client } = require("google-auth-library");
const router = require("express").Router();
const jwt = require("jsonwebtoken");
const { User } = require("../models/User");
const bcrypt = require("bcrypt");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const filepath = "public/uploads";

    cb(null, filepath);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname.split(" ").join("-") + "-" + Date.now());
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
      profile.accountStatus = "googleSignIn";
    } else {
      const fileName = req.file.filename;
      const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
      profile = {
        given_name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        profilePicture: `${basePath}${fileName}`,
        accountStatus: "active",
      };
    }

    let isUser = await User.findOne({ email: profile?.email });
    if (isUser) {
      return res.status(400).json({
        message: "User with this email already exists",
      });
    }

    const user = new User({
      name: profile?.given_name + " " + profile?.family_name,
      email: profile?.email,
      profilePicture: profile?.picture,
      accountStatus: profile?.accountStatus,
      password: req.body.password
        ? await bcrypt.hash(req.body.password, 10)
        : undefined,
    });

    await user.save();

    res.status(201).json({
      message: "Signup was successful",
      user: {
        name: profile?.given_name + " " + profile?.family_name,
        picture: profile?.picture,
        email: profile?.email,
        token: jwt.sign({ email: profile?.email }, process.env.JWT_SECRET, {
          expiresIn: "1d",
        }),
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
    if (req.body.credential) {
      const verificationResponse = await verifyGoogleToken(req.body.credential);
      if (verificationResponse.error) {
        return res.status(400).json({
          message: verificationResponse.error,
        });
      }

      const profile = verificationResponse?.payload;

      const existsInDB = await User.find({ email: person?.email });

      if (!existsInDB) {
        return res.status(400).json({
          message: "You are not registered. Please sign up",
        });
      }

      res.status(201).json({
        message: "Login was successful",
        user: {
          firstName: profile?.given_name,
          lastName: profile?.family_name,
          picture: profile?.picture,
          email: profile?.email,
          token: jwt.sign({ email: profile?.email }, process.env.JWT_SECRET, {
            expiresIn: "1d",
          }),
        },
      });
    }
  } catch (error) {
    res.status(500).json({
      message: error?.message || error,
    });
  }
});

module.exports = router;

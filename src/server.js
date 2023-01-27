const express = require("express");
const app = express();
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();
const authJwt = require("../helpers/jwt");
const errorHandler = require("../helpers/error-handler");

const authRouter = require("../routes/Auth");
const userRouter = require("../routes/User");

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan("tiny"));
app.use(authJwt());
app.use(errorHandler);
app.use(express.static("public/uploads"));

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);

module.exports = app;

const express = require("express");
const app = express();
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();
const authJwt = require("./helpers/jwt");
const errorHandler = require("./helpers/error-handler");

const authRouter = require("./routes/Auth");
const userRouter = require("./routes/User");
const oneToOneRouter = require("./routes/OneToOneChat");
const notesRouter = require("./routes/Notes");
const tasksRouter = require("./routes/Tasks");
const eventsRouter = require("./routes/Events");
const groupsRouter = require("./routes/ChatGroup");

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan("tiny"));
app.use(authJwt());

app.use("/public/uploads", express.static(__dirname + "/public/uploads"));
app.use(errorHandler);

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/one-to-one-chat", oneToOneRouter);
app.use("/api/v1/group-chat", groupsRouter);
app.use("/api/v1/notes", notesRouter);
app.use("/api/v1/tasks", tasksRouter);
app.use("/api/v1/events", eventsRouter);

module.exports = app;

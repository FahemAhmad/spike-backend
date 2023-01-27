const server = require("./server");
const mongoose = require("mongoose");
const io = require("socket.io")(8900, {
  cors: {
    origin: ["http://localhost:5273"],
  },
});
const socket = require("./socket")(io);
const CONNECTION_STRING = process.env.CONNECTION_STRING;
mongoose
  .connect(CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: "spike",
  })
  .then(() => {
    console.log("Database is ready");
  })
  .catch((err) => {
    console.log("Somehthing is wrong", err);
  });

const port = process.env.PORT || 5000;

const startServer = () => {
  server.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
};

startServer();

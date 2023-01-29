let users = [];

//add user to socket.io
const addUser = (userId, socketId) => {
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });
};

//remove users from socket.io
const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return users.find((user) => user.userId === userId);
};

exports = module.exports = function (io) {
  io.on("connection", (socket) => {
    //When User Connets

    socket.on("addUser", (userId) => {
      addUser(userId, socket.id);

      io.emit("getUsers", users);
    });

    socket.on("sendMessage", (props) => {
      const user = getUser(props.recieverId);

      if (user) {
        io.to(user.socketId).emit("getMessage", props);
      }
    });

    socket.on("callUser", ({ userToCall, signalData, from }) => {
      console.log("users", users);
      console.log("userToCall", userToCall);
      console.log("from", from);
      const user = getUser(userToCall);
      if (user) io.to(user.socketId).emit("incomingCall", { from, signalData });
    });

    socket.on("answer-made", ({ answer, id }) => {
      const user = getUser(props.id);

      io.to(user.socketId).emit("answer-made", { answer, id });
    });

    //When User Disconnects
    socket.on("disconnect", () => {
      removeUser(socket.id);
      io.emit("getUsers", users);
    });
  });
};

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

    socket.on("sendMessage", ({ senderId, recieverId, text }) => {
      const user = getUser(recieverId);
      console.log("text", { senderId, recieverId, text });

      if (user) {
        io.to(user.socketId).emit("getMessage", {
          senderId,
          text,
        });
      }
    });

    //When User Disconnects
    socket.on("disconnect", () => {
      removeUser(socket.id);
      io.emit("getUsers", users);
    });
  });
};

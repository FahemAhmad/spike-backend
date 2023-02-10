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

const getUsers = (userIds) => {
  return userIds.map((userId) => {
    const foundUser = users.find((user) => user.userId === userId);
    return foundUser
      ? {
          userId: foundUser.userId,
          socketId: foundUser.socketId,
        }
      : {};
  });
};

// const getUser = (userId) => {
//   return users.find((user) => user.userId === userId);
// };

exports = module.exports = function (io) {
  io.on("connection", (socket) => {
    //When User Connets

    socket.on("addUser", (userId) => {
      addUser(userId, socket.id);
    });

    socket.on("sendMessage", (props) => {
      const us = getUsers(props.recieverId);

      if (us && us.length) {
        us.forEach((user) => {
          io.to(user.socketId).emit("getMessage", props);
        });
      }
    });

    socket.on("callUser", (data) => {
      const userIds = getUsers(data.usersToCall);

      if (userIds && userIds.length) {
        userIds.forEach((user) => {
          io.to(user.socketId).emit("callUser", {
            signal: data.signalData,
            from: data.from,
            name: data.name,
          });
        });
      }
    });

    socket.on("answerCall", (data) => {
      const userIds = getUsers([data.to]);
      if (userIds && userIds.length) {
        userIds.forEach((user) => {
          io.to(user.socketId).emit("callAccepted", data.signal);
        });
      }
    });

    socket.on("endCall", (data) => {
      const userIds = getUsers([data.to]);

      if (userIds && userIds.length) {
        userIds.forEach((user) => {
          io.to(user.socketId).emit("endCall");
        });
      }
    });

    //When User Disconnects
    socket.on("disconnect", () => {
      removeUser(socket.id);
      io.emit("getUsers", users);

      socket.broadcast.emit("callEnded");
    });
  });
};

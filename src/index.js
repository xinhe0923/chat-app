const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const Filter = require("bad-words");
const {
  generateMessage,
  generateLocationMessage,
} = require("./utils/messages");
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require("./utils/users");

const app = express();
const server = http.createServer(app); //this is done by http automatically
//we define it here only to get it used by socketio down below
const io = socketio(server);
const port = process.env.PORT || 3000;

app.set("view engine", "hbs"); //get handlebars set up
const publicDirectoryPath = path.join(__dirname, "../public");
// hbs.registerPartials(viewsPath);

app.use(express.static(publicDirectoryPath));

io.on("connection", (socket) => {
  socket.on("join", ({ username, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, username, room });
    if (error) {
      return callback(error);
    }
    socket.join(user.room); //join room function can only be used on server side
    socket.emit("message", generateMessage("Admin","welcome"));
    socket.broadcast
      .to(user.room)
      .emit("message", generateMessage('Admin',`${user.username} has joined`));
    io.to(user.room).emit('roomData',{
      room:user.room,
      users:getUsersInRoom(user.room)
    })
    callback();
  });

  socket.on("sendMessage", (message, callback) => {
    const user=getUser(socket.id)
    const filter = new Filter();
    if (filter.isProfane(message)) {
      return callback("Profanity is not allowed");
    }
    io.to(user.room).emit("message", generateMessage(user.username ,message));
    callback(); //acknowledgement
  });
  socket.on("sendLocation", (coords, callback) => {
    const user=getUser(socket.id)
    io.to(user.room).emit(
      "locationMessage",
      generateLocationMessage(user.username,
        `https://google.com/maps?q=${coords.latitude},${coords.longtitude}`
      )
    );
    callback();
  });
  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
       io.to(user.room).emit("message", generateMessage( 'Admin',`${user.username} has left room`));
       io.to(user.room).emit('roomData',{
        room:user.room,
        users:getUsersInRoom(user.room)
      })
      }
  });
});

server.listen(port, () => {
  console.log("serer is up on port", port);
});

const users = [];

//addUser,removeUser, getUser, get UsersInRoom

const addUser = ({ id, username, room }) => {
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();
  //validate the data
  if (!username || !room) {
    return {
      error: "Username and room are required",
    };
  }
  //check for exsiting user
  const exsitingUser = users.find((user) => {
    return user.room === room && user.username === username;
  });
  //validate username
  if (exsitingUser) {
    return {
      error: "username is in use",
    };
  }
  //store user
  const user = { id, username, room };
  users.push(user);
  return { user };
};

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

const getUser = (id) => {
  const index = users.findIndex((user) => user.id === id);
  if (index === -1) {
    return { error: "this user does not exist" };
  }
  return users[index];
};

const getUsersInRoom = (room) => {
  return users.filter((user) => user.room === room);
};

module.exports={
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}
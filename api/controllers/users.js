const User = require("../model/User");

const getUsers = async (req, res) => {
  let users;
  try {
    users = await User.find();
    if (!users) {
      return res.status(404).json({ message: "No users found" });
    }
  } catch (error) {
    return res.status(500).json({ message: error });
  }
  return res.status(200).json(users);
};

const getUser = async (req, res) => {
  const { id } = req.params;
  let user;
  try {
    user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    return res.status(500).json({ message: error });
  }
  return res.status(200).json(user);
};

exports.getUsers = getUsers;
exports.getUser = getUser;

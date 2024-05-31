const User = require("../model/User");
const jwt = require("jsonwebtoken");

const signup = async (req, res) => {
  const { username } = req.body;
  let existingUser;
  try {
    existingUser = await User.findOne({
      $or: [{ username: username }],
    });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }
  try {
    const newUser = await User.create({
      username,
    });

    let token;

    token = jwt.sign(
      {
        userId: newUser.id,
        username: newUser.username,
      },
      process.env.JWT_SECRET
    );

    return res.status(201).json({
      userId: newUser._id,
      token: token,
      username: newUser.username,
    });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

const signin = async (req, res) => {
  const { username } = req.body;
  let existingUser;
  try {
    existingUser = await User.findOne({
      $or: [{ username: username }],
    });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
  if (!existingUser) {
    return res.status(400).json({ message: "User does not exist" });
  }
  return res.status(200).json({
    username: existingUser.username,
    userId: existingUser._id,
  });
};

exports.signup = signup;
exports.signin = signin;

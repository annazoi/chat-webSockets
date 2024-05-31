const User = require("../model/User");
const jwt = require("jsonwebtoken");
const uploadImage = require("../lib/uploadImage");

const signup = async (req, res) => {
  const { username, avatar } = req.body;
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
    let result;
    if (avatar) {
      result = await uploadImage(avatar);
    }

    const newUser = await User.create({
      username,
      avatar: result || "",
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
      avatar: result || "",
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

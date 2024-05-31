const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
  },
});

module.exports = mongoose.model("User", UserSchema);

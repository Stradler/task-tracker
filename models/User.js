var mongoose = require("mongoose");
var mongooseLocal = require("passport-local-mongoose");

var userSchema = new mongoose.Schema({
  name: String,
  username: String, //email
  surname: String,
  password: String,
  role: String,
  projects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project"
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  passwordResetToken: String,
  passwordResetExpires: Date
});

userSchema.plugin(mongooseLocal);

module.exports = mongoose.model("User", userSchema);
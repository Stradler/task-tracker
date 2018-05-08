
var mongoose = require("mongoose");

var taskSchema = new mongoose.Schema({
  name: String,
  description: String,
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Comment"
  }],
  developers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  status: String
});

module.exports = mongoose.model("Task", taskSchema);
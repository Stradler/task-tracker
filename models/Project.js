var mongoose = require("mongoose");

var projectSchema = new mongoose.Schema({
  name: String,
  tasks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Task"
  }],
  creator: String, //email
  developers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }]
});

module.exports = mongoose.model("Project", projectSchema);
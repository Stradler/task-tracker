var mongoose = require("mongoose");

var commentSchema = new mongoose.Schema({
  creator: String,
  description: String
});

module.exports = mongoose.model("Comment", commentSchema);
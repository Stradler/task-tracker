var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/task-tracker-dev5");

mongoose.Promise = Promise;

module.exports.User = require("./User");
module.exports.Project = require("./Project");
module.exports.Task = require("./Task");
module.exports.Comment = require("./Comment");
module.exports.Token = require("./Token");
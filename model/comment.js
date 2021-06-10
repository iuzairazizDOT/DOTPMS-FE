const mongoose = require("mongoose");

const commentSchema = mongoose.Schema(
  {
    data: String,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tasks",
    },
  },
  { timestamps: true }
);

const Comment = mongoose.model("Comment", commentSchema);

module.exports.Comment = Comment;

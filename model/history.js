const mongoose = require("mongoose");

const historySchema = mongoose.Schema(
  {
    document: String,
    onModel: {
      type: String,
      required: true,
      enum: ["Machine"],
    },
  },
  { timestamps: true }
);

const History = mongoose.model("History", historySchema);

module.exports.History = History;

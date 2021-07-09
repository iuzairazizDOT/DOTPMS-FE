const mongoose = require("mongoose");

const requestSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    requestType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RequestType",
    },
    description: String,
  },
  { timestamps: true }
);

const Request = mongoose.model("Request", requestSchema);

module.exports.Request = Request;

const mongoose = require("mongoose");

const leaveSchema = mongoose.Schema(
  {
    type: { type: mongoose.Schema.Types.ObjectId, ref: "LeaveType" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    description: String,
    adminRemark: { type: String, default: null },
    pmRemark: { type: String, default: null },
    adminActionDate: { type: Date, default: null },
    pmActionDate: { type: Date, default: null },
    adminStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    pmStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const Leave = mongoose.model("leave", leaveSchema);

module.exports.Leave = Leave;

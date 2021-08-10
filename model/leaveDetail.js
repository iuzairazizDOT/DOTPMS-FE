const mongoose = require("mongoose");

const leaveDetailSchema = mongoose.Schema(
  {
    leave: { type: mongoose.Schema.Types.ObjectId, ref: "Leave" },
    date: Date,
    swapDate: [Date],
    leaveStatus: {
      type: String,
      enum: ["paid", "unpaid", "rejected"],
      default: "paid",
    },
  },
  { timestamps: true }
);

const LeaveDetail = mongoose.model("leaveDetail", leaveDetailSchema);

module.exports.LeaveDetail = LeaveDetail;

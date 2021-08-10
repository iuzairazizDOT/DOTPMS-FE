const mongoose = require("mongoose");

const leaveSettingScheme = mongoose.Schema({
  daysOf: Date,
  sandwhich: {
    rules: {
      type: String,
      enum: ["before", "after", "between"],
      default: "between",
    },
    noticeDays: Number,
  },
});

const LeaveSetting = mongoose.model("LeaveSetting", leaveSettingScheme);

module.exports.LeaveSetting = LeaveSetting;

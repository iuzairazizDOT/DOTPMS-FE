const mongoose = require("mongoose");

const designationScheme = mongoose.Schema(
  {
    designation: String,
    user: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

const Designation = mongoose.model("Designation", designationScheme);

module.exports.Designation = Designation;

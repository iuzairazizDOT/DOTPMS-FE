const mongoose = require("mongoose");

const projectPaymentSchema = mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
    },
  },
  { timestamps: true }
);

const projectPayment = mongoose.model("projectPayment", projectPaymentSchema);

module.exports.projectPayment = projectPayment;

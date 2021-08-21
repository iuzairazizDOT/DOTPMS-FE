const mongoose = require("mongoose");

const paymentDetialsSchema = mongoose.Schema(
  {
    projectPayments: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProjectPayment",
    },
    recievedAmount: Number,
    exchangeRate: Number,
    PaymentRecievedDate: Date,
    PaymentDescription: String,
  },
  { timestamps: true }
);

const paymentDetials = mongoose.model("paymentDetials", paymentDetialsSchema);

module.exports.paymentDetials = paymentDetials;

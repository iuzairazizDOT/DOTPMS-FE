const mongoose = require("mongoose");

const expenseScheme = mongoose.Schema(
  {
    name: String,
    cost: Number,
  },
  { timestamps: true }
);

const Expense = mongoose.model("Expense", expenseScheme);

module.exports.Expense = Expense;

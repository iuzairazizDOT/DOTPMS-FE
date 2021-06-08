const mongoose = require("mongoose");

const machineScheme = mongoose.Schema(
  {
    name: String,
    Storage: String,
    Memory: String,
    Processor: String,
    Graphics: String,
    Accessories: String,
    Status: String,
    Display: String,
    Battery: String,
    Charger: String,
    Notes: String,
    resourceName: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const Machine = mongoose.model("Machine", machineScheme);

module.exports.Machine = Machine;

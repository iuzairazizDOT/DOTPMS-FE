const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { Project } = require("./project");

const userSchema = mongoose.Schema(
  {
    name: String,
    email: String,
    gender: String,
    salary: Number,
    workingHrs: Number,
    password: String,
    status: String,
    joiningDate: String,
    machineNo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Machine",
    },
    workingDays: Number,
    userRole: String,
    image: String,
    technology: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Technology",
      },
    ],
    role: {
      type: String,
      default: "User",
    },
  },
  { timestamps: true }
);

// for generating hased passwords
userSchema.methods.generateHashedPassword = async function () {
  let salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
};

const User = mongoose.model("User", userSchema);
module.exports.User = User;

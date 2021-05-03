const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { Project } = require("./project");

const userSchema = mongoose.Schema(
  {
    firstName: String,
    middleName: String,
    lastName: String,
    email: String,
    password: String,
    image: String,
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

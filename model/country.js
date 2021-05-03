const mongoose = require("mongoose");

const countryScheme = mongoose.Schema(
  {
    name: String,
  },
  { timestamps: true }
);

const Country = mongoose.model("Country", countryScheme);

module.exports.Country = Country;

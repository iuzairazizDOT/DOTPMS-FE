const mongoose = require("mongoose");

const projectScheme = mongoose.Schema(
  {
    name: String,
    startDate: Date,
    endDate: Date,
    description: String,
    estHrs: Number,
    status: { type: Number, max: 3 },
    remarks: String,
    workdone: String,
    tasks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tasks",
      },
    ],
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
    },

    platform: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Platform",
    },
    country: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Country",
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    assignedUser: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

const Project = mongoose.model("Project", projectScheme);

module.exports.Project = Project;

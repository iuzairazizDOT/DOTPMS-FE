const mongoose = require("mongoose");

const projectScheme = mongoose.Schema(
  {
    name: String,
    cStartDate: Date,
    cEndDate: Date,
    pmStartDate: Date,
    pmEndDate: Date,
    description: String,
    estHrs: Number,
    remarks: String,
    workdone: String,
    cost: String,
    orderNum: String,
    Rprofit: {
      type : Number,
      default: 0
    },
    Pdeduction: {
      type : Number,
      default: 0
    },
    percentage: String,
    fCost: String,
    phase: [
      {
        phasename: String,
        estTime: String,
      },
    ],
    technology: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Technology",
    },

    nature: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Nature",
    },

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
    currency: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Currency",
    },
    status: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Status",
    },
    projectManager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    assignedUser: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      {},
    ],
  },
  { timestamps: true }
);

const Project = mongoose.model("Project", projectScheme);

module.exports.Project = Project;

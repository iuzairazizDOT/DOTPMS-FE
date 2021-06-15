var express = require("express");
const { extend } = require("lodash");
var router = express.Router();
const _ = require("lodash");
var moment = require("moment");
const Mongoose = require("mongoose");
const { Project } = require("../../model/project");
const auth = require("../../middlewares/auth");

/*Get Projects*/
router.get("/show-projects", auth, async (req, res) => {
  let page = Number(req.query.page ? req.query.page : 1);
  let perPage = Number(req.query.perPage ? req.query.perPage : 100);
  let status = req.query.status ? req.query.status : "";
  let platForm = req.query.platForm ? req.query.platForm : "";
  let technology = req.query.technology ? req.query.technology : "";
  let startDate = req.query.startDate ? req.query.startDate : "";
  let endDate = req.query.endDate ? req.query.endDate : "";
  let skipRecords = perPage * (page - 1);
  let requestObject = {};
  if (status) {
    requestObject.status = `${status}`;
  } else {
    null;
  }

  if (platForm) {
    requestObject.platform = `${platForm}`;
  } else {
    null;
  }
  if (technology) {
    requestObject.technology = `${technology}`;
  } else {
    null;
  }
  if (startDate === "null" || startDate === "") {
    console.log("if", startDate);
    let startdate = {};
    startdate1 = "1-1-1990";
    startdate.$gte = moment(startdate1).startOf("day");
    requestObject.cStartDate = startdate;
  } else {
    console.log("else", startDate);
    let startdate = {};
    startdate.$gte = moment(startDate).startOf("day");
    requestObject.cStartDate = startdate;
  }

  let projects = await Project.find(requestObject)
    .populate("tasks")
    .populate("createdBy")
    .populate("client")
    .populate("nature")
    .populate("technology")
    .populate("platform")
    .populate("assignedUser")
    .populate("projectManager")
    .populate("status")
    .populate("service")
    .populate("currency")
    .skip(skipRecords)
    .limit(perPage);
  return res.send(projects);
});

/* Add New Project . */
router.post("/create-project", auth, async (req, res) => {
  console.log("kkkkkkkk", req.body);
  let projects = await Project.findOne({ name: req.body.name });
  if (projects)
    return res.status(400).send("Project With Given Name Already Exsists");
  project = new Project(req.body);
  project
    .save()
    .then((resp) => {
      console.log("kkkkkkkk 200", req.body);
      return res.send(resp);
    })
    .catch((err) => {
      return res.status(500).send({ error: err });
    });
});

// Update Project
router.put("/:id", auth, async (req, res) => {
  try {
    let project = await Project.findById(req.params.id);
    console.log(project);
    if (!project)
      return res.status(400).send("Project with given id is not present");
    project = extend(project, req.body);
    await project.save();
    return res.send(project);
  } catch (err) {
    console.log("error", err);
    return res.status(400).send("Invalid Id"); // when id is inavlid
  }
});

// Delete user
router.delete("/:id", auth, async (req, res) => {
  try {
    let project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      return res.status(400).send("Project with given id is not present"); // when there is no id in db
    }
    return res.send(project); // when everything is okay
  } catch {
    return res.status(400).send("Invalid  Project Id"); // when id is inavlid
  }
});

router.post("/whereEmployee/:id", auth, async (req, res) => {
  try {
    console.log("emp id", req.params.id);
    let project = await Project.find({
      assignedUser: { _id: req.params.id },
    });
    if (!project) {
      return res.status(404).send("Project with given id is not present"); // when there is no id in db
    }
    return res.send(project); // when everything is okay
  } catch (err) {
    console.log(err);
    return res.status(400).send("invalid id"); // when id is inavlid
  }
});

router.get("/project-with-tasks/:projectId", async (req, res) => {
  try {
    console.log("emp id", req.params.id);

    let project = await Project.aggregate([
      { $match: { _id: Mongoose.Types.ObjectId(req.params.projectId) } },
      {
        $lookup: {
          from: "users",
          localField: "assignedUser",
          foreignField: "_id",
          as: "assignedUser",
        },
      },
      {
        $lookup: {
          from: "clients",
          localField: "client",
          foreignField: "_id",
          as: "client",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "projectManager",
          foreignField: "_id",
          as: "projectManager",
        },
      },
      {
        $lookup: {
          from: "platforms",
          localField: "platform",
          foreignField: "_id",
          as: "platform",
        },
      },
      {
        $lookup: {
          from: "services",
          localField: "service",
          foreignField: "_id",
          as: "service",
        },
      },
      {
        $lookup: {
          from: "natures",
          localField: "nature",
          foreignField: "_id",
          as: "nature",
        },
      },
      {
        $lookup: {
          from: "technologies",
          localField: "technology",
          foreignField: "_id",
          as: "technology",
        },
      },
      {
        $lookup: {
          from: "currencies",
          localField: "currency",
          foreignField: "_id",
          as: "currency",
        },
      },
      {
        $lookup: {
          from: "status",
          localField: "status",
          foreignField: "_id",
          as: "status",
        },
      },
      { $unwind: { path: "$client", preserveNullAndEmptyArrays: true } },
      {
        $unwind: { path: "$projectManager", preserveNullAndEmptyArrays: true },
      },
      { $unwind: { path: "$platform", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$service", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$nature", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$technology", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$currency", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$status", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "tasks",
          let: { projectId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$$projectId", "$project"] },
                    { $eq: ["$parentTask", null] },
                  ],
                },
              },
            },
            {
              $lookup: {
                from: "users",
                localField: "assignedTo",
                foreignField: "_id",
                as: "assignedTo",
              },
            },
            {
              $lookup: {
                from: "users",
                localField: "teamLead",
                foreignField: "_id",
                as: "teamLead",
              },
            },
            {
              $unwind: { path: "$teamLead", preserveNullAndEmptyArrays: true },
            },
            {
              $lookup: {
                from: "users",
                localField: "approvedBy",
                foreignField: "_id",
                as: "approvedBy",
              },
            },
            {
              $unwind: {
                path: "$approvedBy",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $lookup: {
                from: "timesheets",
                let: { taskID: "$_id" },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $eq: ["$$taskID", "$task"] },
                          { $ne: ["$workedHrs", null] },
                        ],
                      },
                    },
                  },
                  { $group: { _id: null, hours: { $sum: "$workedHrs" } } },
                ],
                as: "actualHours",
              },
            },
            {
              $unwind: {
                path: "$actualHours",
                preserveNullAndEmptyArrays: true,
              },
            },
            { $addFields: { actualHrs: "$actualHours.hours" } },
            { $project: { actualHours: 0 } },
          ],
          as: "tasks",
        },
      },
    ]);
    if (!project) {
      return res.status(404).send("Project with given id is not present"); // when there is no id in db
    }
    return res.send(project); // when everything is okay
  } catch (err) {
    console.log(err);
    return res.status(400).send("invalid id"); // when id is inavlid
  }
});

router.get("/report", async (req, res) => {
  try {
    // console.log("emp id", req.params.id);

    let project = await Project.aggregate([
      // { $match: { _id: Mongoose.Types.ObjectId("60a676108408824bedad262b") } },
      {
        $lookup: {
          from: "expenses",
          pipeline: [
            { $match: { _id: { $exists: true } } },
            { $group: { _id: null, totalExpenses: { $sum: "$cost" } } },
            { $project: { _id: 0 } },
          ],
          as: "expensesSum",
        },
      },
      { $unwind: { path: "$expensesSum", preserveNullAndEmptyArrays: true } },
      { $addFields: { expensesSum: "$expensesSum.totalExpenses" } },
      {
        $lookup: {
          from: "users",
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    { $eq: ["$userRole", "Admin"] },
                    { $eq: ["$userRole", "HR"] },
                    { $eq: ["$userRole", "CEO"] },
                  ],
                },
              },
            },
            { $group: { _id: null, expensedUsersTotal: { $sum: "$salary" } } },
            // { $project: { _id: 0 } },
          ],
          as: "expensedUsersTotal",
        },
      },
      {
        $unwind: {
          path: "$expensedUsersTotal",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          expensedUsersTotal: "$expensedUsersTotal.expensedUsersTotal",
        },
      },
      {
        $addFields: {
          totalExpenses: { $sum: ["$expensedUsersTotal", "$expensesSum"] },
        },
      },

      {
        $lookup: {
          from: "users",
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $ne: ["$userRole", "Admin"] },
                    { $ne: ["$userRole", "HR"] },
                    { $ne: ["$userRole", "CEO"] },
                  ],
                },
              },
            },
            { $count: "numberOfEmployees" },
          ],
          as: "noOfEmployees",
        },
      },
      { $unwind: { path: "$noOfEmployees", preserveNullAndEmptyArrays: true } },
      { $addFields: { noOfEmployees: "$noOfEmployees.numberOfEmployees" } },
      {
        $addFields: {
          perEmployeeExpense: { $divide: ["$totalExpenses", "$noOfEmployees"] },
        },
      },
      {
        $lookup: {
          from: "users",
          let: {
            user: "$assignedUser",
            empExpense: "$perEmployeeExpense",
            pId: "$_id",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ["$_id", "$$user"],
                },
              },
            },
            {
              $addFields: {
                perHourSalary: {
                  $divide: [
                    {
                      $divide: [
                        { $sum: ["$salary", "$$empExpense"] },
                        { $multiply: ["$workingDays", 4.3] },
                      ],
                    },
                    "$workingHrs",
                  ],
                },
              },
            },
            {
              $lookup: {
                from: "tasks",
                let: { projectId: "$$pId", userId: "$_id" },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $eq: ["$$projectId", "$project"] },
                          { $in: ["$$userId", "$assignedTo"] },
                        ],
                      },
                    },
                  },
                  {
                    $lookup: {
                      from: "timesheets",
                      let: { taskId: "$_id", uId: "$$userId" },
                      pipeline: [
                        {
                          $match: {
                            $expr: {
                              $and: [
                                { $eq: ["$$taskId", "$task"] },
                                { $eq: ["$$uId", "$employee"] },
                                { $ne: ["$workedHrs", null] },
                              ],
                            },
                          },
                        },
                        {
                          $group: { _id: null, hours: { $sum: "$workedHrs" } },
                        },
                      ],
                      as: "timesheets",
                    },
                  },
                  {
                    $unwind: {
                      path: "$timesheets",
                      preserveNullAndEmptyArrays: true,
                    },
                  },
                  {
                    $group: {
                      _id: null,
                      allTaskHrs: { $sum: "$timesheets.hours" },
                      tasks: {
                        $push: {
                          workDone: {
                            $divide: [
                              { $multiply: ["$workDone", "$projectRatio"] },
                              100,
                            ],
                          },
                        },
                      },
                    },
                  },
                  { $project: { _id: 0 } },
                ],
                as: "totalProjectHrs",
              },
            },
            {
              $unwind: {
                path: "$totalProjectHrs",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $addFields: {
                totalProjectHrs: "$totalProjectHrs.allTaskHrs",
              },
            },
            {
              $project: {
                totalProjectHrs: 1,
                perHourSalary: 1,
                resourceExpense: {
                  $multiply: ["$perHourSalary", "$totalProjectHrs"],
                },
              },
            },
            {
              $group: {
                _id: null,
                allResourcesExpense: { $sum: "$resourceExpense" },
              },
            },
          ],
          as: "projectResourcesExpense",
        },
      },
      {
        $unwind: {
          path: "$projectResourcesExpense",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "clients",
          localField: "client",
          foreignField: "_id",
          as: "client",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "projectManager",
          foreignField: "_id",
          as: "projectManager",
        },
      },
      {
        $lookup: {
          from: "platforms",
          localField: "platform",
          foreignField: "_id",
          as: "platform",
        },
      },
      {
        $lookup: {
          from: "services",
          localField: "service",
          foreignField: "_id",
          as: "service",
        },
      },
      {
        $lookup: {
          from: "natures",
          localField: "nature",
          foreignField: "_id",
          as: "nature",
        },
      },
      {
        $lookup: {
          from: "technologies",
          localField: "technology",
          foreignField: "_id",
          as: "technology",
        },
      },
      {
        $lookup: {
          from: "currencies",
          localField: "currency",
          foreignField: "_id",
          as: "currency",
        },
      },
      {
        $lookup: {
          from: "status",
          localField: "status",
          foreignField: "_id",
          as: "status",
        },
      },
      { $unwind: { path: "$client", preserveNullAndEmptyArrays: true } },
      {
        $unwind: { path: "$projectManager", preserveNullAndEmptyArrays: true },
      },
      { $unwind: { path: "$platform", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$service", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$nature", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$technology", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$currency", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$status", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "tasks",
          let: { projectId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$$projectId", "$project"] },
                    { $eq: ["$parentTask", null] },
                  ],
                },
              },
            },
            {
              $lookup: {
                from: "timesheets",
                let: { taskID: "$_id" },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $eq: ["$$taskID", "$task"] },
                          { $ne: ["$workedHrs", null] },
                        ],
                      },
                    },
                  },
                  { $group: { _id: null, hours: { $sum: "$workedHrs" } } },
                ],
                as: "actualHours",
              },
            },
            {
              $unwind: {
                path: "$actualHours",
                preserveNullAndEmptyArrays: true,
              },
            },
            { $addFields: { actualHrs: "$actualHours.hours" } },
            { $project: { actualHours: 0 } },
            {
              $group: {
                _id: null,
                projectHrs: { $sum: "$actualHrs" },
                workedDone: {
                  $sum: {
                    $divide: [
                      { $multiply: ["$workDone", "$projectRatio"] },
                      100,
                    ],
                  },
                },
              },
            },
          ],
          as: "tasks",
        },
      },
      { $unwind: { path: "$tasks", preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          actualHrs: "$tasks.projectHrs",
          workDone: "$tasks.workedDone",
        },
      },
      { $project: { tasks: 0 } },
      {
        $lookup: {
          from: "users",
          localField: "assignedUser",
          foreignField: "_id",
          as: "assignedUser",
        },
      },
    ]);
    if (!project) {
      return res.status(404).send("Project with given id is not present"); // when there is no id in db
    }
    return res.send(project); // when everything is okay
  } catch (err) {
    console.log(err);
    return res.status(400).send("invalid id"); // when id is inavlid
  }
});

module.exports = router;

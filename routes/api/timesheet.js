var express = require("express");
const _ = require("lodash");
const { extend } = require("lodash");
var router = express.Router();
const { Timesheet } = require("../../model/timesheet");
const { Project } = require("../../model/project");

/* Get Timesheet */
router.get("/", async (req, res) => {
  let timesheet = await Timesheet.find()
    .populate("employee")
    .populate("task")
    .populate("approvedBy");
  return res.send(timesheet);
});

/*Add new timesheet*/
router.post("/", async (req, res) => {
  let timesheet = await Timesheet.findOne({
    date: req.body.date,
    employee: req.body.employee,
    task: req.body.task,
  });
  if (timesheet)
    return res
      .status(400)
      .send("Timesheet With this Date and Task Already Exists");
  timesheet = new Timesheet(req.body);
  timesheet
    .save()
    .then((resp) => {
      return res.send(resp);
    })
    .catch((err) => {
      return res.status(500).send({ error: err });
    });
});

// Update Timesheet
router.put("/:id", async (req, res) => {
  try {
    let timesheet = await Timesheet.findById(req.params.id);
    console.log(timesheet);
    if (!timesheet)
      return res.status(400).send("Task with given id is not present");
    timesheet = extend(timesheet, req.body);
    await timesheet.save();
    return res.send(timesheet);
  } catch {
    return res.status(400).send("Invalid Id"); // when id is inavlid
  }
});

// Delete user
router.delete("/:id", async (req, res) => {
  try {
    let timesheet = await Timesheet.findByIdAndDelete(req.params.id);
    if (!timesheet) {
      return res.status(400).send("Task with given id is not present"); // when there is no id in db
    }
    return res.send(timesheet); // when everything is okay
  } catch {
    return res.status(400).send("Invalid Task Id"); // when id is inavlid
  }
});

router.get("/project-timesheet/:id", async (req, res) => {
  let timesheet = await Timesheet.find({ project: req.params.id })
    .populate("projects")
    .populate("parentTask")
    .populate("project")
    .populate("teamLead")
    .populate("addedby", "name")
    .populate("approvedBy")
    .populate("assignedTo");

  return res.send(timesheet);
});

module.exports = router;

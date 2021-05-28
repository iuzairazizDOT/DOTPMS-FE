var express = require("express");
const { extend } = require("lodash");
var router = express.Router();
const _ = require("lodash");
var moment = require("moment");
const { Project } = require("../../model/project");

/*Get Projects*/
router.get("/show-projects", async (req, res) => {
  let page = Number(req.query.page ? req.query.page : 1);
  let perPage = Number(req.query.perPage ? req.query.perPage : 10);
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

  if (startDate) {
    let startdate = {};
    startdate.$gte = moment(startDate).startOf("day");
    requestObject.cStartDate = startdate;
  } else {
    null;
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
    .skip(skipRecords)
    .limit(perPage);
  return res.send(projects);
});

/* Add New Project . */
router.post("/create-project", async (req, res) => {
  let projects = await Project.findOne({ name: req.body.name });
  if (projects)
    return res.status(400).send("Project With Given Name Already Exsists");
  project = new Project(req.body);
  project
    .save()
    .then((resp) => {
      return res.send(resp);
    })
    .catch((err) => {
      return res.status(500).send({ error: err });
    });
});

// Update Project
router.put("/:id", async (req, res) => {
  try {
    let project = await Project.findById(req.params.id);
    console.log(project);
    if (!project)
      return res.status(400).send("Project with given id is not present");
    project = extend(project, req.body);
    await project.save();
    return res.send(project);
  } catch {
    return res.status(400).send("Invalid Id"); // when id is inavlid
  }
});

// Delete user
router.delete("/:id", async (req, res) => {
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

router.post("/whereEmployee/:id", async (req, res) => {
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

module.exports = router;

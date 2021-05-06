var express = require("express");
const { extend } = require("lodash");
var router = express.Router();
const _ = require("lodash");
const { Project } = require("../../model/project");

/*Get Projects*/
router.get("/show-projects", async (req, res) => {
  let page = Number(req.query.page ? req.query.page : 1);
  let perPage = Number(req.query.perPage ? req.query.perPage : 10);
  let skipRecords = perPage * (page - 1);
  let projects = await Project.find()
    .populate("tasks")
    .populate("createdBy", "name")
    .populate("client")
    .populate("platform")
    .populate("assignedUser", "name role")
    .skip(skipRecords)
    .limit(perPage);
  return res.send(projects);
});

/* Add New Project . */
router.post("/create-project", async (req, res) => {
  let projects = await Project.findOne({ project_name: req.body.project_name });
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

module.exports = router;

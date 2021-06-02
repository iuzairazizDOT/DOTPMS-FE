var express = require("express");
const { extend } = require("lodash");
var router = express.Router();
const _ = require("lodash");
var moment = require("moment");
const  Mongoose  = require("mongoose");
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
  } catch(err) {
    console.log("error",err);
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
      {$lookup:{
        from:"tasks",
        let: { projectId: "$_id" },
        pipeline:[
          {
            $match:{$expr:{$and:[{$eq:["$$projectId","$project"]},{$eq:["$parentTask",null]}]} },      
          },
          {
            $lookup:
            {
              from:"timesheets",
              let : {taskID:"$_id"},
              pipeline:[
                {$match:{$expr:{$and:[{$eq:["$$taskID","$task"]},{$ne:["$workedHrs",null]}]} },},
                {$group:{_id:null,hours:{$sum:"$workedHrs"}}},
              ],
              as:"actualHours"}},
              {$unwind:"$actualHours"},
              {$addFields:{actualHrs:"$actualHours.hours"}},
              {$project:{actualHours:0}
            },
        ],
        as:"tasks",
      }},
      
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
    console.log("emp id", req.params.id);
    
    let project = await Project.aggregate([
      // { $match: { _id: Mongoose.Types.ObjectId(req.params.projectId) } },
      {
        $lookup:
        {
            from:"tasks",
            let: { projectId: "$_id" },
            pipeline:[
              {
                $match:{$expr:{$and:[{$eq:["$$projectId","$project"]},{$eq:["$parentTask",null]}]} },      
              },
              {
                $lookup:
                {
                  from:"timesheets",
                  let : {taskID:"$_id"},
                  pipeline:[
                    {$match:{$expr:{$and:[{$eq:["$$taskID","$task"]},{$ne:["$workedHrs",null]}]} },},
                    {$group:{_id:null,hours:{$sum:"$workedHrs"}}},
                  ],
                  as:"actualHours"
                }
              },
              {$unwind:"$actualHours"},
              {$addFields:{actualHrs:"$actualHours.hours"}},
              {$project:{actualHours:0}},
              {$group:{_id:null,projectHrs:{$sum:"$actualHrs"},workedDone:{$sum:"$workDone"}}},
              
            ],
            as:"tasks",        
        }
      },
      // {$unwind:"$tasks"},
      // {$addFields:{actualHrs:"$tasks.projectHrs",workDone:"$tasks.workedDone"}},
      // {$project:{tasks:0}}

      
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

var express = require("express");
const _ = require("lodash");
const { extend } = require("lodash");
var router = express.Router();
const { Machine } = require("../../model/machine");
const auth = require("../../middlewares/auth");

/* Get All Designations And Users */
router.get("/show-machine", auth, async (req, res) => {
  let page = Number(req.query.page ? req.query.page : 1);
  let perPage = Number(req.query.perPage ? req.query.perPage : 10);
  let skipRecords = perPage * (page - 1);
  let machine = await Machine.find()
    .populate("resourceName")
    .populate("Accessory");
  return res.send(machine);
});

router.get("/single-machine/:machineId", async (req, res) => {
  try {
    let machine = await Machine.findById(req.params.machineId)
      .populate("resourceName")
      .populate("Accessory", "name");
    if (!machine) {
      return res.status(404).send("Project with given id is not present"); // when there is no id in db
    }
    return res.send(machine); // when everything is okay
  } catch (err) {
    console.log(err);
    return res.status(400).send("invalid id"); // when id is inavlid
  }
});

/*Add new Designation*/
router.post("/create-machine", async (req, res) => {
  let machine = await Machine.findOne({
    name: req.body.name,
  });
  if (machine)
    return res.status(400).send("Machine With Given Name Already Exsists");
  machine = new Machine(req.body);
  machine
    .save()
    .then((resp) => {
      return res.send(resp);
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).send({ error: err });
    });
});

// Update Designation
router.put("/:id", auth, async (req, res) => {
  try {
    let machine = await Machine.findById(req.params.id);
    console.log(machine);
    if (!machine)
      return res.status(400).send("machine with given id is not present");
    machine = extend(machine, req.body);
    await machine.save();
    return res.send(machine);
  } catch (err) {
    console.log(err);
    return res.status(400).send("Invalid Id"); // when id is inavlid
  }
});

// Delete Designation
router.delete("/:id", auth, async (req, res) => {
  try {
    let machine = await Machine.findByIdAndDelete(req.params.id);
    if (!machine) {
      return res.status(400).send("machine with given id is not present"); // when there is no id in db
    }
    return res.send(machine); // when everything is okay
  } catch {
    return res.status(400).send("Invalid machine Id"); // when id is inavlid
  }
});

module.exports = router;

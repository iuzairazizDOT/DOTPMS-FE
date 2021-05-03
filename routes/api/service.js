var express = require("express");
const _ = require("lodash");
const { extend } = require("lodash");
var router = express.Router();
const { Service } = require("../../model/services");

/* Get All Designations And Users */
router.get("/show-service", async (req, res) => {
  let page = Number(req.query.page ? req.query.page : 1);
  let perPage = Number(req.query.perPage ? req.query.perPage : 10);
  let skipRecords = perPage * (page - 1);
  let service = await Service.find().skip(skipRecords).limit(perPage);
  return res.send(service);
});

/*Add new Designation*/
router.post("/create-service", async (req, res) => {
  let service = await Service.findOne({
    name: req.body.name,
  });
  if (service)
    return res.status(400).send("service With Given Name Already Exsists");
  service = new Service(req.body);
  service
    .save()
    .then((resp) => {
      return res.send(resp);
    })
    .catch((err) => {
      return res.status(500).send({ error: err });
    });
});

// Update Designation
router.put("/:id", async (req, res) => {
  try {
    let service = await Service.findById(req.params.id);
    console.log(service);
    if (!service)
      return res.status(400).send("service with given id is not present");
    service = extend(service, req.body);
    await service.save();
    return res.send(service);
  } catch {
    return res.status(400).send("Invalid Id"); // when id is inavlid
  }
});

// Delete Designation
router.delete("/:id", async (req, res) => {
  try {
    let service = await Service.findByIdAndDelete(req.params.id);
    if (!service) {
      return res.status(400).send("service with given id is not present"); // when there is no id in db
    }
    return res.send(service); // when everything is okay
  } catch {
    return res.status(400).send("Invalid Task Id"); // when id is inavlid
  }
});

module.exports = router;

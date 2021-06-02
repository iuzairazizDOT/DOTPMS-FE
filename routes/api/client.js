var express = require("express");
const _ = require("lodash");
const { extend } = require("lodash");
var router = express.Router();
const { Client } = require("../../model/client");
const auth = require("../../middlewares/auth");

/* Get All Designations And Users */
router.get("/show-client", auth, async (req, res) => {
  let page = Number(req.query.page ? req.query.page : 1);
  let perPage = Number(req.query.perPage ? req.query.perPage : 10);
  let skipRecords = perPage * (page - 1);
  let client = await Client.find()
    .populate("country")
    .skip(skipRecords)
    .limit(perPage);
  return res.send(client);
});

/*Add new Designation*/
router.post("/create-client", auth, async (req, res) => {
  let client = await Client.findOne({
    name: req.body.name,
  });
  if (client)
    return res.status(400).send("client With Given Name Already Exsists");
  client = new Client(req.body);
  client
    .save()
    .then((resp) => {
      return res.send(resp);
    })
    .catch((err) => {
      return res.status(500).send({ error: err });
    });
});

// Update Designation
router.put("/:id", auth, async (req, res) => {
  try {
    let client = await Client.findById(req.params.id);
    console.log(client);
    if (!client)
      return res.status(400).send("client with given id is not present");
    client = extend(client, req.body);
    await client.save();
    return res.send(client);
  } catch {
    return res.status(400).send("Invalid Id"); // when id is inavlid
  }
});

// Delete Designation
router.delete("/:id", auth, async (req, res) => {
  try {
    let client = await Client.findByIdAndDelete(req.params.id);
    if (!client) {
      return res.status(400).send("client with given id is not present"); // when there is no id in db
    }
    return res.send(client); // when everything is okay
  } catch {
    return res.status(400).send("Invalid Task Id"); // when id is inavlid
  }
});

module.exports = router;

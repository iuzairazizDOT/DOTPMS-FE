var express = require("express");
const _ = require("lodash");
const { extend } = require("lodash");
var router = express.Router();
const { Request } = require("../../model/request");
const auth = require("../../middlewares/auth");

/* Get All Request */
router.get("/show-request", auth, async (req, res) => {
  let page = Number(req.query.page ? req.query.page : 1);
  let perPage = Number(req.query.perPage ? req.query.perPage : 10);
  let skipRecords = perPage * (page - 1);
  let request = await Request.find()
    .sort({
      createdAt: -1,
    })
    .skip(skipRecords)
    .limit(perPage);
  return res.send(request);
});

/*Add new Request*/
router.post("/create-request", auth, async (req, res) => {
  request = new Request(req.body);
  request
    .save()
    .then((resp) => {
      return res.send(resp);
    })
    .catch((err) => {
      return res.status(500).send({ error: err });
    });
});

// Update Request
router.put("/:id", auth, async (req, res) => {
  try {
    let request = await Request.findById(req.params.id);
    console.log(request);
    if (!request)
      return res.status(400).send("client with given id is not present");
    request = extend(request, req.body);
    await request.save();
    return res.send(request);
  } catch {
    return res.status(400).send("Invalid Id"); // when id is inavlid
  }
});

// Delete Request
router.delete("/:id", auth, async (req, res) => {
  try {
    let request = await Request.findByIdAndDelete(req.params.id);
    if (!request) {
      return res.status(400).send("client with given id is not present"); // when there is no id in db
    }
    return res.send(request); // when everything is okay
  } catch {
    return res.status(400).send("Invalid Task Id"); // when id is inavlid
  }
});

module.exports = router;

var express = require("express");
const _ = require("lodash");
const { extend } = require("lodash");
var router = express.Router();
const { Leave } = require("../../model/leave");
const auth = require("../../middlewares/auth");
const { LeaveDetail } = require("../../model/leaveDetail");

/* Get All Designations And Users */
router.get("/", auth, async (req, res) => {
  try {
    let page = Number(req.query.page ? req.query.page : 1);
    let perPage = Number(req.query.perPage ? req.query.perPage : 10);
    let skipRecords = perPage * (page - 1);
    let leaves = await Leave.aggregate([
      {
        $lookup: {
          from: "leavedetails",
          localField: "_id",
          foreignField: "leave",
          as: "dates",
        },
      },
    ]);
    return res.send(leaves);
  } catch (err) {
    return res.send(err);
  }
});

/*Add new Designation*/
router.post("/new", auth, async (req, res) => {
  let leave = new Leave(req.body);
  leave
    .save()
    .then(async (resp) => {
      let leaveDeatil = await LeaveDetail.bulkWrite(
        req.body.dates.map((d) => {
          return {
            insertOne: { document: { leave: resp._id, date: d } },
          };
        }),
        { ordered: false }
      );
      return res.send(resp);
    })
    .catch((err) => {
      return res.status(500).send({ error: err });
    });
});

module.exports = router;

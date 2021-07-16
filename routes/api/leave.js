var express = require("express");
const _ = require("lodash");
const { extend } = require("lodash");
var router = express.Router();
const { Leave } = require("../../model/leave");
const { LeaveType } = require("../../model/leaveType");
const auth = require("../../middlewares/auth");
const { LeaveDetail } = require("../../model/leaveDetail");
const mongoose = require("mongoose");

/* Get All Designations And Users */
router.get("/", auth, async (req, res) => {
  try {
    let page = Number(req.query.page ? req.query.page : 1);
    let perPage = Number(req.query.perPage ? req.query.perPage : 10);
    let skipRecords = perPage * (page - 1);
    let leaves = await Leave.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "leavetypes",
          localField: "type",
          foreignField: "_id",
          as: "type",
        },
      },
      { $unwind: { path: "$type", preserveNullAndEmptyArrays: true } },
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
router.get("/:id", auth, async (req, res) => {
  try {
    let page = Number(req.query.page ? req.query.page : 1);
    let perPage = Number(req.query.perPage ? req.query.perPage : 10);
    let skipRecords = perPage * (page - 1);
    let leaves = await Leave.aggregate([
      { $match: { _id: mongoose.Types.ObjectId(req.params.id) } },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "leavetypes",
          localField: "type",
          foreignField: "_id",
          as: "type",
        },
      },
      { $unwind: { path: "$type", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "leavedetails",
          localField: "_id",
          foreignField: "leave",
          as: "dates",
        },
      },
    ]);
    return res.send(leaves[0]); //aggregate always return array. in this case it always returns array of one element
  } catch (err) {
    return res.send(err);
  }
});

router.get("/remaining/:typeId", auth, async (req, res) => {
  try {
    let page = Number(req.query.page ? req.query.page : 1);
    let perPage = Number(req.query.perPage ? req.query.perPage : 10);
    let skipRecords = perPage * (page - 1);
    let leaves = await Leave.aggregate([
      {
        $match: {
          status: "pending",
          type: mongoose.Types.ObjectId(req.params.typeId),
        },
      },
      {
        $lookup: {
          from: "leavedetails",
          let: { leaveId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$leave", "$$leaveId"] } } },
            { $count: "usedLeaves" },
          ],
          as: "dates",
        },
      },
      { $unwind: { path: "$dates", preserveNullAndEmptyArrays: true } },
      { $group: { _id: null, usedLeaves: { $sum: "$dates.usedLeaves" } } },
    ]);
    return res.send(leaves); //aggregate always return array. in this case it always returns array of one element
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

router.get("/remainingAll/:userId", auth, async (req, res) => {
  try {
    let page = Number(req.query.page ? req.query.page : 1);
    let perPage = Number(req.query.perPage ? req.query.perPage : 10);
    let skipRecords = perPage * (page - 1);
    let leaves = await LeaveType.aggregate([
      {
        $lookup: {
          from: "leaves",
          let: { leaveTypeId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$type", "$$leaveTypeId"] },
                    {
                      $eq: [
                        "$user",
                        mongoose.Types.ObjectId(req.params.userId),
                      ],
                    },
                  ],
                },
              },
            },
            {
              $lookup: {
                from: "leavedetails",
                let: { leaveId: "$_id" },
                pipeline: [
                  {
                    $match: {
                      $expr: { $and: [{ $eq: ["$leave", "$$leaveId"] }, {}] },
                    },
                  },
                  { $count: "usedLeaves" },
                ],
                as: "used",
              },
            },
            // { $count: "usedLeaves" },
            { $project: { used: 1 } },
            { $unwind: { path: "$used", preserveNullAndEmptyArrays: true } },
          ],
          as: "leaves",
        },
      },
      // { $unwind: { path: "$dates", preserveNullAndEmptyArrays: true } },
      // { $group: { _id: null, usedLeaves: { $sum: "$dates.usedLeaves" } } },
    ]);
    return res.send(leaves); //aggregate always return array. in this case it always returns array of one element
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

module.exports = router;

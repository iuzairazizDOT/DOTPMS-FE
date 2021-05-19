var express = require("express");
const _ = require("lodash");
const { extend } = require("lodash");
var router = express.Router();
const { Expense } = require("../../model/expense");

/* Get All Designations And Users */
router.get("/show-expense", async (req, res) => {
  let page = Number(req.query.page ? req.query.page : 1);
  let perPage = Number(req.query.perPage ? req.query.perPage : 10);
  let skipRecords = perPage * (page - 1);
  let expense = await Expense.find().skip(skipRecords).limit(perPage);
  return res.send(expense);
});

/*Add new Designation*/
router.post("/create-expense", async (req, res) => {
  let expense = await Expense.findOne({
    name: req.body.name,
  });
  if (expense)
    return res.status(400).send("client With Given Name Already Exsists");
  expense = new Expense(req.body);
  expense
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
    let expense = await Expense.findById(req.params.id);
    if (!expense)
      return res.status(400).send("expense with given id is not present");
    expense = extend(expense, req.body);
    await expense.save();
    return res.send(expense);
  } catch {
    return res.status(400).send("Invalid Id"); // when id is inavlid
  }
});

// Delete Designation
router.delete("/:id", async (req, res) => {
  try {
    let expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) {
      return res.status(400).send("client with given id is not present"); // when there is no id in db
    }
    return res.send(expense); // when everything is okay
  } catch {
    return res.status(400).send("Invalid Task Id"); // when id is inavlid
  }
});

module.exports = router;

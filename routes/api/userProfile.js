var express = require("express");
const _ = require("lodash");
const { extend } = require("lodash");
var router = express.Router();
const { UserProfile } = require("../../model/userProfile");
const auth = require("../../middlewares/auth");

/* Get All User Profile And Users */
router.get("/show-profile", auth, async (req, res) => {
  let page = Number(req.query.page ? req.query.page : 1);
  let perPage = Number(req.query.perPage ? req.query.perPage : 10);
  let skipRecords = perPage * (page - 1);
  let userprofile = await UserProfile.find()
    .populate("user", "name email")
    .populate("technologies", "name")
    .skip(skipRecords)
    .limit(perPage);
  return res.send(userprofile);
});

/*Add new User Profile*/

// Update Designation
router.put("/:id", auth, async (req, res) => {
  try {
    let userprofile = await UserProfile.findById(req.params.id);
    console.log(userprofile);
    if (!userprofile)
      return res.status(400).send("user profile with given id is not present");
    userprofile = extend(userprofile, req.body);
    await userprofile.save();
    return res.send(userprofile);
  } catch {
    return res.status(400).send("Invalid Id"); // when id is inavlid
  }
});

// Delete Designation
router.delete("/:id", auth, async (req, res) => {
  try {
    let userprofile = await UserProfile.findByIdAndDelete(req.params.id);
    if (!userprofile) {
      return res.status(400).send("user profile with given id is not present"); // when there is no id in db
    }
    return res.send(userprofile); // when everything is okay
  } catch {
    return res.status(400).send("Invalid Task Id"); // when id is inavlid
  }
});

module.exports = router;

var express = require("express");
var router = express.Router();
const multer = require("multer");
var fs = require("fs");
var path = require("path");
const { User } = require("../../model/user");
const { UserProfile } = require("../../model/userProfile");
const bcrypt = require("bcryptjs");
const _ = require("lodash");
const jwt = require("jsonwebtoken");
const config = require("config");
const auth = require("../../middlewares/auth");
const admin = require("../../middlewares/admin");

var Storage = multer.diskStorage({
  destination: "public/uploads/",
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "_" + Date.now() + path.extname(file.originalname)
    );
  },
});

var upload = multer({
  storage: Storage,
  fileFilter: (req, file, cb) => {
    var typeArray = file.mimetype.split("/");
    var fileType = typeArray[1];
    if (fileType == "jpeg") {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error("Invalid upload: Only JPEG IMAGES ALLOWED"));
    }
  },
}).single("image");

/* GET Users */
router.get("/", async function (req, res, next) {
  let page = Number(req.query.page ? req.query.page : 1);
  let perPage = Number(req.query.perPage ? req.query.perPage : 100);
  let skipRecords = perPage * (page - 1);
  let user = await User.find().skip(skipRecords).limit(perPage);
  return res.send(user);
});

/* Signup . */
router.post("/register", upload, async (req, res) => {
  let user = await User.findOne({ email: req.body.email });
  if (user)
    return res.status(400).send("User With Given Email Already Exsists");
  user = new User();
  user.name = req.body.name;
  user.email = req.body.email;
  user.gender = req.body.gender;
  user.status = req.body.status;
  user.joiningDate = req.body.joiningDate;
  user.password = req.body.password;
  user.salary = req.body.salary;
  user.workingHrs = req.body.workingHrs;
  user.machineNo = req.body.machineNo;
  user.workingDays = req.body.workingDays;
  user.userRole = req.body.userRole;
  await user.generateHashedPassword();
  await user.save();
  return res.send(
    _.pick(user, [
      "name",
      "email",
      "gender",
      "salary",
      "status",
      "joiningDate",
      "userRole",
      "machineNo",
      "workingDays",
    ])
  );
});

// Sign In
router.post("/login", async (req, res) => {
  console.log(req.body);
  let user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("User Not Registered");
  let isValid = await bcrypt.compare(req.body.password, user.password);
  if (!isValid) return res.status(401).send("Invalid Password");
  let token = jwt.sign(
    {
      _id: user._id,
      name: user.name,
      role: user.role,
    },
    config.get("jwtPrivateKey")
  );
  return res.send(token);
});

// Update User
router.put("/:id", async (req, res) => {
  let user = await User.findById(req.params.id);
  if (!user) {
    return res.status(400).send("User with given id is not present"); // when there is no id in db
  }
  user.name = req.body.name;
  user.email = req.body.email;
  user.password = req.body.password;
  user.gender = req.body.gender;
  user.status = req.body.status;
  user.joiningDate = req.body.joiningDate;
  user.salary = req.body.salary;
  user.workingHrs = req.body.workingHrs;
  user.machineNo = req.body.machineNo;
  user.workingDays = req.body.workingDays;
  user.userRole = req.body.userRole;
  user.technology = req.body.technology;
  await user.generateHashedPassword();
  await user.save();
  let token = jwt.sign(
    {
      _id: user._id,
      name: user.name,
      role: user.role,
    },
    config.get("jwtPrivateKey")
  );
  let dataToReturn = {
    name: user.name,
    email: user.email,
    token: user.token,
  };
  return res.send(dataToReturn);
});

router.get("/:id", async (req, res) => {
  try {
    let user = await User.findById(req.params.id);
    if (!user) {
      return res.status(400).send("User with given id is not present"); // when there is no id in db
    }
    return res.send(user); // when everything is okay
  } catch {
    return res.status(400).send("Invalid User Id"); // when id is inavlid
  }
});

// Delete user
router.delete("/:id", async (req, res) => {
  try {
    let user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(400).send("User with given id is not present"); // when there is no id in db
    }
    return res.send(user); // when everything is okay
  } catch {
    return res.status(400).send("Invalid Id"); // when id is inavlid
  }
});

module.exports = router;

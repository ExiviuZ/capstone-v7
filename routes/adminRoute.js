const express = require("express");
const router = express.Router();
const { notLoggedIn, notAdmin } = require("../middleware");
const User = require("../model/user");
const Admin = require("../model/admin");
const passport = require("passport");

//Create Admin
  // router.get('/new', async (req,res) => {
    
  //   const user = new Admin({
  //     name: "Administrator",
  //   });

  //   const registeredUser = await Admin.register(user, 'admin');
  //   await user.save();
  //   res.send('new admin')
  // })


router.get("/", notLoggedIn, notAdmin, async (req, res) => {
  var residentCount = 0;
  var maleCount = 0;
  var femaleCount = 0;
  const householdCount = await User.count();
  const registrees = await User.find();
  // Total Residents
  for (registree of registrees) {
    if (!registree.answeredCensus) {
      residentCount += 1;
    } else {
      residentCount += registree.household.length + 1;
    }
  }
  // Count Resident by Gender
  for (registree of registrees) {
    if (!registree.answeredCensus) {
      if (registree.gender == "male") {
        maleCount += 1;
      } else {
        femaleCount += 1;
      }
    } else {
      if (registree.gender == "male") {
        maleCount += 1;
      } else {
        femaleCount += 1;
      }

      for (member of registree.household) {
        if (member.gender == "male") {
          maleCount += 1;
        } else {
          femaleCount += 1;
        }
      }
    }
  }

  res.render("admin/index", {
    title: "Dashboard || Barangay Mag-Asawang Sapa",
    householdCount,
    residentCount,
    femaleCount,
    maleCount,
  });
});

router.get("/household", notLoggedIn, notAdmin, async (req, res) => {
  const users = await User.find();
  res.render("admin/household", {
    title: "All Households || Barangay Mag-Asawang Sapa",
    users,
  });
});

router.get("/household/:id", notLoggedIn, notAdmin, async (req, res) => {
  const { id } = req.params;
  const registree = await User.findById(id);

  function _calculateAge(birthday) {
    // birthday is a date
    var ageDifMs = Date.now() - birthday.getTime();
    var ageDate = new Date(ageDifMs); // miliseconds from epoch
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  }
  var age = _calculateAge(registree.birthday);
  if (registree) {
    return res.render("admin/specificHousehold", {
      title: `${registree.firstName}'s Household || Barangay Mag-Asawang Sapa`,
      registree,
      age,
    });
  } else {
    req.flash("error", "No household found with that ID.");
    return res.redirect("/admin/household");
  }
});

router.delete("/household/:id", notLoggedIn, notAdmin, async (req, res) => {
  const { id } = req.params;
  await User.findByIdAndDelete(id);
  req.flash("success", "Successfully Deleted a Household!!");
  res.redirect("/admin/household");
});

router.post(
  "/login",
  (req, res, next) => {
    req.body.username = req.body.username.toLowerCase();
    next();
  },
  passport.authenticate("admin", {
    failureFlash: true,
    failureRedirect: "/login",
  }),
  async (req, res) => {
    req.flash("success", "Welcome Back, Admin!");
    res.redirect("/admin/");
  }
);

module.exports = router;

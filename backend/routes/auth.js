const express = require("express");
const User = require("../models/User");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const JWT_SECRET = "Mihirisagoodb$oy";

//Create a User using:POST "/api/auth/createuser".No login required
router.post(
  "/createuser",
  [
    body("email", "Enter a valid email.").isEmail(),
    body("name", "Enter a valid name.").isLength({ min: 1 }),
    body("password", "Password too weak.").isLength({ min: 5 }),
  ],
  async (req, res) => {
    //If there are errors, return bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    //Check whether the user with this email exist already
    try {
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res
          .status(400)
          .json({ error: "Sorry a user with this email already exists" });
      }
      //create a new user
      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(req.body.password, salt);
      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: secPass,
      });
      const data = {
        user: {
          id: user.id,
        },
      };
      //console.log(data);
      const authtoken = jwt.sign(data, JWT_SECRET);
      res.json({ authtoken: authtoken });
      //res.json(user);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Some error occured.");
    }

    //   .then(user => res.json(user))
    //   .catch(err=>{
    //     console.log(err);
    //     res.json({error:'User already existed.',message:err.message});
    //   });
  }
);

module.exports = router;

const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const User = require("../../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const { check, validationResult } = require("express-validator");

// @route   GET api/users
// @desc    register user
// @access  Public
router.post(
  "/",
  [
    check("name", "Name is required").not().isEmpty(),
    check("email", "Please include a valid email address").isEmail(),
    check(
      "password",
      "Please enter a password with 6 or more characters"
    ).isLength({
      min: 6,
      max: 20,
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // if there is errors
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      let user = await User.findOne({ email });
      if (user) {
        return res
          .status(400)
          .json({ errors: [{ message: "User already exists" }] });
      }
      // get user gravatar
      const avatar = gravatar.url(email, {
        s: "200",
        r: "pg",
        d: "mm",
      });
      // create instance
      user = new User({
        name,
        email,
        avatar,
        password,
      });
      // encrypt password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
      await user.save(); // saving instance to database
      // return jsonwebtoken
      const payload = {
        user: {
          id: user.id,
          email: user.email,
        },
      };
      jwt.sign(payload, config.get("jwtSecret"), {
        expiresIn: 36000,
      },(err,token)=>{
        if(err) throw err
        res.status(201).json({access_token : token})
      });
    } catch (err) {
      res.status(500).send("Server error");
    }
  }
);

module.exports = router;

const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const Profile = require("../../models/Profile");
const User = require("../../models/User");
const { check, validationResult } = require("express-validator");

// @route   GET api/profile/me
// @desc    Get current user profile
// @access  Private

router.get("/me", auth, async (req, res) => {
  try {
    // get profile where user with id of req.user.id from token
    const profile = await Profile.findOne({ user: req.user.id }).populate(
      "user", // from model user
      ["name", "avatar"] // the field that we want to populate with
    );
    if (!profile) {
      return res
        .status(404)
        .json({ message: "There is no profile for this user" });
    }
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   POST api/profile
// @desc    Create or update a user profile
// @access  Private

router.post(
  "/",
  [
    auth,
    [
      check("status", "Status is required").not().isEmpty(),
      check("skills", "Skill is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      linkedin,
      github,
      twitter,
      instagram,
    } = req.body;

    // Build profile object
    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    if (skills) {
      profileFields.skills = skills.split(",").map((skill) => skill.trim());
    }
    // Build social object
    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (github) profileFields.social.github = github;
    if (twitter) profileFields.social.twitter = twitter;
    if (instagram) profileFields.social.instagram = instagram;

    try {
      let profile = await Profile.findOne({ user: req.user.id });
      if (profile) {
        // update
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );

        return res.json(profile);
      } else {
        // insert
        profile = new Profile(profileFields);
        await profile.save();
        return res.json(profile);
      }
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route   GET api/profile
// @desc    get all profiles
// @access  public

router.get("/", async (req, res) => {
  try {
    const profiles = await Profile.find().populate("user", ["name", "avatar"]);
    res.json(profiles);
  } catch (err) {
    console.err(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/profile/:user_id
// @desc    GET user by id
// @access  public

router.get("/user/:user_id", async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate("user", ["name", "avatar"]);
    if (!profile) return res.status(404).json({ mesasge: "Profile not found" });
    else res.json(profile);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId")
      return res.status(404).json({ mesasge: "Profile not found" });
    else res.status(500).send("Server Error");
  }
});

// @route   DELETE api/profile
// @desc    Delete profile current user
// @access  Private

router.delete("/", auth, async (req, res) => {
  try {
    // @todo - remove users posts
    // Remove profile
    await Profile.findOneAndRemove({ user: req.user.id });
    // Remove user
    await User.findOneAndRemove({ _id: req.user.id });
    res.json({ message: "User deleted" });
  } catch (err) {
    console.err(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   PUT api/profile/experience
// @desc    Add profile experience
// @access  Private

router.put(
  "/experience",
  [
    auth,
    [
      check("title", "title is required").not().isEmpty(),
      check("company", "company is required").not().isEmpty(),
      check("from", "from date is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array() });
    }

    const { title, company, location, from, to, current, description } =
      req.body;
    const newExp = {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    };

    try {
      let profile = await Profile.findOne({ user: req.user.id });
      console.log(profile);
      profile.experience.unshift(newExp);
      profile.save();
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ message: "Server Error" });
    }
  }
);

// @route   DELETE api/profile/experience/:exp_id
// @desc    Delete experience from profile
// @access  Private

router.delete("/experience/:exp_id", auth, async (req, res) => {
  const exp_id = req.params.exp_id;
  try {
    let profile = await Profile.findOne({ user: req.user.id });
    let removeIndex = await profile.experience
      .map((item) => item.id) // similiar to filter return an array
      .indexOf(exp_id); // get the index
    profile.experience.splice(removeIndex, 1);
    profile.save();
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server Error" });
  }
});
module.exports = router;

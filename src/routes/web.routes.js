const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth.middleware");
const { allowRoles } = require("../middlewares/role.middleware");
const User = require("../models/user.model");

router.get("/dashboard", auth, (req, res) => {
  // debug(req.user);
  const message = req.user.role === "client" ? "Welcome client" : "Welcome Admin";
  res.json({ message });
});


router.get("/users", require("../middlewares/auth.middleware"), async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});


module.exports = router;

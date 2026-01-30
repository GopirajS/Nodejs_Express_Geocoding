const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth.middleware");
const { allowRoles } = require("../middlewares/role.middleware");

router.get("/dashboard", auth, (req, res) => {
  // debug(req.user);
  const message = req.user.role === "client" ? "Welcome client" : "Welcome Admin";
  res.json({ message });
});

module.exports = router;

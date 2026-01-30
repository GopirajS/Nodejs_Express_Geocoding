const express = require("express");
const router = express.Router();
const Plan = require("../models/plan.model");

// Get all plans
router.get("/", async (req, res) => {
  try {
    const plans = await Plan.find();
    res.json({ success: true, data: plans });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
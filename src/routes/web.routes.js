const express = require("express");
const router = express.Router();
const axios = require("axios");

const auth = require("../middlewares/auth.middleware");
const { allowRoles } = require("../middlewares/role.middleware");
const validate = require("../middlewares/validate.middleware");
const { weatherSchema } = require("../validations/payload.validation");
const User = require("../models/user.model");
const Subscription = require("../models/subscription.model");
const UsageLog = require("../models/usageLog.model");

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

// Weather search API
router.post("/weather", auth, allowRoles("client"), validate(weatherSchema), async (req, res) => {
  try {
    const { location } = req.body;
    const user_id = req.user.id;

    // Find active subscription
    const subscription = await Subscription.findOne({ user: user_id, status: "active" });
    if (!subscription) {
      return res.status(403).json({ success: false, message: "No active subscription found" });
    }

    // Check if units are available
    const availableUnits = subscription.plan_units === "Unlimited" ? Infinity : parseInt(subscription.plan_units.replace(/,/g, '')) || 0;
    if (subscription.units_used >= availableUnits) {
      return res.status(403).json({ success: false, message: "No units available in your plan" });
    }

    // Call external weather API
    const weatherResponse = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1`);
    const weatherData = weatherResponse.data;

    // Update units used
    subscription.units_used += 1;
    await subscription.save();

    // Log the request
    const log = new UsageLog({
      user: user_id,
      subscription: subscription._id,
      location,
      request_payload: { location },
      response_data: weatherData,
      units_used: subscription.units_used,
    });
    await log.save();

    res.json({ success: true, data: weatherData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

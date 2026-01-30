const express = require("express");
const router = express.Router();
const Plan = require("../models/plan.model");
const Subscription = require("../models/subscription.model");
const auth = require("../middlewares/auth.middleware");
const { allowRoles } = require("../middlewares/role.middleware");
const validate = require("../middlewares/validate.middleware");
const { subscribeSchema } = require("../validations/payload.validation");

// Get all plans
router.get("/", async (req, res) => {
  try {
    const plans = await Plan.find();
    res.json({ success: true, data: plans });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get user subscriptions
router.get("/subscriptions", auth, async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ user: req.user.id }).populate('plan').sort({ createdAt: -1 });
    res.json({ success: true, data: subscriptions });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Subscribe to a plan (clients only)
router.post("/subscribe", auth, allowRoles("client"), validate(subscribeSchema), async (req, res) => {
  try {
    const { plan_id, start_date } = req.body;
    const user_id = req.user.id;

    // Validate plan exists
    const plan = await Plan.findById(plan_id);

    if (!plan) {
      return res.status(404).json({ success: false, message: "Plan not found" });
    }

    // Calculate end_date as start_date + 30 days
    const startDate = new Date(start_date);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 30);

    // Set any existing active subscription for this user to expired
    await Subscription.updateMany({ user: user_id, status: "active" }, { status: "expired" });

    // Create new subscription
    const subscription = new Subscription({
      user: user_id,
      plan: plan_id,
      start_date: startDate,
      end_date: endDate,
      plan_name: plan.name,
      plan_price: plan.price,
      plan_units: plan.units,
      units_used: 0,
    });

    await subscription.save();

    res.json({ success: true, message: "Subscription created successfully", data: subscription });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
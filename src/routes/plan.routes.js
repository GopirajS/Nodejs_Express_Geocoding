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
    console.error("Subscriptions API error:", error);
    const message = error.message || "Server error";
    res.status(500).json({ success: false, message, status: false });
  }
});

// Get user subscriptions
router.get("/subscriptions", auth, async (req, res) => {
  try {
    // If admin, show all subscriptions; if client, show only their own
    const filter = req.user.role === 'admin' ? {} : { user: req.user.id };
    const subscriptions = await Subscription.find(filter).populate('plan user', 'name email').sort({ createdAt: -1 });
    res.json({ success: true, data: subscriptions });
  } catch (error) {
    console.error("Plans API error:", error);
    const message = error.message || "Server error";
    res.status(500).json({ success: false, message, status: false });
  }
});

// Admin: Get all subscriptions with user details
router.get("/admin/subscriptions", auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: "Access denied. Admin only." });
    }
    const subscriptions = await Subscription.find()
      .populate('plan', 'name price units')
      .populate('user', 'name email role')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: subscriptions });
  } catch (error) {
    console.error("Admin subscriptions API error:", error);
    const message = error.message || "Server error";
    res.status(500).json({ success: false, message, status: false });
  }
});

// Subscribe to a plan (clients only)
router.post("/subscribe", auth, validate(subscribeSchema), async (req, res) => {
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
    console.error("Subscribe API error:", error);
    const message = error.message || "Server error";
    res.status(500).json({ success: false, message, status: false });
  }
});

module.exports = router;
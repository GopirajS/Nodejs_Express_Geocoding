const express = require("express");
const router = express.Router();
const axios = require("axios");

const auth = require("../middlewares/auth.middleware");
const { allowRoles } = require("../middlewares/role.middleware");
const validate = require("../middlewares/validate.middleware");
const { weatherSchema } = require("../validations/payload.validation");
const User = require("../models/user.model");
const Plan = require("../models/plan.model");
const Subscription = require("../models/subscription.model");
const UsageLog = require("../models/usageLog.model");

// Dashboard Stats API
router.get("/dashboard", auth, async (req, res) => {
    try {
        const [usersCount, plansCount, subscriptionsCount] = await Promise.all([
            User.countDocuments(),
            Plan.countDocuments(),
            Subscription.countDocuments()
        ]);

        res.json({
            success: true,
            data: {
                users: usersCount,
                plans: plansCount,
                subscriptions: subscriptionsCount
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
});



router.get("/users", require("../middlewares/auth.middleware"), async (req, res) => {
    try {
        const users = await User.find().select("-password").sort({ createdAt: -1 });
        res.json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// Get usage logs by subscription ID
router.get("/usage-logs/:sub_id", auth, async (req, res) => {
    try {
        const { sub_id } = req.params;
        
        // For clients, verify the subscription belongs to them
        if (req.user.role !== 'admin') {
            const subscription = await Subscription.findOne({ _id: sub_id, user: req.user.id });
            if (!subscription) {
                return res.status(403).json({ success: false, message: "Access denied", status: false });
            }
        }

        const logs = await UsageLog.find({ subscription: sub_id })
            .sort({ createdAt: -1 });


        res.json({ success: true, data: logs });

    } catch (error) {
        console.error("Usage logs API error:", error);
        const message = error.message || "Server error";
        res.status(500).json({ success: false, message, status: false });
    }
});

// Weather search API
router.post("/geocoding", auth, allowRoles("client"), validate(weatherSchema), async (req, res) => {
    try {
        const { location } = req.body;
        const user_id = req.user.id;

        // Find active subscription
        const subscription = await Subscription.findOne({ user: user_id, status: "active" });
        if (!subscription) {
            return res.status(403).json({ success: false, message: "No active subscription found. Pls subscripe any one plan" });
        }

        // Check if units are available
        const availableUnits = subscription.plan_units === "Unlimited" ? Infinity : parseInt(subscription.plan_units.replace(/,/g, '')) || 0;
        if (subscription.units_used >= availableUnits) {
            return res.status(403).json({ success: false, message: "No units available in your plan.pls subscripe the any one plan" });
        }

        const credits_count = availableUnits === Infinity ? "Unlimited" : availableUnits;
        const used_credit = subscription.units_used + 1;
        const remaining_credits = availableUnits === Infinity ? "Unlimited" : availableUnits - subscription.units_used;

        // Call external weather API
        console.log(`Calling Open-Meteo API for location: ${location}`);

        let url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1`;


        debug(url);
        const weatherResponse = await axios.get(url, {
            timeout: 1000000, // 10 second timeout
            headers: {
                'Accept': 'application/json'
            }
        });

        const weatherData = weatherResponse.data;

        // Check if we got valid data
        if (!weatherData || !weatherData.results) {
            return res.status(404).json({
                success: false,
                message: "No results found for this location"
            });
        }

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
            credits_count,
            used_credit,
            remaining_credits,
            units_used: subscription.units_used,
        });
        await log.save();

        res.json({
            success: true,
            data: weatherData,
            credits_count,
            used_credit,
            remaining_credits
        });
    } catch (error) {

        if (error.code === 'ECONNREFUSED') {
            return res.status(503).json({ success: false, message: "Unable to connect to weather service" });
        }
        if (error.response) {
            return res.status(error.response.status).json({
                success: false,
                message: error.response.data?.message || "Weather API error"
            });
        }
        if (error.request) {
            return res.status(504).json({ success: false, message: "Weather service timeout" });
        }

        res.status(500).json({ success: false, message: error.message || "Internal server error" });
    }
});

module.exports = router;

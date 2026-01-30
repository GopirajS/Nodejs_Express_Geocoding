const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    plan: { type: mongoose.Schema.Types.ObjectId, ref: "Plan", required: true },
    start_date: { type: Date, required: true },
    end_date: { type: Date, required: true },
    status: { type: String, enum: ["active", "expired"], default: "active" },
    plan_name: { type: String, required: true },
    plan_price: { type: Number, required: true },
    plan_units: { type: String, required: true },
    units_used: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Subscription", subscriptionSchema);
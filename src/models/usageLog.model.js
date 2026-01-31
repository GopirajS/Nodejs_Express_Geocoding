const mongoose = require("mongoose");

const usageLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    subscription: { type: mongoose.Schema.Types.ObjectId, ref: "Subscription", required: true },
    location: { type: String, required: true },
    request_payload: { type: Object, required: true },
    response_data: { type: Object, required: true },
    credits_count: { type: [String, Number], required: true },
    used_credit: { type: Number, required: true },
    units_used: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("UsageLog", usageLogSchema);
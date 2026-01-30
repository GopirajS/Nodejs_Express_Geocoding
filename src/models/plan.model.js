const mongoose = require("mongoose");

const planSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    units: { type: String, required: true }, // e.g., "100", "10,000", "Unlimited"
  },
  { timestamps: true }
);

module.exports = mongoose.model("Plan", planSchema);
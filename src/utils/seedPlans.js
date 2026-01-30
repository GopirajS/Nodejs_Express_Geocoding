require("dotenv").config();
const connectDB = require("../config/db");
const Plan = require("../models/plan.model");

const plans = [
  { name: "Free", price: 0, units: "100" },
  { name: "Pro", price: 999, units: "10,000" },
  { name: "Enterprise", price: 4999, units: "Unlimited" },
];

const seedPlans = async () => {
  try {
    await connectDB();
    await Plan.deleteMany(); // Clear existing plans
    await Plan.insertMany(plans);
    console.log("Plans seeded successfully");
    process.exit();
  } catch (error) {
    console.error("Error seeding plans:", error);
    process.exit(1);
  }
};

seedPlans();
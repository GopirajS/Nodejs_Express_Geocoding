require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");

connectDB();

// Export app for Vercel serverless deployment
module.exports = app;

// Only start server locally (Vercel handles the serverless entry point)
if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  const PORT = process.env.PORT || 8000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

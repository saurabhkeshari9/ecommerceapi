require("dotenv").config();
const mongoose = require("mongoose");
const seedAdminUser = require("./seed.Admin");

const connectDB = async () => {
  try {
    console.log("Connecting to MongoDB with URI:", process.env.MONGO_URI);

    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Connected to MongoDB");

    // Only run seeding in development mode
    if (process.env.NODE_ENV === "development") {
      await seedAdminUser();
    }
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1); // Force exit on error
  }
};

module.exports = connectDB;
const bcrypt = require("bcryptjs");
const Admin = require("../models/admin.model");

const seedAdminUser = async () => {
  try {
    console.log("Starting admin seeding process...");

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.error("Admin email or password is missing in environment variables.");
      return;
    }

    // Check if admin exists
    const admin = await Admin.findOne({ email: adminEmail , isActive: true });

    if (admin) {
      console.log("Admin already exists");
    }

    // Hash Password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Create Admin
    await Admin.create({
      name: "Admin",
      email: adminEmail,
      password: hashedPassword,
      isActive: true,
    });

    console.log("Admin user seeded successfully");
  
  } catch (err) {
    console.error("Error seeding admin user:", err.message);
  }
};

module.exports = seedAdminUser;
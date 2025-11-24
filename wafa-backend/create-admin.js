import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import User from "./models/userModel.js";

// Load environment variables
dotenv.config();

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    const mongoUrl = process.env.MONGO_URL || "mongodb://localhost:27017/wafa";
    await mongoose.connect(mongoUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Connected to MongoDB");

    // Check if admin already exists
    let existingAdmin = await User.findOne({ email: "admin@wafa.com" });
    
    if (existingAdmin) {
      console.log("Admin account already exists!");
      console.log("Updating admin account to ensure proper configuration...");
      
      // Hash password
      const hashedPassword = await bcrypt.hash("test1234", 10);
      
      // Update existing admin
      existingAdmin.username = "admin";
      existingAdmin.name = "Administrator";
      existingAdmin.password = hashedPassword;
      existingAdmin.isAdmin = true;
      existingAdmin.isAactive = true;
      existingAdmin.emailVerified = true;
      existingAdmin.plan = "Premium";
      existingAdmin.planExpiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
      
      await existingAdmin.save();
      
      console.log("Admin account updated successfully!");
      console.log("Email: admin@wafa.com");
      console.log("Password: test1234");
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash("test1234", 10);

    // Create admin user
    const admin = new User({
      username: "admin",
      name: "Administrator",
      email: "admin@wafa.com",
      password: hashedPassword,
      isAdmin: true,
      isAactive: true,
      emailVerified: true,
      plan: "Premium",
      planExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
    });

    await admin.save();

    console.log("Admin account created successfully!");
    console.log("Email: admin@wafa.com");
    console.log("Password: test1234");
    console.log("Please change this password after first login.");

    process.exit(0);
  } catch (error) {
    console.error("Error creating admin:", error);
    process.exit(1);
  }
};

createAdmin();

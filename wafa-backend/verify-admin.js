import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/userModel.js";

dotenv.config();

const verifyAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to MongoDB");

    const admin = await User.findOne({ email: "admin@wafa.com" });
    
    if (admin) {
      console.log("\n✅ Admin found!");
      console.log("==================");
      console.log("Email:", admin.email);
      console.log("Username:", admin.username);
      console.log("Name:", admin.name);
      console.log("isAdmin:", admin.isAdmin);
      console.log("emailVerified:", admin.emailVerified);
      console.log("isActive:", admin.isAactive);
      console.log("Plan:", admin.plan);
      console.log("==================\n");
    } else {
      console.log("\n❌ Admin not found!");
      console.log("Checking all users...\n");
      const users = await User.find({});
      console.log(`Total users: ${users.length}`);
      users.forEach(u => {
        console.log(`- ${u.email} (${u.username}) - Admin: ${u.isAdmin}`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

verifyAdmin();

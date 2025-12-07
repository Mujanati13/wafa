import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import User from "../models/userModel.js";

dotenv.config();

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Usage: node scripts/recreate-user.js <email>");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URL);

  // Delete existing user
  const deleted = await User.findOneAndDelete({ email });
  if (deleted) {
    console.log("✓ Deleted existing user:", email);
  } else {
    console.log("No existing user found with email:", email);
  }

  // Create new user with Premium Annuel
  const hashedPassword = await bcrypt.hash("test1234", 10);
  const newUser = await User.create({
    email,
    username: email.split("@")[0],
    name: "Krarouch Yousf",
    password: hashedPassword,
    plan: "Premium Annuel",
    semesters: ["S1", "S2", "S3", "S4", "S5", "S6", "S7"],
    planExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    emailVerified: true,
  });

  console.log("✓ Created new user:");
  console.log({
    id: newUser._id,
    email: newUser.email,
    username: newUser.username,
    plan: newUser.plan,
    semesters: newUser.semesters,
    planExpiry: newUser.planExpiry,
    password: "test1234",
  });

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import User from "../models/userModel.js";

dotenv.config();

async function main() {
  const email = process.argv[2];
  const newPassword = process.argv[3];
  if (!email || !newPassword) {
    console.error("Usage: node scripts/set-password.js <email> <password>");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URL);

  const hashed = await bcrypt.hash(newPassword, 10);
  const user = await User.findOneAndUpdate(
    { email },
    { $set: { password: hashed } },
    { new: true }
  );

  if (!user) {
    console.log("User not found");
  } else {
    console.log("Password updated for", user.email);
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

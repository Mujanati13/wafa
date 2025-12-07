import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/userModel.js";

dotenv.config();

async function main() {
  await mongoose.connect(process.env.MONGO_URL);
  const email = process.argv[2];
  if (!email) {
    console.error('Usage: node scripts/check-user.js <email>');
    process.exit(1);
  }
  const user = await User.findOne({ email }).lean();
  if (!user) {
    console.log('User not found');
  } else {
    const { email: e, plan, semesters, planExpiry, firebaseUid, _id } = user;
    console.log({ _id, email: e, plan, semesters, planExpiry, firebaseUid });
  }
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

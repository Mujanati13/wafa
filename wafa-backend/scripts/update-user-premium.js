import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/userModel.js";

dotenv.config();

async function main() {
  await mongoose.connect(process.env.MONGO_URL);
  const email = "Krarouchyousf@gmail.com";
  const update = {
    plan: "Premium Annuel",
    semesters: ["S1", "S2", "S3", "S4", "S5", "S6", "S7"],
    planExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    name: "Krarouch Yousf",
    username: "krarouchyousf",
    emailVerified: true,
  };

  const user = await User.findOneAndUpdate(
    { email },
    { $set: update },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  console.log("User upserted");
  console.log({
    email: user.email,
    plan: user.plan,
    semesters: user.semesters,
    planExpiry: user.planExpiry,
    username: user.username,
  });

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

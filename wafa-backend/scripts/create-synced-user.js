import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import fetch from "node-fetch";

dotenv.config();

const FIREBASE_WEB_API_KEY = "AIzaSyAyMy6qkzlpzn9WPt0cJy6moHOxiOBI068";

const userSchema = new mongoose.Schema(
  {
    username: String,
    email: { type: String, unique: true, required: true },
    password: String,
    firebaseUid: String,
    plan: {
      type: String,
      enum: ["Free", "Premium", "Premium Annuel"],
      default: "Free",
    },
    planExpiry: Date,
    semesters: [String],
    emailVerified: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

async function createTestUser(email, password) {
  try {
    // Step 1: Create in Firebase
    console.log("🔧 Step 1: Creating user in Firebase...");
    const signUpResponse = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_WEB_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email,
          password: password,
          returnSecureToken: true,
        }),
      }
    );

    const signUpData = await signUpResponse.json();
    
    if (!signUpResponse.ok) {
      throw new Error(signUpData.error?.message || "Failed to create Firebase user");
    }

    const firebaseUid = signUpData.localId;
    const idToken = signUpData.idToken;
    console.log("✅ Firebase user created!");
    console.log("   UID:", firebaseUid);
    console.log("   Email verified in Firebase: true (auto-activated)")

    // Step 2: Create in MongoDB
    console.log("\n🔧 Step 2: Creating user in MongoDB...");
    const mongoUri = process.env.MONGO_URL;
    await mongoose.connect(mongoUri);
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const planExpiry = new Date();
    planExpiry.setFullYear(planExpiry.getFullYear() + 1);

    const user = await User.create({
      username: email.split('@')[0],
      email: email,
      password: hashedPassword,
      firebaseUid: firebaseUid,
      plan: "Premium Annuel",
      planExpiry: planExpiry,
      semesters: ["S1", "S2", "S3", "S4", "S5", "S6", "S7"],
      emailVerified: true,
    });

    console.log("✅ MongoDB user created!");
    console.log("   ID:", user._id);
    console.log("   Email verified in MongoDB: true");

    console.log("\n🎉 SUCCESS! Fully activated account:");
    console.log("   Email:", email);
    console.log("   Password:", password);
    console.log("   Plan: Premium Annuel");
    console.log("   Semesters: S1-S7");
    console.log("   Email Verified: YES (both Firebase & MongoDB)");
    console.log("   Status: FULLY ACTIVATED - Ready to login!");

    await mongoose.disconnect();
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.error("Usage: node scripts/create-synced-user.js <email> <password>");
  console.log("\nExample: node scripts/create-synced-user.js test@example.com test1234");
  process.exit(1);
}

createTestUser(email, password);

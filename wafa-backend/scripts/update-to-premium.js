import dotenv from "dotenv";
import fetch from "node-fetch";
import mongoose from "mongoose";
import bcrypt from "bcrypt";

dotenv.config();

const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY || "AIzaSyAyMy6qkzlpzn9WPt0cJy6moHOxiOBI068";

// MongoDB User Schema
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
    emailVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

async function updateUserToPremium(email, password) {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URL || "mongodb://localhost:27017/elearning";
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB");

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Get Firebase UID
    let firebaseUid = null;
    try {
      const signInResponse = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            password,
            returnSecureToken: true,
          }),
        }
      );

      const signInData = await signInResponse.json();
      if (signInResponse.ok) {
        firebaseUid = signInData.localId;
        console.log("✓ Firebase UID:", firebaseUid);
      }
    } catch (e) {
      console.log("⚠️  Could not get Firebase UID");
    }

    // Update MongoDB user
    const planExpiry = new Date();
    planExpiry.setFullYear(planExpiry.getFullYear() + 1); // 1 year from now

    const updateData = {
      email,
      password: hashedPassword,
      plan: "Premium Annuel",
      planExpiry,
      semesters: ["S1", "S2", "S3", "S4", "S5", "S6", "S7"],
      emailVerified: true,
    };

    if (firebaseUid) {
      updateData.firebaseUid = firebaseUid;
    }

    const user = await User.findOneAndUpdate(
      { email },
      updateData,
      { upsert: true, new: true }
    );

    console.log("\n✅ User updated to Premium Annuel!");
    console.log("  Email:", user.email);
    console.log("  Plan:", user.plan);
    console.log("  Semesters:", user.semesters.join(", "));
    console.log("  Expiry:", user.planExpiry.toLocaleDateString());
    console.log("  MongoDB ID:", user._id);
    console.log("  Firebase UID:", user.firebaseUid || "N/A");
    console.log("\n🎉 Login with: " + email + " / " + password);

    await mongoose.disconnect();
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.error("Usage: node scripts/update-to-premium.js <email> <password>");
  process.exit(1);
}

updateUserToPremium(email, password);

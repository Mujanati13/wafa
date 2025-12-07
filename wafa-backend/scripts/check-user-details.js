import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcrypt";

dotenv.config();

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

async function checkUser(email, testPassword) {
  try {
    const mongoUri = process.env.MONGO_URL;
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB\n");

    const user = await User.findOne({ email });
    
    if (!user) {
      console.log("❌ User not found");
      return;
    }

    console.log("📧 Email:", user.email);
    console.log("👤 Username:", user.username || "N/A");
    console.log("🔒 Password Hash:", user.password ? user.password.substring(0, 20) + "..." : "N/A");
    console.log("✅ Email Verified:", user.emailVerified);
    console.log("📦 Plan:", user.plan);
    console.log("📅 Plan Expiry:", user.planExpiry ? user.planExpiry.toLocaleDateString() : "N/A");
    console.log("📚 Semesters:", user.semesters ? user.semesters.join(", ") : "N/A");
    console.log("🔑 Firebase UID:", user.firebaseUid || "N/A");
    console.log("🆔 MongoDB ID:", user._id);
    
    if (testPassword) {
      console.log("\n🔐 Testing password:", testPassword);
      const isMatch = await bcrypt.compare(testPassword, user.password);
      console.log("   Result:", isMatch ? "✅ MATCH" : "❌ NO MATCH");
      
      if (!isMatch) {
        console.log("\n🔧 Generating correct hash for:", testPassword);
        const correctHash = await bcrypt.hash(testPassword, 10);
        console.log("   New hash:", correctHash);
      }
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

const email = process.argv[2];
const testPassword = process.argv[3];

if (!email) {
  console.error("Usage: node scripts/check-user-details.js <email> [password-to-test]");
  process.exit(1);
}

checkUser(email, testPassword);

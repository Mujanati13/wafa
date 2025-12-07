import dotenv from "dotenv";
import admin from "firebase-admin";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  try {
    const serviceAccountPath = path.join(__dirname, "..", "firebase-service-account.json");
    const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf8"));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("✅ Firebase initialized");
  } catch (error) {
    console.error("❌ Firebase initialization failed:", error.message);
    process.exit(1);
  }
}

async function main() {
  const email = process.argv[2];
  const password = process.argv[3];
  
  if (!email || !password) {
    console.error("Usage: node scripts/create-firebase-user.js <email> <password>");
    process.exit(1);
  }

  try {
    // Check if user already exists
    let user;
    try {
      user = await admin.auth().getUserByEmail(email);
      console.log("✓ User already exists in Firebase");
      console.log("  UID:", user.uid);
      console.log("  Email:", user.email);
      console.log("  Updating password...");
      
      // Update password
      await admin.auth().updateUser(user.uid, { password });
      console.log("✓ Password updated successfully");
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        // Create new user
        console.log("Creating new Firebase user...");
        user = await admin.auth().createUser({
          email,
          password,
          emailVerified: true,
          displayName: email.split("@")[0],
        });
        console.log("✓ User created successfully");
        console.log("  UID:", user.uid);
        console.log("  Email:", user.email);
      } else {
        throw error;
      }
    }

    // Set custom claims for premium
    await admin.auth().setCustomUserClaims(user.uid, {
      plan: "Premium Annuel",
      semesters: ["S1", "S2", "S3", "S4", "S5", "S6", "S7"],
    });
    console.log("✓ Custom claims set (Premium Annuel, S1-S7)");

  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

main();

import dotenv from "dotenv";
import fetch from "node-fetch";
import admin from "firebase-admin";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY || "AIzaSyAyMy6qkzlpzn9WPt0cJy6moHOxiOBI068";

// Try to initialize Firebase Admin for custom claims
let adminInitialized = false;
try {
  if (!admin.apps.length) {
    const serviceAccountPath = path.join(__dirname, "..", "firebase-service-account.json");
    const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf8"));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    adminInitialized = true;
    console.log("✅ Firebase Admin initialized");
  }
} catch (error) {
  console.log("⚠️  Firebase Admin not available, will skip custom claims");
}

async function ensureFirebaseUserWithPremium(email, password) {
  try {
    // Try to create user
    const signUpResponse = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`,
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

    const signUpData = await signUpResponse.json();

    if (signUpResponse.ok) {
      console.log("✓ Firebase user created successfully!");
      console.log("  Email:", email);
      console.log("  UID:", signUpData.localId);
      
      if (adminInitialized) {
        try {
          await admin.auth().setCustomUserClaims(signUpData.localId, {
            plan: "Premium Annuel",
            semesters: ["S1", "S2", "S3", "S4", "S5", "S6", "S7"],
          });
          console.log("✓ Custom claims set (Premium Annuel, S1-S7)");
        } catch (claimError) {
          console.log("⚠️  Could not set custom claims:", claimError.message);
        }
      }
      return;
    }

    if (signUpData.error?.message === "EMAIL_EXISTS") {
      console.log("✓ User already exists in Firebase");
      console.log("  Email:", email);
      
      // Sign in to get UID
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
        console.log("  UID:", signInData.localId);
        
        if (adminInitialized) {
          try {
            await admin.auth().setCustomUserClaims(signInData.localId, {
              plan: "Premium Annuel",
              semesters: ["S1", "S2", "S3", "S4", "S5", "S6", "S7"],
            });
            console.log("✓ Custom claims updated (Premium Annuel, S1-S7)");
          } catch (claimError) {
            console.log("⚠️  Could not set custom claims:", claimError.message);
          }
        }
      } else {
        console.log("⚠️  Password may be different. Updating password...");
        // Update password via Admin SDK
        if (adminInitialized) {
          try {
            const user = await admin.auth().getUserByEmail(email);
            await admin.auth().updateUser(user.uid, { password });
            console.log("✓ Password updated to:", password);
            
            await admin.auth().setCustomUserClaims(user.uid, {
              plan: "Premium Annuel",
              semesters: ["S1", "S2", "S3", "S4", "S5", "S6", "S7"],
            });
            console.log("✓ Custom claims set (Premium Annuel, S1-S7)");
          } catch (updateError) {
            console.log("⚠️  Could not update user:", updateError.message);
          }
        }
      }
      return;
    }

    throw new Error(signUpData.error?.message || "Failed to create/update user");
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.error("Usage: node scripts/ensure-firebase-premium.js <email> <password>");
  process.exit(1);
}

ensureFirebaseUserWithPremium(email, password);

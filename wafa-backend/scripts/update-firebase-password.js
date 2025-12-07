import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY || "AIzaSyAyMy6qkzlpzn9WPt0cJy6moHOxiOBI068";
const FIREBASE_WEB_API_KEY = "AIzaSyAyMy6qkzlpzn9WPt0cJy6moHOxiOBI068"; // From the error URL

async function updateFirebasePassword(email, newPassword) {
  try {
    console.log("🔍 Looking up user in Firebase...");
    
    // First, get the user's ID token by signing in with any method
    // We'll use the password reset approach instead
    
    // Step 1: Request password reset
    const resetResponse = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${FIREBASE_WEB_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestType: "PASSWORD_RESET",
          email: email,
        }),
      }
    );

    const resetData = await resetResponse.json();
    
    if (!resetResponse.ok) {
      if (resetData.error?.message === "EMAIL_NOT_FOUND") {
        console.log("❌ User not found in Firebase");
        console.log("\n🔧 Creating user in Firebase...");
        
        // Create the user
        const signUpResponse = await fetch(
          `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_WEB_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: email,
              password: newPassword,
              returnSecureToken: true,
            }),
          }
        );

        const signUpData = await signUpResponse.json();
        
        if (signUpResponse.ok) {
          console.log("✅ User created in Firebase!");
          console.log("   Email:", email);
          console.log("   UID:", signUpData.localId);
          console.log("\n🎉 You can now log in with:", email, "/", newPassword);
          return;
        } else {
          throw new Error(signUpData.error?.message || "Failed to create user");
        }
      }
      throw new Error(resetData.error?.message || "Failed to request password reset");
    }

    console.log("⚠️  Password reset email sent to:", email);
    console.log("   Please check your email and use the reset link.");
    console.log("\nAlternatively, I'll try to create a new account...");
    
    // Try creating account anyway in case it doesn't exist
    const signUpResponse = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_WEB_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email,
          password: newPassword,
          returnSecureToken: true,
        }),
      }
    );

    const signUpData = await signUpResponse.json();
    
    if (signUpResponse.ok) {
      console.log("✅ New Firebase user created!");
      console.log("   Email:", email);
      console.log("   UID:", signUpData.localId);
    } else if (signUpData.error?.message === "EMAIL_EXISTS") {
      console.log("\n⚠️  User already exists in Firebase.");
      console.log("   The password reset email has been sent.");
      console.log("   Please use the link in the email to set password to:", newPassword);
    } else {
      console.log("⚠️  Could not create user:", signUpData.error?.message);
    }

  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

const email = process.argv[2];
const newPassword = process.argv[3];

if (!email || !newPassword) {
  console.error("Usage: node scripts/update-firebase-password.js <email> <new-password>");
  process.exit(1);
}

updateFirebasePassword(email, newPassword);

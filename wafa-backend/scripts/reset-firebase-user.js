import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const FIREBASE_WEB_API_KEY = "AIzaSyAyMy6qkzlpzn9WPt0cJy6moHOxiOBI068";

async function deleteAndRecreateFirebaseUser(email, password) {
  try {
    console.log("🔍 Step 1: Getting user info...");
    
    // Try to sign in to get the ID token (with wrong password, this will fail)
    // So we'll use the lookup endpoint instead via email
    const lookupResponse = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_WEB_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: [email],
        }),
      }
    );

    const lookupData = await lookupResponse.json();
    
    if (lookupData.users && lookupData.users.length > 0) {
      console.log("✅ Found user in Firebase");
      console.log("   UID:", lookupData.users[0].localId);
      console.log("   Email:", lookupData.users[0].email);
      console.log("   Email Verified:", lookupData.users[0].emailVerified || false);
      
      console.log("\n⚠️  Cannot delete user without Admin SDK or valid credentials.");
      console.log("   Trying alternative: Update password via delete account request...");
      
      // The only way to change password without the old password is via password reset
      // Let's create a different email or use password reset
      console.log("\n📧 Sending password reset email...");
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
      if (resetResponse.ok) {
        console.log("✅ Password reset email sent to:", email);
        console.log("\n⚠️  IMPORTANT: Check the email and click the reset link.");
        console.log("   Then set the password to: test1234");
        console.log("\n   OR: Provide a different email to test with.");
      } else {
        console.log("❌ Failed to send reset email:", resetData.error?.message);
      }
      
      return;
    }

    console.log("❌ User not found in Firebase");
    console.log("\n🔧 Creating new user...");
    
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
    
    if (signUpResponse.ok) {
      console.log("✅ Firebase user created!");
      console.log("   Email:", email);
      console.log("   UID:", signUpData.localId);
      console.log("\n🎉 Login credentials:");
      console.log("   Email:", email);
      console.log("   Password:", password);
    } else {
      throw new Error(signUpData.error?.message || "Failed to create user");
    }

  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

const email = process.argv[2] || "Krarouchyousf@gmail.com";
const password = process.argv[3] || "test1234";

deleteAndRecreateFirebaseUser(email, password);

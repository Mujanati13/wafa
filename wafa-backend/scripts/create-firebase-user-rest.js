import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY || "AIzaSyAyMy6qkzlpzn9WPt0cJy6moHOxiOBI068";

async function createFirebaseUser(email, password) {
  try {
    // Create user via Firebase Auth REST API
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          returnSecureToken: true,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      if (data.error?.message === "EMAIL_EXISTS") {
        console.log("✓ User already exists in Firebase");
        console.log("  Email:", email);
        console.log("  You can now log in with password:", password);
        return;
      }
      throw new Error(data.error?.message || "Failed to create user");
    }

    console.log("✓ Firebase user created successfully!");
    console.log("  Email:", email);
    console.log("  UID:", data.localId);
    console.log("  Password:", password);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.error("Usage: node scripts/create-firebase-user-rest.js <email> <password>");
  process.exit(1);
}

createFirebaseUser(email, password);

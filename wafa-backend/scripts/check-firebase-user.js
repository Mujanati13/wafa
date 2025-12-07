import dotenv from "dotenv";
import { getFirebaseUserByEmail } from "../config/firebase.js";

dotenv.config();

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Usage: node scripts/check-firebase-user.js <email>");
    process.exit(1);
  }

  try {
    const firebaseUser = await getFirebaseUserByEmail(email);
    if (!firebaseUser) {
      console.log("User not found in Firebase");
    } else {
      console.log("Firebase User:");
      console.log({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        emailVerified: firebaseUser.emailVerified,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        customClaims: firebaseUser.customClaims,
      });
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
}

main();

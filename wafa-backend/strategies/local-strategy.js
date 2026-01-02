import Passport from "passport";
import { Strategy } from "passport-local";
import user from "../models/userModel.js";
import bcrypt from "bcrypt";

Passport.serializeUser((user, done) => {
  done(null, user._id);
});

Passport.deserializeUser(async (id, done) => {
  try {
    const foundUser = await user.findById(id);
    if (!foundUser) {
      // User no longer exists - clear the session
      console.log("⚠️ Session user not found, clearing session");
      return done(null, false);
    }

    done(null, foundUser);
  } catch (error) {
    done(error, null);
  }
});

export default Passport.use(
  new Strategy({ usernameField: "email" }, async (email, password, done) => {
    try {
      console.log("🔍 Login attempt - Email:", email);
      console.log("🔍 Email type:", typeof email);
      console.log("🔍 Email length:", email?.length);
      
      const foundUser = await user.findOne({ email: email });
      console.log("🔍 User found:", foundUser ? "Yes" : "No");
      
      if (!foundUser) {
        // Check if there are any users at all
        const totalUsers = await user.countDocuments();
        console.log("📊 Total users in DB:", totalUsers);
        
        // Try to find with trimmed email
        const trimmedUser = await user.findOne({ email: email.trim() });
        console.log("🔍 User found with trimmed email:", trimmedUser ? "Yes" : "No");
        
        throw new Error("User not found");
      }

      // Check if email is verified
      if (!foundUser.emailVerified) {
        throw new Error("Please verify your email before logging in. Check your inbox for the verification link.");
      }

      const comparePassword = await bcrypt.compare(
        password,
        foundUser.password
      );
      if (!comparePassword) throw new Error("Invalid credentials");

      return done(null, foundUser);
    } catch (error) {
      done(error, null);
    }
  })
);

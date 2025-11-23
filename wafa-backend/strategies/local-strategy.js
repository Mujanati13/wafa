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
    if (!foundUser) throw new Error("User not found");

    done(null, foundUser);
  } catch (error) {
    done(error, null);
  }
});

export default Passport.use(
  new Strategy({ usernameField: "email" }, async (email, password, done) => {
    try {
      const foundUser = await user.findOne({ email: email });
      if (!foundUser) throw new Error("User not found");

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

import express from "express";
import "../strategies/local-strategy.js";
import "../strategies/google-strategy.js";
import passport from "passport";
import { AuthController } from "../controllers/auth.js";

const router = express.Router();

router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return res.status(500).json({ message: err.message });
    if (!user) return res.status(401).json({ message: info.message });
    
    // Establish session
    req.login(user, (loginErr) => {
      if (loginErr) {
        return res.status(500).json({ message: "Failed to establish session" });
      }
      
      return res.status(200).json({
        message: "Login successful",
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
        },
      });
    });
  })(req, res, next);
});

router.post("/register", AuthController.register);
router.post("/logout", AuthController.logout);
router.get("/check-auth", AuthController.checkAuth);

// Email verification
router.get("/verify-email", AuthController.verifyEmail);
router.post("/resend-verification", AuthController.resendVerification);

// Password reset
router.post("/forgot-password", AuthController.forgotPassword);
router.post("/reset-password", AuthController.resetPassword);
router.post("/change-password", AuthController.changePassword);

// Firebase Authentication
router.post("/firebase", AuthController.firebaseAuth);
router.post("/check-email", AuthController.checkEmail);

// Google OAuth (only if configured)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  router.get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
  );

  router.get(
    "/google/callback",
    passport.authenticate("google", { failureRedirect: "/login" }),
    (req, res) => {
      // Successful authentication, redirect to dashboard
      res.redirect(`${process.env.FRONTEND_URL}/dashboard/home`);
    }
  );
}

export default router;
// Example Express route

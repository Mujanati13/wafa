import express from "express";
import "../strategies/local-strategy.js";
import passport from "passport";
import { AuthController } from "../controllers/auth.js";

const router = express.Router();

router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return res.status(500).json({ message: err.message });
    if (!user) return res.status(401).json({ message: info.message });
    return res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  })(req, res, next);
});

router.post("/register", AuthController.register);
router.post("/logout", AuthController.logout);
router.get("/check-auth", AuthController.checkAuth);

export default router;
// Example Express route

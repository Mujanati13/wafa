import { Router } from "express";
import { UserController } from "../controllers/userController.js";

const router = Router();

// Get all users with pagination
router.get("/", UserController.getAllUsers);

// Get free users (plan: "Free")
router.get("/free", UserController.getFreeUsers);

// Get paying users (plan: not "Free")
router.get("/paying", UserController.getPayingUsers);

// Get user statistics
router.get("/stats", UserController.getUserStats);

// Update user plan
router.patch("/:userId/plan", UserController.updateUserPlan);

// Toggle user active status
router.patch("/:userId/status", UserController.toggleUserStatus);

export default router;

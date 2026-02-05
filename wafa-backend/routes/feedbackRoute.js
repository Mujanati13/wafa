import { Router } from "express";
import {
  getAllFeedbacks,
  getApprovedFeedbacks,
  getFeedbackById,
  createFeedback,
  updateFeedback,
  deleteFeedback,
  toggleApproval,
  toggleFeatured,
} from "../controllers/feedbackController.js";
import { isAuthenticated, isAdmin } from "../middleware/authMiddleware.js";

const router = Router();

// Public route - get approved feedbacks for landing page
router.get("/", getApprovedFeedbacks);

// Admin routes (protected)
router.get("/admin", isAuthenticated, isAdmin, getAllFeedbacks);
router.get("/:id", isAuthenticated, isAdmin, getFeedbackById);
router.post("/", isAuthenticated, isAdmin, createFeedback);
router.put("/:id", isAuthenticated, isAdmin, updateFeedback);
router.delete("/:id", isAuthenticated, isAdmin, deleteFeedback);
router.patch("/:id/approve", isAuthenticated, isAdmin, toggleApproval);
router.patch("/:id/feature", isAuthenticated, isAdmin, toggleFeatured);

export default router;

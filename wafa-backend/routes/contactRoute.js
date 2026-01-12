import { Router } from "express";
import { contactController } from "../controllers/contactController.js";
import { isAuthenticated, isAdmin } from "../middleware/authMiddleware.js";

const router = Router();

// Public route
router.post("/", contactController.create);

// Protected routes (requires authentication)
router.get("/my-messages", isAuthenticated, contactController.getMyMessages);

// Admin routes - must authenticate first, then check admin role
router.get("/", isAuthenticated, isAdmin, contactController.getAll);
router.get("/:id", isAuthenticated, isAdmin, contactController.getById);
router.patch("/:id/status", isAuthenticated, isAdmin, contactController.updateStatus);
router.delete("/:id", isAuthenticated, isAdmin, contactController.delete);

export default router;

import { Router } from "express";
import { contactController } from "../controllers/contactController.js";
import { isAuthenticated, isAdmin } from "../middleware/authMiddleware.js";

const router = Router();

// Public route
router.post("/", contactController.create);

// Protected routes (requires authentication)
router.get("/my-messages", isAuthenticated, contactController.getMyMessages);

// Admin routes
router.get("/", isAdmin, contactController.getAll);
router.get("/:id", isAdmin, contactController.getById);
router.patch("/:id/status", isAdmin, contactController.updateStatus);
router.delete("/:id", isAdmin, contactController.delete);

export default router;

import express from "express";
import PaypalSettingsController from "../controllers/paypalSettingsController.js";
import { isAuthenticated, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public route - get client ID for frontend
router.get("/public", PaypalSettingsController.getPublicSettings);

// Admin routes
router.get("/", isAuthenticated, isAdmin, PaypalSettingsController.getSettings);
router.put("/", isAuthenticated, isAdmin, PaypalSettingsController.updateSettings);
router.post("/test-connection", isAuthenticated, isAdmin, PaypalSettingsController.testConnection);

export default router;

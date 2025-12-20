import { Router } from "express";
import { landingPageSettingsController } from "../controllers/landingPageSettingsController.js";
import { isAuthenticated, isAdmin } from "../middleware/authMiddleware.js";

const router = Router();

// Public route - get settings for landing page display
router.get("/", landingPageSettingsController.getSettings);

// Admin routes - update settings (protected)
router.put("/", isAuthenticated, isAdmin, landingPageSettingsController.updateSettings);
router.patch("/hero", isAuthenticated, isAdmin, landingPageSettingsController.updateHero);
router.patch("/timer", isAuthenticated, isAdmin, landingPageSettingsController.updateTimer);
router.patch("/pricing", isAuthenticated, isAdmin, landingPageSettingsController.updatePricing);
router.patch("/faq", isAuthenticated, isAdmin, landingPageSettingsController.updateFAQ);
router.patch("/contact", isAuthenticated, isAdmin, landingPageSettingsController.updateContact);
router.patch("/branding", isAuthenticated, isAdmin, landingPageSettingsController.updateBranding);
router.patch("/promotion", isAuthenticated, isAdmin, landingPageSettingsController.updatePromotion);

export default router;

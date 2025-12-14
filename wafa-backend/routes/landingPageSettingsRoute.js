import { Router } from "express";
import { landingPageSettingsController } from "../controllers/landingPageSettingsController.js";

const router = Router();

// Public route - get settings for landing page display
router.get("/", landingPageSettingsController.getSettings);

// Admin routes - update settings
router.put("/", landingPageSettingsController.updateSettings);
router.patch("/hero", landingPageSettingsController.updateHero);
router.patch("/timer", landingPageSettingsController.updateTimer);
router.patch("/pricing", landingPageSettingsController.updatePricing);
router.patch("/faq", landingPageSettingsController.updateFAQ);
router.patch("/contact", landingPageSettingsController.updateContact);
router.patch("/promotion", landingPageSettingsController.updatePromotion);

export default router;

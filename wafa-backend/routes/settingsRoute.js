import express from 'express';
import { getPrivacyPolicy, updatePrivacyPolicy } from '../controllers/privacyPolicyController.js';
import { isAuthenticated, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route
router.get('/privacy-policy', getPrivacyPolicy);

// Admin only routes
router.put('/privacy-policy', isAuthenticated, isAdmin, updatePrivacyPolicy);

export default router;

import express from 'express';
import { getPrivacyPolicy, updatePrivacyPolicy, getTermsOfUse, updateTermsOfUse } from '../controllers/privacyPolicyController.js';
import { isAuthenticated, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/privacy-policy', getPrivacyPolicy);
router.get('/terms-of-use', getTermsOfUse);

// Admin only routes
router.put('/privacy-policy', isAuthenticated, isAdmin, updatePrivacyPolicy);
router.put('/terms-of-use', isAuthenticated, isAdmin, updateTermsOfUse);

export default router;

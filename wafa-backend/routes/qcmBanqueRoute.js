import express from "express";
import { qcmBanqueController } from "../controllers/qcmBanqueController.js";
import { isAuthenticated, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get all QCM Banques
router.get("/all", isAuthenticated, qcmBanqueController.getAll);

// Get single QCM Banque by ID
router.get("/:id", isAuthenticated, qcmBanqueController.getById);

// Create QCM Banque (admin only)
router.post("/", isAuthenticated, isAdmin, qcmBanqueController.create);

// Update QCM Banque (admin only)
router.put("/:id", isAuthenticated, isAdmin, qcmBanqueController.update);

// Delete QCM Banque (admin only)
router.delete("/:id", isAuthenticated, isAdmin, qcmBanqueController.delete);

export default router;

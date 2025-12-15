import { Router } from "express";
import { explanationController } from "../controllers/explanationController.js";
import validate from "../middleware/validateSchema.js";
import explanationSchema from "../validators/ExplanationSchema.js";
import { isAuthenticated, isAdmin } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/create", isAuthenticated, validate(explanationSchema), explanationController.create);
router.get("/", explanationController.getAll);
router.get("/:id", explanationController.getById);
router.put("/:id", isAuthenticated, validate(explanationSchema), explanationController.update);
router.delete("/:id", isAuthenticated, explanationController.delete);
router.get("/question/:questionId", explanationController.getByQuestionId);
router.patch("/:id/status", isAuthenticated, isAdmin, explanationController.updateStatus);

// New voting endpoints
router.post("/:id/vote", isAuthenticated, explanationController.vote);
router.get("/slots/:questionId", explanationController.getSlotsInfo);
router.post("/ai/create", isAuthenticated, isAdmin, explanationController.createAiExplanation);

export default router;

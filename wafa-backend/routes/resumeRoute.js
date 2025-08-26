import { Router } from "express";
import { resumeController } from "../controllers/resumeController.js";
import validate from "../middleware/validateSchema.js";
import resumeSchema from "../validators/ResumeSchema.js";

const router = Router();

// Base CRUD routes
router.post("/create", validate(resumeSchema), resumeController.create);
router.get("/", resumeController.getAll);
router.get("/:id", resumeController.getById);
router.put("/:id", validate(resumeSchema), resumeController.update);
router.delete("/:id", resumeController.delete);

// Additional routes
router.get("/question/:questionId", resumeController.getByQuestionId);
router.get("/user/:userId", resumeController.getByUserId);
router.patch("/:id/status", resumeController.updateStatus);

export default router;

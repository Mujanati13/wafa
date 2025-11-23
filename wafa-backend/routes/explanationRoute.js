import { Router } from "express";
import { explanationController } from "../controllers/explanationController.js";
import validate from "../middleware/validateSchema.js";
import explanationSchema from "../validators/ExplanationSchema.js";

const router = Router();

router.post("/create", validate(explanationSchema), explanationController.create);
router.get("/", explanationController.getAll);
router.get("/:id", explanationController.getById);
router.put("/:id", validate(explanationSchema), explanationController.update);
router.delete("/:id", explanationController.delete);
router.get("/question/:questionId", explanationController.getByQuestionId);
router.patch("/:id/status", explanationController.updateStatus);

export default router;

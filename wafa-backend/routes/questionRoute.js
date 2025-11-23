import express from "express";
import { questionController } from "../controllers/questionController.js";
import validate from "../middleware/validateSchema.js";
import QuestionSchema from "../validators/QuestionSchema.js";

const router = express.Router();

router.post("/create", validate(QuestionSchema.createQuestionSchema), questionController.create);
router.patch("/update/:id", validate(QuestionSchema.updateQuestionSchema), questionController.update);
router.delete("/delete/:id", questionController.delete);
router.get("/all", questionController.getAll);
router.get("/by-exam/:examId", questionController.getByExamId);
router.get("/all/:id", questionController.getById);

export default router;



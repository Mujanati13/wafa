import express from "express";
import { examController } from "../controllers/examController.js";
import ExamParYearSchema from "../validators/ExamParYearSchema.js"
import validate from "../middleware/validateSchema.js";
const router = express.Router();

router.post("/create", validate(ExamParYearSchema), examController.createExam);

export default router;

import express from "express";
import { examController } from "../controllers/examController.js";
import ExamParYearSchema from "../validators/ExamParYearSchema.js"
import validate from "../middleware/validateSchema.js";
const router = express.Router();

router.post("/create", validate(ExamParYearSchema.examParYearSchema), examController.create);
router.patch("/update/:id", validate(ExamParYearSchema.updateExamParYearSchema), examController.update);
router.delete("/delete/:id", examController.delete);
router.get("/all", examController.getAll);
router.get("/all/:id", examController.getById);

export default router;

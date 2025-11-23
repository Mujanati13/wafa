import express from "express";
import { reportQuestionsController } from "../controllers/reportQuestionsController.js";
import validate from "../middleware/validateSchema.js";
import ReportQuestionsSchema from "../validators/ReportQuestionsSchema.js";

const router = express.Router();

router.post("/create", validate(ReportQuestionsSchema.createReportSchema), reportQuestionsController.create);
router.patch("/update/:id", validate(ReportQuestionsSchema.updateReportSchema), reportQuestionsController.update);
router.patch("/:id/approve", reportQuestionsController.approve);
router.delete("/:id", reportQuestionsController.delete);
router.get("/all", reportQuestionsController.getAll);
router.get("/by-user/:userId", reportQuestionsController.getByUserId);
router.get("/by-question/:questionId", reportQuestionsController.getByQuestionId);
router.get("/:id", reportQuestionsController.getById);

export default router;



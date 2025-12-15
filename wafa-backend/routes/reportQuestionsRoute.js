import express from "express";
import { reportQuestionsController } from "../controllers/reportQuestionsController.js";
import validate from "../middleware/validateSchema.js";
import ReportQuestionsSchema from "../validators/ReportQuestionsSchema.js";
import { isAuthenticated, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", isAuthenticated, validate(ReportQuestionsSchema.createReportSchema), reportQuestionsController.create);
router.patch("/update/:id", isAuthenticated, isAdmin, validate(ReportQuestionsSchema.updateReportSchema), reportQuestionsController.update);
router.patch("/:id/approve", isAuthenticated, isAdmin, reportQuestionsController.approve);
router.patch("/:id/reject", isAuthenticated, isAdmin, reportQuestionsController.reject);
router.delete("/:id", isAuthenticated, isAdmin, reportQuestionsController.delete);
router.get("/all", isAuthenticated, isAdmin, reportQuestionsController.getAll);
router.get("/search", isAuthenticated, isAdmin, reportQuestionsController.searchReports);
router.get("/details/:id", isAuthenticated, isAdmin, reportQuestionsController.getReportDetails);
router.get("/by-user/:userId", isAuthenticated, reportQuestionsController.getByUserId);
router.get("/by-question/:questionId", isAuthenticated, reportQuestionsController.getByQuestionId);
router.get("/:id", isAuthenticated, reportQuestionsController.getById);
export default router;
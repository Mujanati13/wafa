import express from "express";
import { questionController } from "../controllers/questionController.js";
import validate from "../middleware/validateSchema.js";
import QuestionSchema from "../validators/QuestionSchema.js";
import { isAuthenticated, isAdmin } from "../middleware/authMiddleware.js";
import { uploadQuestionImages } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/create", isAuthenticated, isAdmin, validate(QuestionSchema.createQuestionSchema), questionController.create);
router.patch("/update/:id", isAuthenticated, isAdmin, validate(QuestionSchema.updateQuestionSchema), questionController.update);
router.delete("/delete/:id", isAuthenticated, isAdmin, questionController.delete);
router.get("/all", questionController.getAll);
router.get("/by-exam/:examId", questionController.getByExamId);
router.get("/all/:id", questionController.getById);

// New filtered and bulk endpoints
router.get("/filtered", isAuthenticated, questionController.getFiltered);
router.post("/bulk-delete", isAuthenticated, isAdmin, questionController.bulkDelete);
router.get("/export", isAuthenticated, isAdmin, questionController.exportToExcel);

// Image upload endpoints
router.post("/upload-images", isAuthenticated, isAdmin, uploadQuestionImages, questionController.uploadImages);
router.post("/attach-images", isAuthenticated, isAdmin, questionController.attachImagesToQuestions);

export default router;



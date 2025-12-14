import { Router } from "express";
import { examCourseController } from "../controllers/examCourseController.js";

const router = Router();

// CRUD operations
router.get("/", examCourseController.getAll);
router.get("/:id", examCourseController.getById);
router.post("/", examCourseController.create);
router.put("/:id", examCourseController.update);
router.delete("/:id", examCourseController.delete);

// Question linking operations
router.post("/:id/link-questions", examCourseController.linkQuestions);
router.delete("/:id/unlink-question/:questionId", examCourseController.unlinkQuestion);

// Helper endpoints
router.get("/available-questions", examCourseController.getAvailableQuestions);
router.get("/module/:moduleId/exam-years", examCourseController.getExamYearsForModule);
router.get("/module/:moduleId/categories", examCourseController.getCategoriesForModule);

export default router;

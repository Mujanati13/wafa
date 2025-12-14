import { Router } from "express";
import { resumeController } from "../controllers/resumeController.js";
import validate from "../middleware/validateSchema.js";
import resumeSchema from "../validators/ResumeSchema.js";
import { uploadPDF } from "../middleware/uploadMiddleware.js";

const router = Router();

// Base CRUD routes
router.post("/create", validate(resumeSchema), resumeController.create);
router.get("/", resumeController.getAll);
router.get("/with-modules", resumeController.getAllWithModules);
router.get("/:id", resumeController.getById);
router.put("/:id", validate(resumeSchema), resumeController.update);
router.delete("/:id", resumeController.delete);

// Admin upload with file
router.post("/admin-upload", uploadPDF.single('pdf'), resumeController.adminUpload);

// Additional routes
router.get("/question/:questionId", resumeController.getByQuestionId);
router.get("/user/:userId", resumeController.getByUserId);
router.patch("/:id/status", resumeController.updateStatus);

export default router;

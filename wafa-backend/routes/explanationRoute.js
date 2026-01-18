import { Router } from "express";
import { explanationController } from "../controllers/explanationController.js";
import validate from "../middleware/validateSchema.js";
import explanationSchema from "../validators/ExplanationSchema.js";
import { isAuthenticated, isAdmin } from "../middleware/authMiddleware.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "..", "uploads", "explanations");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for local disk storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, "explanation-" + uniqueSuffix + ext);
    }
});

const uploadExplanationFiles = multer({
    storage: storage,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB max per file
    fileFilter: (req, file, cb) => {
        const acceptedDocTypes = [
            'application/pdf',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        
        if (file.fieldname === 'images' && file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else if (file.fieldname === 'pdf' && acceptedDocTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Types acceptés: PDF, PPTX, DOC, DOCX"), false);
        }
    }
}).fields([
    { name: 'images', maxCount: 5 },
    { name: 'pdf', maxCount: 1 }
]);

// Create with file upload support
router.post("/create", isAuthenticated, uploadExplanationFiles, explanationController.create);
// Admin bulk create with file upload support
router.post("/admin-create", isAuthenticated, isAdmin, uploadExplanationFiles, explanationController.adminCreate);
// Upload document endpoint (PDF, PPTX, Word) - returns URL
router.post("/upload-pdf", isAuthenticated, isAdmin, multer({
    storage: storage,
    limits: { fileSize: 100 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const acceptedDocTypes = [
            'application/pdf',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        
        if (acceptedDocTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Types acceptés: PDF, PPTX, DOC, DOCX"), false);
        }
    }
}).single('pdf'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: "Aucun fichier fourni" });
    }
    const fileUrl = `/uploads/explanations/${req.file.filename}`;
    res.json({ success: true, data: { url: fileUrl, filename: req.file.filename } });
});

// Gemini AI generation endpoints - MUST come before /:id routes
router.get("/test-gemini", isAuthenticated, isAdmin, explanationController.testGeminiConnection);
router.post("/generate-gemini", isAuthenticated, isAdmin, explanationController.generateWithGemini);
router.post("/batch-generate-gemini", isAuthenticated, isAdmin, explanationController.batchGenerateWithGemini);

// Upload PDF for context extraction
router.post("/upload-pdf-context", isAuthenticated, isAdmin, multer({
    storage: storage,
    limits: { fileSize: 20 * 1024 * 1024 }, // 20MB max
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error("Seuls les fichiers PDF sont acceptés"), false);
        }
    }
}).single('pdf'), explanationController.extractPdfContext);

// Specific routes before parameterized routes
router.get("/question/:questionId", explanationController.getByQuestionId);
router.get("/slots/:questionId", explanationController.getSlotsInfo);
router.post("/ai/create", isAuthenticated, isAdmin, explanationController.createAiExplanation);

// General CRUD routes
router.get("/", explanationController.getAll);
router.get("/:id", explanationController.getById);
router.put("/:id", isAuthenticated, validate(explanationSchema), explanationController.update);
router.delete("/:id", isAuthenticated, explanationController.delete);
router.patch("/:id/status", isAuthenticated, isAdmin, explanationController.updateStatus);

// Voting endpoints
router.post("/:id/vote", isAuthenticated, explanationController.vote);

export default router;

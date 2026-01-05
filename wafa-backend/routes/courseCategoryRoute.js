import { Router } from "express";
import { courseCategoryController } from "../controllers/courseCategoryController.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "..", "uploads", "categories");
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
        cb(null, "category-" + uniqueSuffix + ext);
    }
});

const uploadCategoryImage = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("Veuillez télécharger une image valide"), false);
        }
    }
}).single("categoryImage");

// Create with image upload
router.post("/create-with-image", uploadCategoryImage, async (req, res) => {
    try {
        if (req.file) {
            req.body.imageUrl = `/uploads/categories/${req.file.filename}`;
        }
        return courseCategoryController.create(req, res);
    } catch (error) {
        console.error("Error uploading category image:", error);
        res.status(500).json({ success: false, message: error.message || "Erreur lors de l'upload de l'image" });
    }
});

// Update with image upload
router.put("/update-with-image/:id", uploadCategoryImage, async (req, res) => {
    try {
        if (req.file) {
            req.body.imageUrl = `/uploads/categories/${req.file.filename}`;
        } else if (req.body.existingImageUrl) {
            req.body.imageUrl = req.body.existingImageUrl;
        }
        return courseCategoryController.update(req, res);
    } catch (error) {
        console.error("Error updating category with image:", error);
        res.status(500).json({ success: false, message: error.message || "Erreur lors de la mise à jour" });
    }
});

// CRUD operations
router.get("/", courseCategoryController.getAll);
router.get("/:id", courseCategoryController.getById);
router.post("/", courseCategoryController.create);
router.put("/:id", courseCategoryController.update);
router.delete("/:id", courseCategoryController.delete);

// Module-specific endpoints
router.get("/module/:moduleId", courseCategoryController.getByModuleId);
router.get("/module/:moduleId/names", courseCategoryController.getCategoryNames);

export default router;

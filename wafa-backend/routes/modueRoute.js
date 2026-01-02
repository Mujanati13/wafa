import { Router } from "express"
import validate from "../middleware/validateSchema.js"
import moduleSchema from "../validators/ModuleSchema.js"
import { moduleController } from "../controllers/moduleController.js"
import multer from "multer"
import path from "path"
import fs from "fs"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = Router()

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "..", "uploads", "modules")
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true })
}

// Configure multer for local disk storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir)
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9)
        const ext = path.extname(file.originalname)
        cb(null, "module-" + uniqueSuffix + ext)
    }
})

const uploadModuleImage = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
    fileFilter: (req, file, cb) => {
        // Accept images and PDFs
        if (file.mimetype.startsWith("image/") || file.mimetype === "application/pdf") {
            cb(null, true)
        } else {
            cb(new Error("Veuillez télécharger une image ou un PDF valide"), false)
        }
    }
}).fields([
    { name: "moduleImage", maxCount: 1 },
    { name: "helpImage", maxCount: 1 },
    { name: "helpPdf", maxCount: 1 }
])

// Create a new module with image upload
router.post("/create-with-image", uploadModuleImage, async (req, res) => {
    try {
        // Handle main module image
        if (req.files && req.files.moduleImage && req.files.moduleImage[0]) {
            req.body.imageUrl = `/uploads/modules/${req.files.moduleImage[0].filename}`
        }
        
        // Handle help image
        if (req.files && req.files.helpImage && req.files.helpImage[0]) {
            req.body.helpImage = `/uploads/modules/${req.files.helpImage[0].filename}`
        }
        
        // Handle help PDF
        if (req.files && req.files.helpPdf && req.files.helpPdf[0]) {
            req.body.helpPdf = `/uploads/modules/${req.files.helpPdf[0].filename}`
        }

        return moduleController.create(req, res)
    } catch (error) {
        console.error("Error uploading module files:", error)
        res.status(500).json({ success: false, message: error.message || "Erreur lors de l'upload des fichiers" })
    }
})

// Update module with image upload
router.put("/update-with-image/:id", uploadModuleImage, async (req, res) => {
    try {
        console.log("Update module with image - received body:", req.body);
        console.log("Update module with image - received files:", req.files ? Object.keys(req.files) : "none");
        
        // Handle main module image - new upload takes priority, otherwise preserve existing
        if (req.files && req.files.moduleImage && req.files.moduleImage[0]) {
            req.body.imageUrl = `/uploads/modules/${req.files.moduleImage[0].filename}`
        } else if (req.body.existingImageUrl) {
            req.body.imageUrl = req.body.existingImageUrl
        }
        
        // Handle help image - new upload takes priority, otherwise preserve existing
        if (req.files && req.files.helpImage && req.files.helpImage[0]) {
            req.body.helpImage = `/uploads/modules/${req.files.helpImage[0].filename}`
        } else if (req.body.existingHelpImage) {
            req.body.helpImage = req.body.existingHelpImage
        }
        
        // Handle help PDF - new upload takes priority, otherwise preserve existing
        if (req.files && req.files.helpPdf && req.files.helpPdf[0]) {
            req.body.helpPdf = `/uploads/modules/${req.files.helpPdf[0].filename}`
        } else if (req.body.existingHelpPdf) {
            req.body.helpPdf = req.body.existingHelpPdf
        }

        req.params.id = req.params.id
        return moduleController.update(req, res)
    } catch (error) {
        console.error("Error uploading module files:", error)
        res.status(500).json({ success: false, message: error.message || "Erreur lors de l'upload des fichiers" })
    }
})

// Create a new module
router.post("/create", validate(moduleSchema), moduleController.create)

// Get all modules
router.get("/", moduleController.getAll)

// Get a single module by ID
router.get("/:id", moduleController.getById)

// Update a module (partial updates allowed)
router.put("/:id", moduleController.update)

// Delete a module
router.delete("/:id", moduleController.delete)

export default router
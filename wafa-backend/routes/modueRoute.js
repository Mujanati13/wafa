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
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true)
        } else {
            cb(new Error("Veuillez télécharger une image valide"), false)
        }
    }
}).single("moduleImage")

// Create a new module with image upload
router.post("/create-with-image", uploadModuleImage, async (req, res) => {
    try {
        let imageUrl = ""

        if (req.file) {
            // Create URL path for the uploaded image
            imageUrl = `/uploads/modules/${req.file.filename}`
        }

        // Call the regular create but with the uploaded image URL
        req.body.imageUrl = imageUrl
        return moduleController.create(req, res)
    } catch (error) {
        console.error("Error uploading module image:", error)
        res.status(500).json({ success: false, message: error.message || "Erreur lors de l'upload de l'image" })
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
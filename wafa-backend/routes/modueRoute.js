import { Router } from "express"
import validate from "../middleware/validateSchema.js"
import moduleSchema from "../validators/ModuleSchema.js"
import { moduleController } from "../controllers/moduleController.js"
const router = Router()

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
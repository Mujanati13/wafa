import asyncHandler from "../handlers/asyncHandler.js"
import moduleSchema from "../models/moduleModel.js";

export const moduleController = {
    create: asyncHandler(async (req, res) => {
        const { name, semester, imageUrl, infoText } = req.body;
        const newModule = await moduleSchema.create({
            name,
            semester,
            imageUrl,
            infoText
        });
        res.status(201).json({
            success: true,
            data: newModule
        });
    }),

    update: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { name, semester, imageUrl, infoText } = req.body;
        
        const updatedModule = await moduleSchema.findByIdAndUpdate(
            id,
            { name, semester, imageUrl, infoText },
            { new: true, runValidators: true }
        );

        if (!updatedModule) {
            return res.status(404).json({
                success: false,
                message: "Module not found"
            });
        }

        res.status(200).json({
            success: true,
            data: updatedModule
        });
    }),

    delete: asyncHandler(async (req, res) => {
        const { id } = req.params;
        
        const deletedModule = await moduleSchema.findByIdAndDelete(id);

        if (!deletedModule) {
            return res.status(404).json({
                success: false,
                message: "Module not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Module deleted successfully"
        });
    }),

    getAll: asyncHandler(async (req, res) => {
        const modules = await moduleSchema.find({});
        
        res.status(200).json({
            success: true,
            count: modules.length,
            data: modules
        });
    }),

    getById: asyncHandler(async (req, res) => {
        const { id } = req.params;
        
        const module = await moduleSchema.findById(id);

        if (!module) {
            return res.status(404).json({
                success: false,
                message: "Module not found"
            });
        }

        res.status(200).json({
            success: true,
            data: module
        });
    })
};

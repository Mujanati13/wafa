import explanationModel from "../models/explanationModel.js";
import asyncHandler from '../handlers/asyncHandler.js';

export const explanationController = {
    create: asyncHandler(async (req, res) => {
        const { userId, questionId, title, contentText, imageUrl } = req.body;
        const newExplanation = await explanationModel.create({
            userId,
            questionId,
            title,
            contentText,
            imageUrl,
            status: "pending" // default status
        });
        res.status(201).json({
            success: true,
            data: newExplanation
        });
    }),

    update: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { title, contentText, imageUrl, status } = req.body;
        
        const updatedExplanation = await explanationModel.findByIdAndUpdate(
            id,
            {
                title,
                contentText,
                imageUrl,
                status
            },
            { new: true, runValidators: true }
        );

        if (!updatedExplanation) {
            return res.status(404).json({
                success: false,
                message: "Explanation not found"
            });
        }

        res.status(200).json({
            success: true,
            data: updatedExplanation
        });
    }),

    delete: asyncHandler(async (req, res) => {
        const { id } = req.params;
        
        const deletedExplanation = await explanationModel.findByIdAndDelete(id);

        if (!deletedExplanation) {
            return res.status(404).json({
                success: false,
                message: "Explanation not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Explanation deleted successfully"
        });
    }),

    getAll: asyncHandler(async (req, res) => {
        const explanations = await explanationModel.find()
            .populate('userId', 'name email') // Assuming user has these fields
            .populate('questionId');
        
        res.status(200).json({
            success: true,
            count: explanations.length,
            data: explanations
        });
    }),

    getById: asyncHandler(async (req, res) => {
        const { id } = req.params;
        
        const explanation = await explanationModel.findById(id)
            .populate('userId', 'name email')
            .populate('questionId');

        if (!explanation) {
            return res.status(404).json({
                success: false,
                message: "Explanation not found"
            });
        }

        res.status(200).json({
            success: true,
            data: explanation
        });
    }),

    // Additional method to get explanations by question ID
    getByQuestionId: asyncHandler(async (req, res) => {
        const { questionId } = req.params;
        
        const explanations = await explanationModel.find({ questionId })
            .populate('userId', 'name email')
            .populate('questionId');

        res.status(200).json({
            success: true,
            count: explanations.length,
            data: explanations
        });
    }),

    // Additional method to update explanation status
    updateStatus: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { status } = req.body;

        if (!['pending', 'approved', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status value"
            });
        }

        const updatedExplanation = await explanationModel.findByIdAndUpdate(
            id,
            { status },
            { new: true, runValidators: true }
        );

        if (!updatedExplanation) {
            return res.status(404).json({
                success: false,
                message: "Explanation not found"
            });
        }

        res.status(200).json({
            success: true,
            data: updatedExplanation
        });
    })
};

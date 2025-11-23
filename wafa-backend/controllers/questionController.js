import asyncHandler from "../handlers/asyncHandler.js";
import QuestionModel from "../models/questionModule.js";

export const questionController = {
    create: asyncHandler(async (req, res) => {
        const { examId, text, options, note, images, sessionLabel } = req.body;
        const newQuestion = await QuestionModel.create({ examId, text, options, note, images, sessionLabel });
        res.status(201).json({ success: true, data: newQuestion });
    }),

    update: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { examId, text, options, note, images } = req.body;
        const updated = await QuestionModel.findByIdAndUpdate(
            id,
            { examId, text, options, note, images },
            { new: true, runValidators: true }
        );
        if (!updated) {
            return res.status(404).json({ success: false, message: "Question not found" });
        }
        res.status(200).json({ success: true, data: updated });
    }),

    delete: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const deleted = await QuestionModel.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ success: false, message: "Question not found" });
        }
        res.status(200).json({ success: true, message: "Question deleted successfully", data: deleted });
    }),

    getAll: asyncHandler(async (req, res) => {
        const questions = await QuestionModel.find();
        res.status(200).json({ success: true, data: questions });
    }),

    getById: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const question = await QuestionModel.findById(id);
        if (!question) {
            return res.status(404).json({ success: false, message: "Question not found" });
        }
        res.status(200).json({ success: true, data: question });
    }),

    getByExamId: asyncHandler(async (req, res) => {
        const { examId } = req.params;
        const questions = await QuestionModel.find({ examId });
        res.status(200).json({ success: true, data: questions });
    })
};



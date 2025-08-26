import asyncHandler from "../handlers/asyncHandler.js";
import ReportQuestions from "../models/reportQuestions.js";

export const reportQuestionsController = {
    create: asyncHandler(async (req, res) => {
        const { userId, questionId, details, status } = req.body;
        const report = await ReportQuestions.create({ userId, questionId, details, status });
        res.status(201).json({ success: true, data: report });
    }),

    update: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { userId, questionId, details, status } = req.body;
        const updated = await ReportQuestions.findByIdAndUpdate(
            id,
            { userId, questionId, details, status },
            { new: true, runValidators: true }
        );
        if (!updated) {
            return res.status(404).json({ success: false, message: "Report not found" });
        }
        res.status(200).json({ success: true, data: updated });
    }),

    delete: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const deleted = await ReportQuestions.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ success: false, message: "Report not found" });
        }
        res.status(200).json({ success: true, message: "Report deleted successfully", data: deleted });
    }),

    getAll: asyncHandler(async (req, res) => {
        const reports = await ReportQuestions.find();
        res.status(200).json({ success: true, data: reports });
    }),

    getById: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const report = await ReportQuestions.findById(id);
        if (!report) {
            return res.status(404).json({ success: false, message: "Report not found" });
        }
        res.status(200).json({ success: true, data: report });
    }),

    getByUserId: asyncHandler(async (req, res) => {
        const { userId } = req.params;
        const reports = await ReportQuestions.find({ userId });
        res.status(200).json({ success: true, data: reports });
    }),

    getByQuestionId: asyncHandler(async (req, res) => {
        const { questionId } = req.params;
        const reports = await ReportQuestions.find({ questionId });
        res.status(200).json({ success: true, data: reports });
    })
};



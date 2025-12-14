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
        const reports = await ReportQuestions.find()
            .populate({ path: "userId", select: "username email" })
            .populate({ 
                path: "questionId", 
                select: "text examId sessionLabel",
                populate: {
                    path: "examId",
                    select: "name year moduleId",
                    populate: {
                        path: "moduleId",
                        select: "name category"
                    }
                }
            })
            .lean();

        const shaped = reports.map((r) => ({
            ...r,
            username: r.userId?.username,
            userEmail: r.userId?.email,
            questionTitle: r.questionId?.text,
            questionSessionLabel: r.questionId?.sessionLabel,
            examName: r.questionId?.examId?.name,
            examYear: r.questionId?.examId?.year,
            moduleName: r.questionId?.examId?.moduleId?.name,
            moduleCategory: r.questionId?.examId?.moduleId?.category,
        }));

        res.status(200).json({ success: true, data: shaped });
    }),

    getById: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const report = await ReportQuestions.findById(id)
            .populate({ path: "userId", select: "username" })
            .populate({ path: "questionId", select: "text" })
            .lean();
        if (!report) {
            return res.status(404).json({ success: false, message: "Report not found" });
        }
        res.status(200).json({
            success: true,
            data: {
                ...report,
                username: report.userId?.username,
                questionTitle: report.questionId?.text,
            },
        });
    }),

    getByUserId: asyncHandler(async (req, res) => {
        const { userId } = req.params;
        const reports = await ReportQuestions.find({ userId })
            .populate({ path: "userId", select: "username" })
            .populate({ path: "questionId", select: "text" })
            .lean();

        const shaped = reports.map((r) => ({
            ...r,
            username: r.userId?.username,
            questionTitle: r.questionId?.text,
        }));

        res.status(200).json({ success: true, data: shaped });
    }),

    getByQuestionId: asyncHandler(async (req, res) => {
        const { questionId } = req.params;
        const reports = await ReportQuestions.find({ questionId })
            .populate({ path: "userId", select: "username" })
            .populate({ path: "questionId", select: "text" })
            .lean();

        const shaped = reports.map((r) => ({
            ...r,
            username: r.userId?.username,
            questionTitle: r.questionId?.text,
        }));

        res.status(200).json({ success: true, data: shaped });
    }),

    approve: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const updated = await ReportQuestions.findByIdAndUpdate(
            id,
            { status: "approved" },
            { new: true, runValidators: true }
        )
            .populate({ path: "userId", select: "username" })
            .populate({ path: "questionId", select: "text" })
            .lean();
        
        if (!updated) {
            return res.status(404).json({ success: false, message: "Report not found" });
        }
        
        res.status(200).json({ 
            success: true, 
            message: "Report approved successfully",
            data: {
                ...updated,
                username: updated.userId?.username,
                questionTitle: updated.questionId?.text,
            }
        });
    }),

    reject: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const updated = await ReportQuestions.findByIdAndUpdate(
            id,
            { status: "rejected" },
            { new: true, runValidators: true }
        )
            .populate({ path: "userId", select: "username" })
            .populate({ path: "questionId", select: "text" })
            .lean();
        
        if (!updated) {
            return res.status(404).json({ success: false, message: "Report not found" });
        }
        
        res.status(200).json({ 
            success: true, 
            message: "Report rejected successfully",
            data: {
                ...updated,
                username: updated.userId?.username,
                questionTitle: updated.questionId?.text,
            }
        });
    })
};



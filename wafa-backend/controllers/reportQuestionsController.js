import asyncHandler from "../handlers/asyncHandler.js";
import ReportQuestions from "../models/reportQuestions.js";
import Question from "../models/questionModule.js";

export const reportQuestionsController = {
    create: asyncHandler(async (req, res) => {
        const { questionId, details, status } = req.body;
        // Get userId from authenticated user
        const userId = req.user?._id || req.body.userId;
        
        if (!userId) {
            return res.status(401).json({ success: false, message: "User not authenticated" });
        }
        
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
                select: "text examId qcmBanqueId sessionLabel",
                populate: [
                    {
                        path: "examId",
                        select: "name year moduleId category courseName",
                        populate: {
                            path: "moduleId",
                            select: "name category"
                        }
                    },
                    {
                        path: "qcmBanqueId",
                        select: "name moduleId",
                        populate: {
                            path: "moduleId",
                            select: "name category"
                        }
                    }
                ]
            })
            .lean();

        // Get question counts for all related exams/qcm banques
        const examIds = [...new Set(reports.map(r => r.questionId?.examId?._id).filter(Boolean))];
        const qcmBanqueIds = [...new Set(reports.map(r => r.questionId?.qcmBanqueId?._id).filter(Boolean))];

        // Count questions per exam
        const examQuestionCounts = {};
        if (examIds.length > 0) {
            const examCounts = await Question.aggregate([
                { $match: { examId: { $in: examIds } } },
                { $group: { _id: "$examId", count: { $sum: 1 } } }
            ]);
            examCounts.forEach(c => { examQuestionCounts[c._id.toString()] = c.count; });
        }

        // Count questions per QCM Banque
        const qcmQuestionCounts = {};
        if (qcmBanqueIds.length > 0) {
            const qcmCounts = await Question.aggregate([
                { $match: { qcmBanqueId: { $in: qcmBanqueIds } } },
                { $group: { _id: "$qcmBanqueId", count: { $sum: 1 } } }
            ]);
            qcmCounts.forEach(c => { qcmQuestionCounts[c._id.toString()] = c.count; });
        }

        const shaped = reports.map((r) => {
            const examId = r.questionId?.examId?._id?.toString();
            const qcmBanqueId = r.questionId?.qcmBanqueId?._id?.toString();
            
            return {
                ...r,
                username: r.userId?.username,
                userEmail: r.userId?.email,
                questionTitle: r.questionId?.text,
                questionSessionLabel: r.questionId?.sessionLabel,
                examName: r.questionId?.examId?.name || r.questionId?.qcmBanqueId?.name,
                examYear: r.questionId?.examId?.year,
                moduleName: r.questionId?.examId?.moduleId?.name || r.questionId?.qcmBanqueId?.moduleId?.name,
                moduleCategory: r.questionId?.examId?.moduleId?.category || r.questionId?.qcmBanqueId?.moduleId?.category,
                // Course specific fields
                courseCategory: r.questionId?.examId?.category || null,
                courseName: r.questionId?.examId?.courseName || r.questionId?.examId?.name,
                // Number of questions in the exam/course
                numberOfQuestions: examId 
                    ? examQuestionCounts[examId] || 0
                    : qcmBanqueId 
                        ? qcmQuestionCounts[qcmBanqueId] || 0
                        : 0,
            };
        });

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
            { status: "resolved" },
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
    }),

    // Search and filter reports (by user/email and date)
    searchReports: asyncHandler(async (req, res) => {
        const { search, dateFrom, dateTo, status, page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const filter = {};

        // Status filter
        if (status && ['pending', 'resolved', 'rejected'].includes(status)) {
            filter.status = status;
        }

        // Date filter
        if (dateFrom || dateTo) {
            filter.createdAt = {};
            if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
            if (dateTo) {
                const endDate = new Date(dateTo);
                endDate.setHours(23, 59, 59, 999);
                filter.createdAt.$lte = endDate;
            }
        }

        let reports = await ReportQuestions.find(filter)
            .populate({ path: "userId", select: "username email" })
            .populate({
                path: "questionId",
                select: "text examId sessionLabel options",
                populate: {
                    path: "examId",
                    select: "name year moduleId category",
                    populate: {
                        path: "moduleId",
                        select: "name semester"
                    }
                }
            })
            .sort({ createdAt: -1 })
            .lean();

        // Search filter (applied after population)
        if (search) {
            const searchLower = search.toLowerCase();
            reports = reports.filter(r =>
                r.userId?.username?.toLowerCase().includes(searchLower) ||
                r.userId?.email?.toLowerCase().includes(searchLower)
            );
        }

        // Get total before pagination
        const total = reports.length;

        // Apply pagination
        reports = reports.slice(skip, skip + parseInt(limit));

        const shaped = reports.map((r) => ({
            ...r,
            username: r.userId?.username,
            userEmail: r.userId?.email,
            questionTitle: r.questionId?.text,
            questionOptions: r.questionId?.options,
            questionSessionLabel: r.questionId?.sessionLabel,
            examName: r.questionId?.examId?.name,
            examYear: r.questionId?.examId?.year,
            examCategory: r.questionId?.examId?.category,
            moduleName: r.questionId?.examId?.moduleId?.name,
            moduleSemester: r.questionId?.examId?.moduleId?.semester,
        }));

        res.status(200).json({
            success: true,
            data: shaped,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    }),

    // Get detailed report with full question context
    getReportDetails: asyncHandler(async (req, res) => {
        const { id } = req.params;

        const report = await ReportQuestions.findById(id)
            .populate({ path: "userId", select: "username email profilePicture" })
            .populate({
                path: "questionId",
                select: "text options images note sessionLabel examId",
                populate: {
                    path: "examId",
                    select: "name year category moduleId courseName",
                    populate: {
                        path: "moduleId",
                        select: "name semester color"
                    }
                }
            })
            .lean();

        if (!report) {
            return res.status(404).json({ success: false, message: "Report not found" });
        }

        res.status(200).json({
            success: true,
            data: {
                _id: report._id,
                details: report.details,
                status: report.status,
                createdAt: report.createdAt,
                user: {
                    username: report.userId?.username,
                    email: report.userId?.email,
                    profilePicture: report.userId?.profilePicture
                },
                question: {
                    _id: report.questionId?._id,
                    text: report.questionId?.text,
                    options: report.questionId?.options,
                    images: report.questionId?.images,
                    note: report.questionId?.note,
                    sessionLabel: report.questionId?.sessionLabel
                },
                exam: {
                    name: report.questionId?.examId?.name,
                    year: report.questionId?.examId?.year,
                    category: report.questionId?.examId?.category,
                    courseName: report.questionId?.examId?.courseName
                },
                module: {
                    name: report.questionId?.examId?.moduleId?.name,
                    semester: report.questionId?.examId?.moduleId?.semester,
                    color: report.questionId?.examId?.moduleId?.color
                }
            }
        });
    })
};

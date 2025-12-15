import asyncHandler from "../handlers/asyncHandler.js";
import QuestionModel from "../models/questionModule.js";
import ExamParYear from "../models/examParYearModel.js";

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
    }),

    // Get questions with advanced filters (module, exam type, category, course name)
    getFiltered: asyncHandler(async (req, res) => {
        const { moduleId, examType, category, courseName, page = 1, limit = 50 } = req.query;
        
        // Build filter for exams first
        const examFilter = {};
        if (moduleId) examFilter.moduleId = moduleId;
        if (category) examFilter.category = category;
        if (courseName) examFilter.courseName = courseName;

        // Get matching exam IDs
        const exams = await ExamParYear.find(examFilter).select('_id');
        const examIds = exams.map(e => e._id);

        // Get questions for those exams
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const questions = await QuestionModel.find({ examId: { $in: examIds } })
            .populate({
                path: 'examId',
                select: 'name moduleId category courseName year',
                populate: { path: 'moduleId', select: 'name semester' }
            })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await QuestionModel.countDocuments({ examId: { $in: examIds } });

        res.status(200).json({
            success: true,
            data: questions,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    }),

    // Bulk delete questions by exam ID or filter
    bulkDelete: asyncHandler(async (req, res) => {
        const { examId, questionIds, moduleId, courseName } = req.body;

        let deleteFilter = {};
        let deletedCount = 0;

        if (questionIds && Array.isArray(questionIds) && questionIds.length > 0) {
            // Delete specific questions by IDs
            const result = await QuestionModel.deleteMany({ _id: { $in: questionIds } });
            deletedCount = result.deletedCount;
        } else if (examId) {
            // Delete all questions for a specific exam
            const result = await QuestionModel.deleteMany({ examId });
            deletedCount = result.deletedCount;
        } else if (moduleId || courseName) {
            // Delete questions by module or course
            const examFilter = {};
            if (moduleId) examFilter.moduleId = moduleId;
            if (courseName) examFilter.courseName = courseName;
            
            const exams = await ExamParYear.find(examFilter).select('_id');
            const examIds = exams.map(e => e._id);
            
            const result = await QuestionModel.deleteMany({ examId: { $in: examIds } });
            deletedCount = result.deletedCount;
        } else {
            return res.status(400).json({
                success: false,
                message: "Veuillez spécifier examId, questionIds, moduleId ou courseName"
            });
        }

        res.status(200).json({
            success: true,
            message: `${deletedCount} question(s) supprimée(s) avec succès`,
            deletedCount
        });
    }),

    // Export questions to Excel format (JSON for frontend to convert)
    exportToExcel: asyncHandler(async (req, res) => {
        const { examId, moduleId, courseName, category } = req.query;

        let filter = {};
        
        if (examId) {
            filter.examId = examId;
        } else if (moduleId || courseName || category) {
            const examFilter = {};
            if (moduleId) examFilter.moduleId = moduleId;
            if (category) examFilter.category = category;
            if (courseName) examFilter.courseName = courseName;
            
            const exams = await ExamParYear.find(examFilter).select('_id');
            const examIds = exams.map(e => e._id);
            filter.examId = { $in: examIds };
        }

        const questions = await QuestionModel.find(filter)
            .populate({
                path: 'examId',
                select: 'name moduleId category courseName year',
                populate: { path: 'moduleId', select: 'name semester' }
            })
            .lean();

        // Format data for Excel export
        const exportData = questions.map((q, index) => ({
            'N°': index + 1,
            'Module': q.examId?.moduleId?.name || '',
            'Semestre': q.examId?.moduleId?.semester || '',
            'Examen': q.examId?.name || '',
            'Catégorie': q.examId?.category || '',
            'Cours': q.examId?.courseName || '',
            'Année': q.examId?.year || '',
            'Session': q.sessionLabel || '',
            'Question': q.text || '',
            'Option A': q.options?.[0]?.text || '',
            'Option A Correcte': q.options?.[0]?.isCorrect ? 'Oui' : 'Non',
            'Option B': q.options?.[1]?.text || '',
            'Option B Correcte': q.options?.[1]?.isCorrect ? 'Oui' : 'Non',
            'Option C': q.options?.[2]?.text || '',
            'Option C Correcte': q.options?.[2]?.isCorrect ? 'Oui' : 'Non',
            'Option D': q.options?.[3]?.text || '',
            'Option D Correcte': q.options?.[3]?.isCorrect ? 'Oui' : 'Non',
            'Option E': q.options?.[4]?.text || '',
            'Option E Correcte': q.options?.[4]?.isCorrect ? 'Oui' : 'Non',
            'Note': q.note || '',
            'Images': q.images?.join(', ') || ''
        }));

        res.status(200).json({
            success: true,
            data: exportData,
            count: exportData.length,
            filename: `questions_export_${new Date().toISOString().split('T')[0]}.xlsx`
        });
    })
};

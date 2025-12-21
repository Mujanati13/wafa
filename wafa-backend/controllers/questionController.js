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
    }),

    // Upload images to Cloudinary and return URLs
    uploadImages: asyncHandler(async (req, res) => {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Aucune image fournie"
            });
        }

        // Dynamic import to avoid circular dependency
        const { uploadImagesToCloudinary } = await import("../middleware/uploadMiddleware.js");

        const uploadedImages = await uploadImagesToCloudinary(req.files);

        res.status(200).json({
            success: true,
            message: `${uploadedImages.length} image(s) téléchargée(s) avec succès`,
            data: uploadedImages
        });
    }),

    // Attach images to questions by question numbers
    attachImagesToQuestions: asyncHandler(async (req, res) => {
        const { examId, imageUrls, questionNumbers } = req.body;

        if (!examId || !imageUrls || !questionNumbers) {
            return res.status(400).json({
                success: false,
                message: "examId, imageUrls et questionNumbers sont requis"
            });
        }

        // Parse question numbers (e.g., "1-3,5,7-9" => [1,2,3,5,7,8,9])
        const parseNumbers = (str) => {
            const result = [];
            const parts = str.split(',').map(s => s.trim());
            for (const part of parts) {
                if (part.includes('-')) {
                    const [start, end] = part.split('-').map(Number);
                    for (let i = start; i <= end; i++) {
                        result.push(i);
                    }
                } else {
                    result.push(Number(part));
                }
            }
            return [...new Set(result)].sort((a, b) => a - b);
        };

        const numbers = parseNumbers(questionNumbers);

        // Get questions for this exam
        const questions = await QuestionModel.find({ examId }).sort({ createdAt: 1 });

        if (questions.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Aucune question trouvée pour cet examen"
            });
        }

        // Attach images to specified questions (1-indexed)
        let updatedCount = 0;
        for (const num of numbers) {
            const index = num - 1; // Convert to 0-indexed
            if (index >= 0 && index < questions.length) {
                const question = questions[index];
                const currentImages = question.images || [];
                const newImages = [...currentImages, ...imageUrls];

                await QuestionModel.findByIdAndUpdate(question._id, {
                    images: newImages
                });
                updatedCount++;
            }
        }

        res.status(200).json({
            success: true,
            message: `Images attachées à ${updatedCount} question(s)`,
            updatedCount
        });
    })
};

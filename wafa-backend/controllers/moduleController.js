import asyncHandler from "../handlers/asyncHandler.js"
import moduleSchema from "../models/moduleModel.js";

import examParYearModel from "../models/examParYearModel.js";
import questionModule from "../models/questionModule.js";

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
        const updateData = {};

        // Only include fields that are provided in the request
        if (req.body.name !== undefined) updateData.name = req.body.name;
        if (req.body.semester !== undefined) updateData.semester = req.body.semester;
        if (req.body.imageUrl !== undefined) updateData.imageUrl = req.body.imageUrl;
        if (req.body.infoText !== undefined) updateData.infoText = req.body.infoText;

        console.log(`Updating module ${id} with data:`, updateData);

        const updatedModule = await moduleSchema.findByIdAndUpdate(
            id,
            updateData,
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
        // Get all modules
        const modules = await moduleSchema.find({}).lean();

        // Get all ExamParYears for all modules
        const moduleIds = modules.map(m => m._id);
        const examParYears = await examParYearModel.find({ moduleId: { $in: moduleIds } }).lean();

        // Map moduleId to examParYearIds
        const moduleIdToExamParYearIds = {};
        examParYears.forEach(epy => {
            if (!moduleIdToExamParYearIds[epy.moduleId]) {
                moduleIdToExamParYearIds[epy.moduleId] = [];
            }
            moduleIdToExamParYearIds[epy.moduleId].push(epy._id);
        });

        // Get all questions for all examParYears
        const allExamParYearIds = examParYears.map(epy => epy._id);
        const questions = await questionModule.find({ examId: { $in: allExamParYearIds } }).lean();

        // Build a map from examParYearId -> moduleId
        const examIdToModuleId = {};
        examParYears.forEach(epy => {
            examIdToModuleId[epy._id.toString()] = epy.moduleId.toString();
        });

        // Group exams by moduleId
        const moduleIdToExams = {};
        examParYears.forEach(epy => {
            const moduleId = epy.moduleId.toString();
            if (!moduleIdToExams[moduleId]) moduleIdToExams[moduleId] = [];
            moduleIdToExams[moduleId].push(epy);
        });

        // Count questions per module
        const moduleIdToQuestionCount = {};
        const moduleIdToQuestions = {};
        questions.forEach(q => {
            // Find which module this question belongs to
            const examId = q.examId.toString();
            const moduleId = examIdToModuleId[examId];
            if (!moduleId) return;
            if (!moduleIdToQuestionCount[moduleId]) moduleIdToQuestionCount[moduleId] = 0;
            if (!moduleIdToQuestions[moduleId]) moduleIdToQuestions[moduleId] = [];
            moduleIdToQuestionCount[moduleId]++;
            moduleIdToQuestions[moduleId].push(q);
        });

        // Attach question count to each module
        const modulesWithRelations = modules.map(m => ({
            ...m,
            totalQuestions: moduleIdToQuestionCount[m._id.toString()] || 0,
            exams: moduleIdToExams[m._id.toString()] || [],
            questions: moduleIdToQuestions[m._id.toString()] || []
        }));

        res.status(200).json({
            success: true,
            count: modulesWithRelations.length,
            data: modulesWithRelations
        });
    }),

    getById: asyncHandler(async (req, res) => {
        const { id } = req.params;

        // Get the module
        const module = await moduleSchema.findById(id).lean();
        if (!module) {
            return res.status(404).json({
                success: false,
                message: "Module not found"
            });
        }

        // Get all ExamParYears for this module
        const examParYears = await examParYearModel.find({ moduleId: id }).lean();
        const examParYearIds = examParYears.map(epy => epy._id);

        // Get count of questions for these examParYears
        const questions = await questionModule.find({ examId: { $in: examParYearIds } }).lean();
        const questionCount = questions.length;

        res.status(200).json({
            success: true,
            data: {
                ...module,
                exams: examParYears,
                questions,
                totalQuestions: questionCount
            }
        });
    })
};

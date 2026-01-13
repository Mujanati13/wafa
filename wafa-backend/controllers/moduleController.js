import asyncHandler from "../handlers/asyncHandler.js"
import moduleSchema from "../models/moduleModel.js";

import examParYearModel from "../models/examParYearModel.js";
import questionModule from "../models/questionModule.js";
import UserStats from "../models/userStatsModel.js";
import examCourseModel from "../models/examCourseModel.js";
import qcmBanqueModel from "../models/qcmBanqueModel.js";

export const moduleController = {
    create: asyncHandler(async (req, res) => {
        const { name, semester, imageUrl, infoText, color, helpContent, helpImage, helpPdf, difficulty, contentType, textContent } = req.body;
        const newModule = await moduleSchema.create({
            name,
            semester,
            imageUrl,
            infoText,
            color: color || "#6366f1",
            helpContent,
            helpImage,
            helpPdf,
            difficulty: difficulty || "medium",
            contentType: contentType || "url",
            textContent
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
        if (req.body.color !== undefined) updateData.color = req.body.color;
        if (req.body.helpContent !== undefined) updateData.helpContent = req.body.helpContent;
        if (req.body.helpImage !== undefined) updateData.helpImage = req.body.helpImage;
        if (req.body.helpPdf !== undefined) updateData.helpPdf = req.body.helpPdf;
        if (req.body.difficulty !== undefined) updateData.difficulty = req.body.difficulty;
        if (req.body.contentType !== undefined) updateData.contentType = req.body.contentType;
        if (req.body.textContent !== undefined) updateData.textContent = req.body.textContent;

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

        // Get all ExamParYears for this module - only select necessary fields
        const examParYears = await examParYearModel.find({ moduleId: id })
            .select('name year imageUrl infoText')
            .lean();
        const examParYearIds = examParYears.map(epy => epy._id);

        // Only count questions, don't fetch them all (huge performance improvement)
        const questionCount = await questionModule.countDocuments({ examId: { $in: examParYearIds } });

        res.status(200).json({
            success: true,
            data: {
                ...module,
                exams: examParYears,
                totalQuestions: questionCount
            }
        });
    }),

    // Get module stats for current user
    getUserModuleStats: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const userId = req.user._id;

        // Get the module
        const module = await moduleSchema.findById(id).lean();
        if (!module) {
            return res.status(404).json({
                success: false,
                message: "Module not found"
            });
        }

        // Get all exam types for this module
        const [examParYears, examCourses, qcmBanques] = await Promise.all([
            examParYearModel.find({ moduleId: id }).lean(),
            examCourseModel.find({ moduleId: id }).lean(),
            qcmBanqueModel.find({ moduleId: id }).lean()
        ]);

        // Collect all exam IDs
        const allExamIds = [
            ...examParYears.map(e => e._id),
            ...examCourses.map(e => e._id),
            ...qcmBanques.map(e => e._id)
        ];

        // Get all questions for these exams
        const questions = await questionModule.find({ 
            examId: { $in: allExamIds } 
        }).lean();
        
        const totalQuestions = questions.length;

        // Get user stats
        const userStats = await UserStats.findOne({ userId }).lean();
        
        let questionsAnswered = 0;
        let percentage = 0;

        if (userStats && userStats.answeredQuestions) {
            // Count how many questions from this module the user has answered
            const answeredQuestionsMap = userStats.answeredQuestions;
            
            // Convert Map to object if needed
            const answeredQuestionsObj = answeredQuestionsMap instanceof Map 
                ? Object.fromEntries(answeredQuestionsMap)
                : answeredQuestionsMap;

            // Count answered questions for this module
            questions.forEach(q => {
                if (answeredQuestionsObj[q._id.toString()]) {
                    questionsAnswered++;
                }
            });

            // Calculate percentage
            if (totalQuestions > 0) {
                percentage = Math.round((questionsAnswered / totalQuestions) * 100);
            }
        }

        res.status(200).json({
            success: true,
            data: {
                moduleId: id,
                moduleName: module.name,
                totalQuestions,
                questionsAnswered,
                percentage
            }
        });
    }),

    // Upload AI context files to a module
    uploadAiContextFiles: asyncHandler(async (req, res) => {
        const { id } = req.params; // module ID
        
        const module = await moduleSchema.findById(id);
        if (!module) {
            return res.status(404).json({
                success: false,
                message: "Module non trouvé"
            });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Aucun fichier fourni"
            });
        }

        // Process uploaded files
        const newFiles = req.files.map(file => ({
            filename: file.originalname,
            url: `/uploads/ai-context/${file.filename}`,
            size: file.size,
            uploadedAt: new Date(),
            uploadedBy: req.user._id
        }));

        // Add to module's aiContextFiles array
        module.aiContextFiles = [...(module.aiContextFiles || []), ...newFiles];
        await module.save();

        res.status(200).json({
            success: true,
            message: `${newFiles.length} fichier(s) ajouté(s) avec succès`,
            data: {
                moduleId: module._id,
                aiContextFiles: module.aiContextFiles
            }
        });
    }),

    // Get AI context files for a module
    getAiContextFiles: asyncHandler(async (req, res) => {
        const { id } = req.params;
        
        const module = await moduleSchema.findById(id).select('aiContextFiles name').lean();
        if (!module) {
            return res.status(404).json({
                success: false,
                message: "Module non trouvé"
            });
        }

        res.status(200).json({
            success: true,
            data: {
                moduleId: module._id,
                moduleName: module.name,
                aiContextFiles: module.aiContextFiles || []
            }
        });
    }),

    // Delete an AI context file from a module
    deleteAiContextFile: asyncHandler(async (req, res) => {
        const { id, fileId } = req.params; // module ID and file _id
        
        const module = await moduleSchema.findById(id);
        if (!module) {
            return res.status(404).json({
                success: false,
                message: "Module non trouvé"
            });
        }

        // Find and remove the file from the array
        const fileIndex = module.aiContextFiles.findIndex(
            f => f._id.toString() === fileId
        );

        if (fileIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "Fichier non trouvé"
            });
        }

        // Get file info before removing
        const fileToDelete = module.aiContextFiles[fileIndex];
        
        // Remove from array
        module.aiContextFiles.splice(fileIndex, 1);
        await module.save();

        // Optionally delete the physical file from disk
        try {
            const fs = await import('fs');
            const path = await import('path');
            const filePath = path.join(process.cwd(), 'uploads', 'ai-context', path.basename(fileToDelete.url));
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        } catch (error) {
            console.error('Error deleting physical file:', error);
            // Continue even if physical file deletion fails
        }

        res.status(200).json({
            success: true,
            message: "Fichier supprimé avec succès",
            data: {
                moduleId: module._id,
                deletedFile: fileToDelete,
                remainingFiles: module.aiContextFiles
            }
        });
    })
};

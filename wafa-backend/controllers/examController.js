import examModel from "../models/examParYearModel.js";
import asyncHandler from '../handlers/asyncHandler.js';
import QuestionModel from "../models/questionModule.js";
import { NotificationController } from "./notificationController.js";

export const examController = {
    create: asyncHandler(async (req, res) => {

        const { name, moduleId, year, imageUrl, infoText } = req.body;
        const newExam = await examModel.create({
            name,
            moduleId,
            year,
            imageUrl,
            infoText
        });
        res.status(201).json({
            success: true,
            data: newExam
        });

    }),

    update: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { name, moduleId, year, imageUrl, infoText } = req.body;
        const updatedExam = await examModel.findByIdAndUpdate(
            id,
            {
                name,
                moduleId,
                year,
                imageUrl,
                infoText
            },
            { new: true }
        );
        if (!updatedExam) {
            return res.status(404).json({
                success: false,
                message: "Exam not found"
            });
        }
        res.status(200).json({
            success: true,
            data: updatedExam
        });
    }),

    delete: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const deletedExam = await examModel.findByIdAndDelete(id);
        if (!deletedExam) {
            return res.status(404).json({
                success: false,
                message: "Exam not found"
            });
        }
        res.status(200).json({
            success: true,
            message: "Exam deleted successfully",
            data: deletedExam
        });
    }),
    getAll: asyncHandler(async (req, res) => {
        // Get all exams and populate related module name and color
        const exams = await examModel.find().populate('moduleId', 'name color').lean();
        // For each exam, get its related questions
        const examIds = exams.map(e => e._id);
        // Assuming QuestionModel has a field 'examId' referencing exam
        const questions = await QuestionModel.find({ examId: { $in: examIds } }).lean();

        // Group questions by examId
        const questionsByExam = {};
        questions.forEach(q => {
            const key = q.examId?.toString();
            if (!questionsByExam[key]) questionsByExam[key] = [];
            questionsByExam[key].push(q);
        });

        // Attach questions and moduleName to each exam
        const examsWithQuestions = exams.map(exam => ({
            ...exam,
            moduleName: typeof exam.moduleId === 'object' && exam.moduleId !== null ? exam.moduleId.name : undefined,
            moduleColor: typeof exam.moduleId === 'object' && exam.moduleId !== null ? exam.moduleId.color : '#6366f1',
            questions: questionsByExam[exam._id.toString()] || []
        }));

        res.status(200).json({
            success: true,
            data: examsWithQuestions
        });
    }),
    getById: asyncHandler(async (req, res) => {
        const { id } = req.params;

        // Find exam
        const exam = await examModel.findById(id).populate('moduleId', 'name color').lean();
        if (!exam) {
            return res.status(404).json({
                success: false,
                message: "Exam not found"
            });
        }

        // Get questions related to this exam
        const questions = await QuestionModel.find({ examId: id }).lean();

        // Group questions by session.label
        const groupedQuestions = questions.reduce((acc, q) => {
            const session = q.sessionLabel || "No Session"; // fallback if no session
            if (!acc[session]) acc[session] = [];
            acc[session].push(q);
            return acc;
        }, {});

        res.status(200).json({
            success: true,
            data: {
                ...exam,
                moduleName:
                    typeof exam.moduleId === 'object' && exam.moduleId !== null
                        ? exam.moduleId.name
                        : undefined,
                moduleColor:
                    typeof exam.moduleId === 'object' && exam.moduleId !== null
                        ? exam.moduleId.color
                        : '#6366f1',
                totalQuestions: questions.length,
                questions: groupedQuestions,
            }
        });
    }),

    // Record exam completion and send notification
    completeExam: asyncHandler(async (req, res) => {
        const { examId, userId, score, totalQuestions } = req.body;

        if (!examId || !userId || score === undefined) {
            return res.status(400).json({
                success: false,
                message: "Exam ID, User ID, and Score are required"
            });
        }

        const exam = await examModel.findById(examId).populate('moduleId', 'name');
        if (!exam) {
            return res.status(404).json({
                success: false,
                message: "Exam not found"
            });
        }

        // Create notification for exam completion
        try {
            const percentage = totalQuestions ? Math.round((score / totalQuestions) * 100) : 0;
            await NotificationController.createNotification(
                userId,
                "exam_result",
                "Résultat d'examen disponible",
                `Votre résultat pour l'examen ${exam.name} est maintenant disponible. Score: ${percentage}%`,
                "/dashboard/results"
            );
        } catch (error) {
            console.error("Error creating exam notification:", error);
        }

        res.status(200).json({
            success: true,
            message: "Exam completed and notification sent"
        });
    })

};
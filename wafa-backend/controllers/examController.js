import examModel from "../models/examParYearModel.js";
import asyncHandler from '../handlers/asyncHandler.js';
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
            const exams = await examModel.find();
            res.status(200).json({
                success: true,
                data: exams
            });
        }),
        getById: asyncHandler(async (req, res) => {
            const { id } = req.params;
            const exam = await examModel.findById(id);
            if (!exam) {
                return res.status(404).json({
                    success: false,
                    message: "Exam not found"
                });
            }
            res.status(200).json({
                success: true,
                data: exam
            });
        })
};
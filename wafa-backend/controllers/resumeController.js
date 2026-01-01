import resumeModel from "../models/resumeModel.js";
import asyncHandler from '../handlers/asyncHandler.js';
import fs from 'fs';
import path from 'path';

// Helper function to save PDF locally
const savePdfLocally = async (buffer, originalName) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'resumes');
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    const filename = `resume-${Date.now()}-${originalName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = path.join(uploadDir, filename);
    
    await fs.promises.writeFile(filePath, buffer);
    
    return {
        url: `/uploads/resumes/${filename}`,
        filename: filename
    };
};

export const resumeController = {
    create: asyncHandler(async (req, res) => {
        const { userId, questionId, title, pdfUrl } = req.body;
        const newResume = await resumeModel.create({
            userId,
            questionId,
            title,
            pdfUrl,
            status: "pending" // default status
        });
        res.status(201).json({
            success: true,
            data: newResume
        });
    }),

    update: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { title, pdfUrl } = req.body;
        
        const updatedResume = await resumeModel.findByIdAndUpdate(
            id,
            {
                title,
                pdfUrl
            },
            { new: true, runValidators: true }
        );

        if (!updatedResume) {
            return res.status(404).json({
                success: false,
                message: "Resume not found"
            });
        }

        res.status(200).json({
            success: true,
            data: updatedResume
        });
    }),

    delete: asyncHandler(async (req, res) => {
        const { id } = req.params;
        
        const deletedResume = await resumeModel.findByIdAndDelete(id);

        if (!deletedResume) {
            return res.status(404).json({
                success: false,
                message: "Resume not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Resume deleted successfully"
        });
    }),

    getAll: asyncHandler(async (req, res) => {
        const resumes = await resumeModel.find()
            .populate('userId', 'name email')
            .populate('moduleId', 'name semester color')
            .populate('questionId')
            .sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            count: resumes.length,
            data: resumes
        });
    }),

    getById: asyncHandler(async (req, res) => {
        const { id } = req.params;
        
        const resume = await resumeModel.findById(id)
            .populate('userId', 'name email')
            .populate('questionId');

        if (!resume) {
            return res.status(404).json({
                success: false,
                message: "Resume not found"
            });
        }

        res.status(200).json({
            success: true,
            data: resume
        });
    }),

    // Get resumes by question ID
    getByQuestionId: asyncHandler(async (req, res) => {
        const { questionId } = req.params;
        
        const resumes = await resumeModel.find({ questionId })
            .populate('userId', 'name email')
            .populate('questionId');

        res.status(200).json({
            success: true,
            count: resumes.length,
            data: resumes
        });
    }),

    // Get resumes by user ID
    getByUserId: asyncHandler(async (req, res) => {
        const { userId } = req.params;
        
        const resumes = await resumeModel.find({ userId })
            .populate('userId', 'name email')
            .populate('questionId');

        res.status(200).json({
            success: true,
            count: resumes.length,
            data: resumes
        });
    }),

    // Update resume status
    updateStatus: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { status } = req.body;

        if (!['pending', 'approved', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status value"
            });
        }

        const updatedResume = await resumeModel.findByIdAndUpdate(
            id,
            { status },
            { new: true, runValidators: true }
        );

        if (!updatedResume) {
            return res.status(404).json({
                success: false,
                message: "Resume not found"
            });
        }

        res.status(200).json({
            success: true,
            data: updatedResume
        });
    }),

    // Admin upload - create resume with module and course
    adminUpload: asyncHandler(async (req, res) => {
        const { moduleId, courseName, title } = req.body;

        if (!moduleId || !courseName || !title) {
            return res.status(400).json({
                success: false,
                message: "Module, course name, and title are required"
            });
        }

        // Check for file upload
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "PDF file is required"
            });
        }

        // Save PDF locally
        let pdfUrl;
        try {
            const uploadResult = await savePdfLocally(req.file.buffer, req.file.originalname);
            pdfUrl = uploadResult.url;
        } catch (error) {
            console.error("Error saving PDF:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to upload PDF"
            });
        }

        const newResume = await resumeModel.create({
            moduleId,
            courseName,
            title,
            pdfUrl,
            status: "approved",
            isAdminUpload: true
        });

        const populated = await resumeModel.findById(newResume._id)
            .populate('moduleId', 'name semester');

        res.status(201).json({
            success: true,
            data: populated
        });
    }),

    // Get all resumes with module population for hierarchical view
    getAllWithModules: asyncHandler(async (req, res) => {
        const resumes = await resumeModel.find()
            .populate('moduleId', 'name semester color')
            .populate('userId', 'name email')
            .sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            count: resumes.length,
            data: resumes
        });
    })
};

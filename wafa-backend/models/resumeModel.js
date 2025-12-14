import mongoose from "mongoose";

const resume = new mongoose.Schema(
    {
        // Optional - only for backwards compatibility with user-uploaded resumes
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: false
        },
        // Module reference for hierarchical organization
        moduleId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Module",
            required: true
        },
        // Course name within the module
        courseName: {
            type: String,
            required: true
        },
        // Kept for backwards compatibility
        questionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Question",
            required: false
        },
        title:{
            type: String,
            required: true
        },
        pdfUrl: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "approved"  // Admin uploads are auto-approved
        },
        // Whether this was uploaded by admin
        isAdminUpload: {
            type: Boolean,
            default: true
        }

    },
    { timestamps: true }
);

export default mongoose.model("Resume", resume);

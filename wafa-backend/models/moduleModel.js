import mongoose from "mongoose";

const moduleSchema = new mongoose.Schema(
    {
        name: { 
                type: String,
                unique: [true, "Name must be unique"],
                required: [true, "Name is required"]
        },
        semester: {
                type: String,
                enum: ["S1", "S2", "S3","S4", "S5", "S6","S7", "S8", "S9","S10"],
                required: [true, "Semester is required"]
        },
        // Category - 4 default categories
        category: {
                type: String,
                enum: ["Exam par years", "Exam par courses", "Résumé et cours", "QCM banque"],
                default: "Exam par years",
        },
        // List of course names within the module
        courseNames: {
                type: [String],
                default: [],
        },
        imageUrl: {
                type: String,
        },
        infoText: {
                type: String,
        },
        // Module color for card/icon styling
        color: {
                type: String,
                default: "#6366f1", // Default indigo color
        },
        // Help content for the help modal (text)
        helpContent: {
                type: String,
                default: "",
        },
        // Help image URL (separate from module main image)
        helpImage: {
                type: String,
                default: "",
        },
        // Help PDF URL
        helpPdf: {
                type: String,
                default: "",
        },
        // Difficulty level
        difficulty: {
                type: String,
                enum: ["QE", "easy", "medium", "hard"],
                default: "QE",
        },
        // Content type: image/pdf URL or text description
        contentType: {
                type: String,
                enum: ["url", "text"],
                default: "url",
        },
        // Text content when contentType is "text"
        textContent: {
                type: String,
                default: "",
        }
    },
    { timestamps: true }
);

export default mongoose.model("Module", moduleSchema);

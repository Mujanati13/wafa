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
        // Help content for the help modal
        helpContent: {
                type: String,
                default: "",
        }
    },
    { timestamps: true }
);

export default mongoose.model("Module", moduleSchema);

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
        }
    },
    { timestamps: true }
);

export default mongoose.model("Module", moduleSchema);

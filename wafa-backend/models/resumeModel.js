import mongoose from "mongoose";

const resume = new mongoose.Schema(
    {

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        questionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Question",
            required: true
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
            default: "pending"
        }

    },
    { timestamps: true }
);

export default mongoose.model("Resume", resume);

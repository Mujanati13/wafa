import mongoose from "mongoose";

const reportQuestions = new mongoose.Schema(
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
        details: {
            type: String,
            required: true
        },
        status:{
            type: String,
            enum: ["pending", "resolved", "rejected"],
            default: "pending"
        }
    },
    { timestamps: true }
);

export default mongoose.model("ReportQuestions", reportQuestions);

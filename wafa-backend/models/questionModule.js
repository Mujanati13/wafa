import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
    {
        examId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ExamParYear",
            required: true
        },
        text: {
            type: String,
            required: true
        },
        options: [
            {
                text: {
                    type: String,
                    required: true
                },
                isCorrect: {
                    type: Boolean,
                    required: true
                }
            }
        ],
        note: {
            type: String,
        },
        images: [
            {
                type: String,
            }
        ],
        sessionLabel: {
            type: String,
            required: true
        }
    },
    { timestamps: true }
);

export default mongoose.model("Question", questionSchema);

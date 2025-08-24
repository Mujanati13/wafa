import mongoose from "mongoose";

const examParYearSchema = new mongoose.Schema(
    {
        name: { 
                type: String,
                required: [true, "Name is required"]
        },
        moduleId:{
                type: mongoose.Schema.Types.ObjectId,
                ref: "Module",
                // required: [true, "Module ID is required"]
        },
        year: {
                type: Number,
                required: [true, "Year is required"]
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

export default mongoose.model("ExamParYear", examParYearSchema);

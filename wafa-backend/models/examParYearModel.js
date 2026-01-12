import mongoose from "mongoose";

const examParYearSchema = new mongoose.Schema(
    {
        name: { 
                type: String,
                unique: [true, "Name must be unique"],
                required: [true, "Name is required"]
        },
        moduleId:{
                type: mongoose.Schema.Types.ObjectId,
                ref: "Module",
                required: [true, "Module ID is required"]
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
        },
        courseCategoryId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "CourseCategory",
                default: null
        }
    },
    { timestamps: true }
);

// Add index for moduleId to improve query performance
examParYearSchema.index({ moduleId: 1 });

export default mongoose.model("ExamParYear", examParYearSchema);

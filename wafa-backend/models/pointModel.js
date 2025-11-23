import mongoose from "mongoose";

const pointSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["normal", "report", "explanation", "bonus", "achievement"],
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      default: 0,
    },
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      default: null,
    },
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Module",
      default: null,
    },
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ExamParYear",
      default: null,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient queries
pointSchema.index({ userId: 1, type: 1 });
pointSchema.index({ userId: 1, moduleId: 1 });
pointSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("Point", pointSchema);

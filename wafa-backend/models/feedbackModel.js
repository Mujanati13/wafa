import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    role: {
      type: String,
      default: "Étudiant en médecine",
      trim: true,
    },
    message: {
      type: String,
      required: [true, "Feedback message is required"],
      trim: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 5,
    },
    imageUrl: {
      type: String,
      default: "",
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Index for faster queries
feedbackSchema.index({ isApproved: 1, isFeatured: 1, order: 1 });

export default mongoose.model("Feedback", feedbackSchema);

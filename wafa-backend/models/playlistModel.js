import mongoose from "mongoose";

const playlistSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    questionIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
      },
    ],
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Module",
      default: null,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    color: {
      type: String,
      default: "#667eea",
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
playlistSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("Playlist", playlistSchema);

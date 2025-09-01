import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      trim: true,
    },
    isAactive: {
      type: Boolean,
      default: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
      required: true,
    },
    resetCode: {
      type: String,
      trim: true,
    },
    plan: {
      type: String,
      default: "Free",
      enum: ["Free", "Premium"],
    },
    semester: {
      type: String,
      enum: ["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8", "S9", "S10"],
    },
  },
  {
    timestamps: true,
  }
);
export default mongoose.model("User", userSchema);

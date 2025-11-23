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
    planExpiry: {
      type: Date,
      default: null,
    },
    semesters: {
      type: [String],
      enum: ["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8", "S9", "S10"],
    },
    // Email verification
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
      trim: true,
    },
    emailVerificationExpires: {
      type: Date,
    },
    // Password reset
    resetPasswordToken: {
      type: String,
      trim: true,
    },
    resetPasswordExpires: {
      type: Date,
    },
    // Google OAuth
    googleId: {
      type: String,
      trim: true,
      sparse: true,
    },
    // Firebase Authentication
    firebaseUid: {
      type: String,
      trim: true,
      sparse: true,
    },
    // Profile information
    phone: {
      type: String,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
    },
    address: {
      type: String,
      trim: true,
    },
    university: {
      type: String,
      trim: true,
    },
    faculty: {
      type: String,
      trim: true,
    },
    currentYear: {
      type: String,
      trim: true,
    },
    studentId: {
      type: String,
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
    },
    profilePicture: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);
export default mongoose.model("User", userSchema);

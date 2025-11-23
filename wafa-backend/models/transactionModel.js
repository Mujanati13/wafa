import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "USD",
      uppercase: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded", "cancelled"],
      default: "pending",
      required: true,
    },
    paypalOrderId: {
      type: String,
      unique: true,
      sparse: true,
    },
    paypalPaymentId: {
      type: String,
      sparse: true,
    },
    plan: {
      type: String,
      enum: ["Premium"],
      required: true,
    },
    duration: {
      type: String,
      enum: ["1month", "3months", "6months", "1year"],
      required: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    errorMessage: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for querying user transactions
transactionSchema.index({ user: 1, createdAt: -1 });

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;

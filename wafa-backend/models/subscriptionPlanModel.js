import mongoose from "mongoose";

const featureSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  included: {
    type: Boolean,
    default: true,
  },
}, { _id: false });

const subscriptionPlanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    oldPrice: {
      type: Number,
      min: 0,
    },
    period: {
      type: String,
      enum: ["Semester", "Annee"],
      default: "Semester",
    },
    features: {
      type: [featureSchema],
      default: [],
    },
    status: {
      type: String,
      enum: ["Active", "Inactive", "Archived"],
      default: "Active",
    },
    order: {
      type: Number,
      default: 0,
    },
    isPopular: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("SubscriptionPlan", subscriptionPlanSchema);

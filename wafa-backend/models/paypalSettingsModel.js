import mongoose from "mongoose";

const paypalSettingsSchema = new mongoose.Schema(
  {
    clientId: {
      type: String,
      default: "",
      trim: true,
    },
    clientSecret: {
      type: String,
      default: "",
      trim: true,
    },
    mode: {
      type: String,
      enum: ["sandbox", "production"],
      default: "sandbox",
    },
    merchantEmail: {
      type: String,
      trim: true,
    },
    currency: {
      type: String,
      default: "MAD",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    webhookId: {
      type: String,
      trim: true,
    },
    // Store the last update info
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only one settings document exists
paypalSettingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({
      clientId: process.env.PAYPAL_CLIENT_ID || "",
      clientSecret: process.env.PAYPAL_CLIENT_SECRET || "",
      mode: process.env.PAYPAL_MODE || "sandbox",
      currency: "MAD",
    });
  }
  return settings;
};

const PaypalSettings = mongoose.model("PaypalSettings", paypalSettingsSchema);

export default PaypalSettings;

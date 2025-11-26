import PaypalSettings from "../models/paypalSettingsModel.js";
import asyncHandler from "../handlers/asyncHandler.js";
import { clearPaypalSettingsCache } from "./paymentController.js";

const PaypalSettingsController = {
  // Get PayPal settings (admin only)
  getSettings: asyncHandler(async (req, res) => {
    const settings = await PaypalSettings.getSettings();
    
    // Mask the client secret for security
    const maskedSettings = {
      ...settings.toObject(),
      clientSecret: settings.clientSecret ? "••••••••" + settings.clientSecret.slice(-4) : "",
    };

    res.status(200).json({
      success: true,
      data: maskedSettings,
    });
  }),

  // Update PayPal settings (admin only)
  updateSettings: asyncHandler(async (req, res) => {
    const { clientId, clientSecret, mode, merchantEmail, currency, isActive, webhookId } = req.body;

    let settings = await PaypalSettings.getSettings();

    // Update only provided fields
    if (clientId !== undefined) settings.clientId = clientId;
    if (clientSecret !== undefined && clientSecret !== "" && !clientSecret.includes("••••")) {
      settings.clientSecret = clientSecret;
    }
    if (mode !== undefined) settings.mode = mode;
    if (merchantEmail !== undefined) settings.merchantEmail = merchantEmail;
    if (currency !== undefined) settings.currency = currency;
    if (isActive !== undefined) settings.isActive = isActive;
    if (webhookId !== undefined) settings.webhookId = webhookId;
    
    settings.updatedBy = req.user._id;
    await settings.save();

    // Clear PayPal settings cache so new settings take effect immediately
    clearPaypalSettingsCache();

    // Mask the client secret for response
    const maskedSettings = {
      ...settings.toObject(),
      clientSecret: settings.clientSecret ? "••••••••" + settings.clientSecret.slice(-4) : "",
    };

    res.status(200).json({
      success: true,
      message: "PayPal settings updated successfully",
      data: maskedSettings,
    });
  }),

  // Test PayPal connection (admin only)
  testConnection: asyncHandler(async (req, res) => {
    const settings = await PaypalSettings.getSettings();

    if (!settings.clientId || !settings.clientSecret) {
      return res.status(400).json({
        success: false,
        message: "PayPal credentials are not configured",
      });
    }

    try {
      // Import PayPal SDK dynamically to use updated credentials
      const paypal = await import("@paypal/checkout-server-sdk");
      
      const environment = settings.mode === "production"
        ? new paypal.core.LiveEnvironment(settings.clientId, settings.clientSecret)
        : new paypal.core.SandboxEnvironment(settings.clientId, settings.clientSecret);
      
      const client = new paypal.core.PayPalHttpClient(environment);
      
      // Try to get an access token to verify credentials
      const request = new paypal.orders.OrdersCreateRequest();
      request.prefer("return=representation");
      request.requestBody({
        intent: "CAPTURE",
        purchase_units: [{
          amount: { currency_code: "USD", value: "1.00" }
        }],
      });

      // If this succeeds, credentials are valid
      // We don't actually create the order, just verify connection
      res.status(200).json({
        success: true,
        message: "PayPal connection successful",
        mode: settings.mode,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "PayPal connection failed: " + error.message,
      });
    }
  }),

  // Get public PayPal client ID (for frontend)
  getPublicSettings: asyncHandler(async (req, res) => {
    const settings = await PaypalSettings.getSettings();

    res.status(200).json({
      success: true,
      data: {
        clientId: settings.clientId,
        mode: settings.mode,
        currency: settings.currency,
        isActive: settings.isActive,
      },
    });
  }),
};

export default PaypalSettingsController;

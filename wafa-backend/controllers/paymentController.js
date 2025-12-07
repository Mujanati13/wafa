import paypal from "@paypal/checkout-server-sdk";
import Transaction from "../models/transactionModel.js";
import User from "../models/userModel.js";
import asyncHandler from "../handlers/asyncHandler.js";
import { NotificationController } from "./notificationController.js";
import PaypalSettings from "../models/paypalSettingsModel.js";

// Cache PayPal settings
let cachedPaypalSettings = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Get PayPal settings from database with caching
const getPaypalSettings = async () => {
  const now = Date.now();
  if (cachedPaypalSettings && (now - cacheTimestamp) < CACHE_DURATION) {
    return cachedPaypalSettings;
  }

  const settings = await PaypalSettings.findOne();
  if (settings) {
    cachedPaypalSettings = settings;
    cacheTimestamp = now;
  }
  return settings;
};

// Clear settings cache (call after updating settings)
export const clearPaypalSettingsCache = () => {
  cachedPaypalSettings = null;
  cacheTimestamp = 0;
};

// PayPal environment setup - now uses database settings with fallback to env vars
const environment = async () => {
  const settings = await getPaypalSettings();
  
  const clientId = settings?.clientId || process.env.PAYPAL_CLIENT_ID;
  const clientSecret = settings?.clientSecret || process.env.PAYPAL_CLIENT_SECRET;
  const mode = settings?.mode || process.env.PAYPAL_MODE || "sandbox";

  return mode === "production"
    ? new paypal.core.LiveEnvironment(clientId, clientSecret)
    : new paypal.core.SandboxEnvironment(clientId, clientSecret);
};

const client = async () => new paypal.core.PayPalHttpClient(await environment());

// Pricing configuration
const PRICING = {
  "1month": 29.99,
  "3months": 79.99,
  "6months": 149.99,
  "1year": 249.99,
};

// Create PayPal order
const createOrder = asyncHandler(async (req, res) => {
  const { duration, semesters, planId } = req.body;

  // Check if PayPal is configured
  const settings = await getPaypalSettings();
  const clientId = settings?.clientId || process.env.PAYPAL_CLIENT_ID;
  const clientSecret = settings?.clientSecret || process.env.PAYPAL_CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    res.status(400);
    throw new Error("PayPal n'est pas configuré. Veuillez contacter l'administrateur.");
  }

  if (settings && !settings.isActive) {
    res.status(400);
    throw new Error("Les paiements PayPal sont temporairement désactivés.");
  }

  if (!duration || !PRICING[duration]) {
    res.status(400);
    throw new Error("Invalid duration selected");
  }

  // Validate semesters
  const validSemesters = ["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8", "S9", "S10"];
  const selectedSemesters = semesters || [];
  
  if (selectedSemesters.length === 0) {
    res.status(400);
    throw new Error("Veuillez sélectionner au moins un semestre");
  }

  // Validate that all selected semesters are valid
  for (const sem of selectedSemesters) {
    if (!validSemesters.includes(sem)) {
      res.status(400);
      throw new Error(`Semestre invalide: ${sem}`);
    }
  }

  const amount = PRICING[duration];

  // Create transaction record with semesters
  const transaction = await Transaction.create({
    user: req.user._id,
    amount,
    currency: "USD",
    plan: "Premium",
    duration,
    semesters: selectedSemesters,
    status: "pending",
  });

  // Create PayPal order
  const request = new paypal.orders.OrdersCreateRequest();
  request.prefer("return=representation");
  request.requestBody({
    intent: "CAPTURE",
    purchase_units: [
      {
        reference_id: transaction._id.toString(),
        amount: {
          currency_code: "USD",
          value: amount.toFixed(2),
        },
        description: `WAFA Premium Plan - ${duration}`,
      },
    ],
    application_context: {
      brand_name: "WAFA Medical Education",
      landing_page: "NO_PREFERENCE",
      user_action: "PAY_NOW",
      return_url: `${process.env.FRONTEND_URL}/payment/success`,
      cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
    },
  });

  try {
    const paypalClient = await client();
    const order = await paypalClient.execute(request);

    // Update transaction with PayPal order ID
    transaction.paypalOrderId = order.result.id;
    await transaction.save();

    res.status(200).json({
      success: true,
      orderId: order.result.id,
      transactionId: transaction._id,
    });
  } catch (error) {
    transaction.status = "failed";
    transaction.errorMessage = error.message;
    await transaction.save();

    res.status(500);
    throw new Error("Error creating PayPal order: " + error.message);
  }
});

// Capture PayPal payment
const capturePayment = asyncHandler(async (req, res) => {
  const { orderId } = req.body;

  if (!orderId) {
    res.status(400);
    throw new Error("Order ID is required");
  }

  const transaction = await Transaction.findOne({ paypalOrderId: orderId });

  if (!transaction) {
    res.status(404);
    throw new Error("Transaction not found");
  }

  if (transaction.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to capture this payment");
  }

  const request = new paypal.orders.OrdersCaptureRequest(orderId);
  request.requestBody({});

  try {
    const paypalClient = await client();
    const capture = await paypalClient.execute(request);

    if (capture.result.status === "COMPLETED") {
      // Update transaction
      transaction.status = "completed";
      transaction.paypalPaymentId = capture.result.purchase_units[0].payments.captures[0].id;
      transaction.metadata = {
        captureDetails: capture.result,
      };
      await transaction.save();

      // Update user subscription
      const user = await User.findById(req.user._id);
      if (!user) {
        res.status(404);
        throw new Error("User not found");
      }

      // Calculate plan expiry based on duration
      const durationMap = {
        "1month": 30,
        "3months": 90,
        "6months": 180,
        "1year": 365,
      };

      const daysToAdd = durationMap[transaction.duration];
      const currentExpiry = user.planExpiry && user.planExpiry > new Date() 
        ? new Date(user.planExpiry) 
        : new Date();
      
      currentExpiry.setDate(currentExpiry.getDate() + daysToAdd);

      user.plan = "Premium";
      user.planExpiry = currentExpiry;
      
      // Update user's semesters with the selected ones
      if (transaction.semesters && transaction.semesters.length > 0) {
        // Merge existing semesters with new ones (avoid duplicates)
        const existingSemesters = user.semesters || [];
        const newSemesters = [...new Set([...existingSemesters, ...transaction.semesters])];
        user.semesters = newSemesters;
      }
      
      await user.save();

      // Send subscription notification
      try {
        const durationText = {
          "1month": "1 mois",
          "3months": "3 mois",
          "6months": "6 mois",
          "1year": "1 an"
        }[transaction.duration] || transaction.duration;

        await NotificationController.createNotification(
          req.user._id,
          "subscription",
          "Abonnement Premium activé",
          `Votre abonnement Premium (${durationText}) a été activé avec succès. Profitez de tous les avantages!`,
          "/dashboard/subscription"
        );
      } catch (error) {
        console.error("Error creating subscription notification:", error);
      }

      res.status(200).json({
        success: true,
        message: "Payment completed successfully",
        transaction: {
          id: transaction._id,
          amount: transaction.amount,
          status: transaction.status,
        },
        subscription: {
          plan: user.plan,
          expiresAt: user.planExpiry,
        },
      });
    } else {
      transaction.status = "failed";
      transaction.errorMessage = `Payment status: ${capture.result.status}`;
      await transaction.save();

      res.status(400);
      throw new Error("Payment was not completed");
    }
  } catch (error) {
    transaction.status = "failed";
    transaction.errorMessage = error.message;
    await transaction.save();

    res.status(500);
    throw new Error("Error capturing payment: " + error.message);
  }
});

// Get user transactions
const getTransactions = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const transactions = await Transaction.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .select("-metadata");

  const total = await Transaction.countDocuments({ user: req.user._id });

  res.status(200).json({
    success: true,
    transactions,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

// Get single transaction
const getTransaction = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findById(req.params.id).populate(
    "user",
    "name email"
  );

  if (!transaction) {
    res.status(404);
    throw new Error("Transaction not found");
  }

  // Only user or admin can view transaction
  if (
    transaction.user._id.toString() !== req.user._id.toString() &&
    !req.user.isAdmin
  ) {
    res.status(403);
    throw new Error("Not authorized to view this transaction");
  }

  res.status(200).json({
    success: true,
    transaction,
  });
});

// Admin: Get all transactions
const getAllTransactions = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.userId) filter.user = req.query.userId;

  const transactions = await Transaction.find(filter)
    .populate("user", "name email")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Transaction.countDocuments(filter);

  const stats = await Transaction.aggregate([
    { $match: filter },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        totalAmount: { $sum: "$amount" },
      },
    },
  ]);

  res.status(200).json({
    success: true,
    transactions,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
    stats,
  });
});

// PayPal webhook handler
const handleWebhook = asyncHandler(async (req, res) => {
  const webhookEvent = req.body;

  // Verify webhook signature (implement based on PayPal docs)
  // For now, we'll process the event

  switch (webhookEvent.event_type) {
    case "PAYMENT.CAPTURE.COMPLETED":
      const captureId = webhookEvent.resource.id;
      const orderId = webhookEvent.resource.supplementary_data.related_ids.order_id;

      const transaction = await Transaction.findOne({ paypalOrderId: orderId });
      if (transaction && transaction.status === "pending") {
        transaction.status = "completed";
        transaction.paypalPaymentId = captureId;
        await transaction.save();

        // Update user subscription
        const user = await User.findById(transaction.user);
        if (user) {
          const durationMap = {
            "1month": 30,
            "3months": 90,
            "6months": 180,
            "1year": 365,
          };

          const daysToAdd = durationMap[transaction.duration];
          const currentExpiry = user.planExpiry && user.planExpiry > new Date() 
            ? new Date(user.planExpiry) 
            : new Date();
          
          currentExpiry.setDate(currentExpiry.getDate() + daysToAdd);

          user.plan = "Premium";
          user.planExpiry = currentExpiry;
          
          // Update user's semesters with the selected ones
          if (transaction.semesters && transaction.semesters.length > 0) {
            const existingSemesters = user.semesters || [];
            const newSemesters = [...new Set([...existingSemesters, ...transaction.semesters])];
            user.semesters = newSemesters;
          }
          
          await user.save();
        }
      }
      break;

    case "PAYMENT.CAPTURE.DENIED":
    case "PAYMENT.CAPTURE.DECLINED":
      const failedOrderId = webhookEvent.resource.supplementary_data.related_ids.order_id;
      const failedTransaction = await Transaction.findOne({ paypalOrderId: failedOrderId });
      if (failedTransaction) {
        failedTransaction.status = "failed";
        failedTransaction.errorMessage = webhookEvent.summary;
        await failedTransaction.save();
      }
      break;

    case "PAYMENT.CAPTURE.REFUNDED":
      const refundedCaptureId = webhookEvent.resource.id;
      const refundedTransaction = await Transaction.findOne({ paypalPaymentId: refundedCaptureId });
      if (refundedTransaction) {
        refundedTransaction.status = "refunded";
        await refundedTransaction.save();

        // Optionally revoke user's premium access
        const user = await User.findById(refundedTransaction.user);
        if (user) {
          user.plan = "Free";
          user.planExpiry = null;
          await user.save();
        }
      }
      break;

    default:
      console.log(`Unhandled webhook event: ${webhookEvent.event_type}`);
  }

  res.status(200).json({ received: true });
});

export default {
  createOrder,
  capturePayment,
  getTransactions,
  getTransaction,
  getAllTransactions,
  handleWebhook,
};

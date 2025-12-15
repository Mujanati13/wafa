import express from "express";
import paymentController from "../controllers/paymentController.js";
import { isAuthenticated, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// User routes
router.post("/create-order", isAuthenticated, paymentController.createOrder);
router.post("/capture-payment", isAuthenticated, paymentController.capturePayment);
router.post("/bank-transfer-request", isAuthenticated, paymentController.createBankTransferRequest);
router.get("/transactions", isAuthenticated, paymentController.getTransactions);
router.get("/transactions/:id", isAuthenticated, paymentController.getTransaction);

// Admin routes
router.get("/admin/transactions", isAuthenticated, isAdmin, paymentController.getAllTransactions);
router.get("/admin/pending", isAuthenticated, isAdmin, paymentController.getPendingPayments);
router.post("/admin/approve/:transactionId", isAuthenticated, isAdmin, paymentController.approvePayment);
router.post("/admin/reject/:transactionId", isAuthenticated, isAdmin, paymentController.rejectPayment);

// PayPal webhook (no auth needed - verified by PayPal signature)
router.post("/webhook", paymentController.handleWebhook);

export default router;

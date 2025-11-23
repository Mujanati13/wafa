import { useState } from "react";
import { motion } from "framer-motion";
import { FaCheckCircle, FaSpinner } from "react-icons/fa";
import axios from "axios";

const PayPalButton = ({ duration, price, onSuccess, onError }) => {
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState(null);

  const handlePayment = async () => {
    setLoading(true);
    try {
      // Create PayPal order
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/payments/create-order`,
        { duration },
        { withCredentials: true }
      );

      setOrderId(data.orderId);

      // Redirect to PayPal for payment
      window.location.href = `https://www.${
        import.meta.env.VITE_PAYPAL_MODE === "production" ? "" : "sandbox."
      }paypal.com/checkoutnow?token=${data.orderId}`;
    } catch (error) {
      console.error("Payment creation failed:", error);
      onError?.(error.response?.data?.message || "Failed to create payment");
      setLoading(false);
    }
  };

  // Handle payment completion (call this from success page)
  const capturePayment = async (orderId) => {
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/payments/capture-payment`,
        { orderId },
        { withCredentials: true }
      );

      if (data.success) {
        onSuccess?.(data);
      }
    } catch (error) {
      console.error("Payment capture failed:", error);
      onError?.(error.response?.data?.message || "Payment capture failed");
    }
  };

  const durationLabels = {
    "1month": "1 mois",
    "3months": "3 mois",
    "6months": "6 mois",
    "1year": "1 an",
  };

  return (
    <motion.button
      onClick={handlePayment}
      disabled={loading}
      className={`
        relative w-full py-3 px-6 rounded-lg font-semibold text-white
        bg-gradient-to-r from-blue-500 to-purple-600
        hover:from-blue-600 hover:to-purple-700
        transition-all duration-300 shadow-lg hover:shadow-xl
        disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center justify-center gap-2
      `}
      whileHover={{ scale: loading ? 1 : 1.02 }}
      whileTap={{ scale: loading ? 1 : 0.98 }}
    >
      {loading ? (
        <>
          <FaSpinner className="animate-spin" />
          <span>Traitement...</span>
        </>
      ) : (
        <>
          <FaCheckCircle />
          <span>
            S'abonner - {durationLabels[duration]} ({price}$)
          </span>
        </>
      )}
    </motion.button>
  );
};

export default PayPalButton;

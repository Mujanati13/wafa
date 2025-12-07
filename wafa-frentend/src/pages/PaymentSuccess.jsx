import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { motion } from "framer-motion";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { userService } from "@/services/userService";
import axios from "axios";

const PaymentSuccess = () => {
  const { t } = useTranslation(['dashboard', 'common']);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("processing"); // processing, success, error
  const [message, setMessage] = useState(t('dashboard:verifying_payment'));
  const [selectedSemesters, setSelectedSemesters] = useState([]);

  useEffect(() => {
    const capturePayment = async () => {
      const token = searchParams.get("token");
      const PayerID = searchParams.get("PayerID");

      if (!token) {
        setStatus("error");
        setMessage(t('dashboard:missing_order_id'));
        return;
      }

      // Get pending semesters from localStorage
      const pendingSemesters = localStorage.getItem('pendingSubscriptionSemesters');
      if (pendingSemesters) {
        try {
          setSelectedSemesters(JSON.parse(pendingSemesters));
        } catch (e) {
          console.error('Error parsing pending semesters:', e);
        }
      }

      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL}/payments/capture-payment`,
          { orderId: token },
          { withCredentials: true }
        );

        if (data.success) {
          setStatus("success");
          setMessage(t('dashboard:payment_success_premium_active'));

          // Clear pending semesters from localStorage
          localStorage.removeItem('pendingSubscriptionSemesters');
          
          // Refresh user profile to get updated semesters
          try {
            await userService.getUserProfile(true); // Force refresh
          } catch (e) {
            console.error('Error refreshing user profile:', e);
          }

          // Redirect to dashboard after 3 seconds
          setTimeout(() => {
            navigate("/dashboard/home");
          }, 3000);
        }
      } catch (error) {
        console.error("Payment capture error:", error);
        setStatus("error");
        setMessage(
          error.response?.data?.message ||
            t('dashboard:payment_validation_failed')
        );
        // Clear pending semesters on error too
        localStorage.removeItem('pendingSubscriptionSemesters');
      }
    };

    capturePayment();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-xl">
          <CardContent className="p-8 text-center space-y-4">
            {status === "processing" && (
              <>
                <div className="flex justify-center">
                  <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />
                </div>
                <h2 className="text-2xl font-bold">
                  {t('dashboard:processing_payment')}
                </h2>
                <p className="text-muted-foreground">{message}</p>
              </>
            )}

            {status === "success" && (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.5 }}
                  className="flex justify-center"
                >
                  <div className="h-16 w-16 rounded-full bg-green-50 flex items-center justify-center">
                    <CheckCircle className="h-10 w-10 text-green-500" />
                  </div>
                </motion.div>
                <h2 className="text-2xl font-bold">
                  {t('dashboard:payment_success')}
                </h2>
                <Alert className="bg-green-50 border-green-200">
                  <AlertDescription className="text-green-800">
                    {message}
                  </AlertDescription>
                </Alert>
                {selectedSemesters.length > 0 && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800">
                      <strong>Semestres activés:</strong> {selectedSemesters.sort().join(', ')}
                    </p>
                  </div>
                )}
                <div className="space-y-2">
                  <Progress value={100} className="h-2" />
                  <p className="text-sm text-muted-foreground">
                    {t('dashboard:redirecting_to_dashboard')}
                  </p>
                </div>
              </>
            )}

            {status === "error" && (
              <>
                <div className="flex justify-center">
                  <div className="h-16 w-16 rounded-full bg-red-50 flex items-center justify-center">
                    <XCircle className="h-10 w-10 text-red-500" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold">
                  {t('dashboard:payment_error')}
                </h2>
                <Alert variant="destructive">
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
                <Button
                  onClick={() => navigate("/subscription")}
                  className="w-full"
                >
                  {t('dashboard:try_again')}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;

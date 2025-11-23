import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const PaymentCancel = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-xl">
          <CardContent className="p-8 text-center space-y-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="flex justify-center"
            >
              <div className="h-16 w-16 rounded-full bg-red-50 flex items-center justify-center">
                <XCircle className="h-10 w-10 text-red-500" />
              </div>
            </motion.div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold">
                Paiement annulé
              </h2>
              <p className="text-muted-foreground">
                Votre paiement a été annulé. Aucun montant n'a été débité de votre compte.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                onClick={() => navigate("/subscription")}
                className="w-full"
              >
                Réessayer
              </Button>

              <Button
                variant="outline"
                onClick={() => navigate("/dashboard/home")}
                className="w-full"
              >
                Retour au tableau de bord
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default PaymentCancel;

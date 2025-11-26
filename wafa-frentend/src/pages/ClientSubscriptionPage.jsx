import React, { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Check, AlertCircle, Zap, Loader2, CreditCard, ShieldCheck } from "lucide-react";
import { dashboardService } from "@/services/dashboardService";
import { subscriptionPlanService } from "@/services/subscriptionPlanService";
import { toast } from "sonner";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const ClientSubscriptionPage = () => {
  const { t } = useTranslation(['dashboard', 'common']);
  
  const [userSubscription, setUserSubscription] = useState(null);
  const [allPlans, setAllPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const fetchSubscriptionData = async () => {
    try {
      setLoading(true);
      
      // Fetch user's current subscription
      const subResponse = await dashboardService.getUserSubscriptionInfo();
      setUserSubscription(subResponse.data || {});

      // Fetch all available plans
      const plansResponse = await subscriptionPlanService.getAllPlans();
      const plansData = Array.isArray(plansResponse.data) 
        ? plansResponse.data 
        : plansResponse.data?.data || [];
      setAllPlans(plansData);
    } catch (error) {
      console.error('Error fetching subscription data:', error);
      toast.error('Impossible de charger les données d\'abonnement');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = (plan) => {
    // Don't allow selecting current plan
    if (userSubscription?.plan === plan.name) {
      toast.info('Vous avez déjà ce plan');
      return;
    }
    
    // Don't allow selecting free plan
    if (plan.price === 0) {
      toast.info('Vous êtes déjà sur le plan gratuit');
      return;
    }

    setSelectedPlan(plan);
    setShowPaymentDialog(true);
  };

  const handlePayWithPayPal = async () => {
    if (!selectedPlan) return;

    try {
      setPaymentLoading(true);

      // Map plan duration to backend format
      const durationMap = {
        '1 Mois': '1month',
        '3 Mois': '3months',
        '6 Mois': '6months',
        '1 An': '1year',
        '12 Mois': '1year',
      };

      const duration = durationMap[selectedPlan.duration] || '1month';

      // Create PayPal order
      const response = await axios.post(
        `${API_URL}/payments/create-order`,
        { duration },
        { withCredentials: true }
      );

      if (response.data.success && response.data.orderId) {
        // Redirect to PayPal
        const paypalUrl = `https://www.sandbox.paypal.com/checkoutnow?token=${response.data.orderId}`;
        window.location.href = paypalUrl;
      } else {
        throw new Error('Erreur lors de la création de la commande PayPal');
      }
    } catch (error) {
      console.error('PayPal payment error:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Erreur lors du paiement PayPal';
      toast.error(errorMessage);
    } finally {
      setPaymentLoading(false);
      setShowPaymentDialog(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl font-bold text-slate-900">Mes Abonnements</h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Gérez votre plan d'abonnement et accédez à toutes les fonctionnalités premium
          </p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="h-96 animate-pulse">
                <CardContent className="p-6 space-y-4">
                  <div className="h-8 bg-slate-200 rounded w-3/4" />
                  <div className="h-4 bg-slate-200 rounded w-full" />
                  <div className="h-4 bg-slate-200 rounded w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {/* Current Subscription Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-blue-600" />
                    Votre Plan Actuel
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-600 mb-2">Plan d'abonnement</p>
                    <Badge className="text-lg px-4 py-2" variant={userSubscription?.plan === 'Premium' ? 'default' : 'secondary'}>
                      {userSubscription?.plan || 'Plan Gratuit'}
                    </Badge>
                  </div>
                  {userSubscription?.subscription && (
                    <>
                      <div>
                        <p className="text-sm text-slate-600">Date d'expiration</p>
                        <p className="font-semibold">
                          {new Date(userSubscription.subscription.expiryDate).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Statut</p>
                        <Badge variant="outline" className="gap-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                          Actif
                        </Badge>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Available Plans */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Plans Disponibles</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {allPlans.map((plan, index) => {
                  const isCurrentPlan = userSubscription?.plan === plan.name;
                  const isFree = plan.price === 0;
                  
                  return (
                    <motion.div
                      key={plan._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 * (index + 1) }}
                    >
                      <Card 
                        className={`flex flex-col h-full relative ${
                          isCurrentPlan
                            ? 'ring-2 ring-blue-500 shadow-lg'
                            : ''
                        }`}
                      >
                        {/* Current Plan Badge */}
                        {isCurrentPlan && (
                          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                            <Badge className="bg-blue-500 text-white px-4 py-1 shadow-md">
                              <ShieldCheck className="w-4 h-4 mr-1" />
                              Plan Actuel
                            </Badge>
                          </div>
                        )}

                        <CardHeader className={isCurrentPlan ? 'pt-8' : ''}>
                          <CardTitle className="text-2xl">{plan.name}</CardTitle>
                          <CardDescription>{plan.description}</CardDescription>
                          <div className="mt-4">
                            <span className="text-3xl font-bold text-slate-900">
                              {plan.price === 0 ? 'Gratuit' : `${plan.price} MAD`}
                            </span>
                            {plan.oldPrice && (
                              <span className="text-sm text-slate-500 line-through ml-2">
                                {plan.oldPrice} MAD
                              </span>
                            )}
                            {plan.duration && !isFree && (
                              <span className="text-sm text-slate-500 ml-2">
                                / {plan.duration}
                              </span>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="flex-1 space-y-6">
                          {/* Features */}
                          <div className="space-y-3">
                            {plan.features && plan.features.map((feature, idx) => (
                              <div key={idx} className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                <span className="text-sm text-slate-700">{feature}</span>
                              </div>
                            ))}
                          </div>

                          {/* Current Plan Indicator */}
                          {isCurrentPlan && (
                            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                              <AlertCircle className="w-4 h-4 text-blue-600" />
                              <span className="text-sm text-blue-700 font-medium">
                                Votre plan actuel
                              </span>
                            </div>
                          )}

                          {/* Action Button */}
                          <Button
                            onClick={() => handleSelectPlan(plan)}
                            disabled={isCurrentPlan || isFree}
                            className={`w-full ${
                              isCurrentPlan || isFree
                                ? 'opacity-50 cursor-default'
                                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                            }`}
                            variant={isCurrentPlan ? 'outline' : 'default'}
                          >
                            {isCurrentPlan ? (
                              'Plan Actuel'
                            ) : isFree ? (
                              'Plan Gratuit'
                            ) : (
                              <>
                                <CreditCard className="w-4 h-4 mr-2" />
                                Choisir ce plan
                              </>
                            )}
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Help Section */}
            <Card className="bg-gradient-to-r from-slate-50 to-slate-100 border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Besoin d'Aide ?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-slate-700">
                <p>
                  Vous avez des questions sur vos abonnements ? Consultez notre documentation ou contactez notre équipe d'assistance.
                </p>
                <div className="flex gap-3">
                  <Button variant="outline" size="sm">
                    Documentation
                  </Button>
                  <Button variant="outline" size="sm">
                    Contacter le Support
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-600" />
              Confirmer votre abonnement
            </DialogTitle>
            <DialogDescription>
              Vous allez souscrire au plan {selectedPlan?.name}
            </DialogDescription>
          </DialogHeader>

          {selectedPlan && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-slate-50 rounded-lg border">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{selectedPlan.name}</span>
                  <span className="font-bold text-lg">{selectedPlan.price} MAD</span>
                </div>
                {selectedPlan.duration && (
                  <p className="text-sm text-slate-600">
                    Durée: {selectedPlan.duration}
                  </p>
                )}
              </div>

              <div className="space-y-2 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-green-500" />
                  <span>Paiement sécurisé via PayPal</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Activation immédiate après paiement</span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-3 sm:justify-between">
            <Button
              variant="outline"
              onClick={() => setShowPaymentDialog(false)}
              disabled={paymentLoading}
            >
              Annuler
            </Button>
            <Button
              onClick={handlePayWithPayPal}
              disabled={paymentLoading}
              className="bg-[#0070ba] hover:bg-[#003087] text-white"
            >
              {paymentLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Traitement...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7.076 21.337H2.47a.641.641 0 01-.633-.74L4.944 3.72a.77.77 0 01.757-.644h6.92c2.3 0 3.98.476 4.988 1.413.962.897 1.388 2.238 1.267 3.982-.266 3.82-2.57 5.944-6.475 5.944H9.63a.77.77 0 00-.759.645l-.795 5.277zm1.746-15.95l-2.45 15.62h2.92l.667-4.32a.77.77 0 01.76-.645h2.59c3.08 0 4.902-1.68 5.12-4.722.094-1.362-.186-2.413-.832-3.127-.698-.771-1.897-1.162-3.567-1.162h-4.45a.77.77 0 00-.758.644z"/>
                  </svg>
                  Payer avec PayPal
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientSubscriptionPage;

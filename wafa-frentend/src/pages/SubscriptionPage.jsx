import React from "react";
import { useTranslation } from 'react-i18next';
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import PlanModal from "@/components/admin/PlanModal";
import { DollarSign, SquareChartGantt, UserRoundCheck, Trash2, Edit, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const SubscriptionPage = () => {
  const { t } = useTranslation(['admin', 'common']);
  // Helpers for persistence
  const storageKey = "subscriptionPlans";
  const loadPlansFromStorage = () => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : null;
    } catch {
      return null;
    }
  };
  const savePlansToStorage = (plans) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(plans));
    } catch {
      // ignore
    }
  };

  // Default mock data for subscription plans
  const defaultPlans = [
    {
      id: 1,
      name: "Basic",
      description: "Essential features for medical students",
      price: 29.99,
      oldPrice: 39.99,
      features: ["Access to past exams", "Basic explanations"],
      subscribers: 2847,
      revenue: 85381.53,
      status: "Active",
    },
    {
      id: 2,
      name: "Premium",
      description: "Advanced features for serious exam preparation",
      price: 59.99,
      oldPrice: 79.99,
      features: [
        "All Basic features",
        "Detailed explanations",
        "Priority support",
      ],
      subscribers: 4521,
      revenue: 271214.79,
      status: "Active",
    },
    {
      id: 3,
      name: "Enterprise",
      description: "Comprehensive solution for institutions",
      price: 199.99,
      oldPrice: 249.99,
      features: ["Multi-seat licenses", "Admin analytics", "Dedicated support"],
      subscribers: 1064,
      revenue: 212789.36,
      status: "Active",
    },
    {
      id: 4,
      name: "Student Discount",
      description: "Special pricing for verified students",
      price: 19.99,
      oldPrice: 29.99,
      features: ["All Basic features", "Student verification"],
      subscribers: 892,
      revenue: 17831.08,
      status: "Active",
    },
  ];

  const [subscriptionPlans, setSubscriptionPlans] = React.useState(() => {
    return loadPlansFromStorage() ?? defaultPlans;
  });

  // Modal state for create/edit
  const [isPlanModalOpen, setIsPlanModalOpen] = React.useState(false);
  const [planModalTitle, setPlanModalTitle] = React.useState("Create Plan");
  const [planModalMode, setPlanModalMode] = React.useState("create"); // "create" | "edit"
  const [currentPlanId, setCurrentPlanId] = React.useState(null);
  const [planModalInitial, setPlanModalInitial] = React.useState(null);

  React.useEffect(() => {
    savePlansToStorage(subscriptionPlans);
  }, [subscriptionPlans]);

  const openCreateModal = () => {
    setPlanModalTitle("Create Plan");
    setPlanModalMode("create");
    setCurrentPlanId(null);
    setPlanModalInitial({
      name: "",
      description: "",
      price: "",
      oldPrice: "",
      features: [],
    });
    setIsPlanModalOpen(true);
  };

  const openEditModal = (plan) => {
    setPlanModalTitle("Edit Plan");
    setPlanModalMode("edit");
    setCurrentPlanId(plan.id);
    setPlanModalInitial({ ...plan });
    setIsPlanModalOpen(true);
  };

  const handleModalCancel = () => {
    setIsPlanModalOpen(false);
    setPlanModalInitial(null);
    setCurrentPlanId(null);
  };

  const handleModalSave = (form) => {
    const normalizedFeatures = Array.isArray(form.features)
      ? form.features.filter(Boolean)
      : (form.featuresText || "")
          .split(",")
          .map((f) => f.trim())
          .filter(Boolean);
    const normalized = {
      name: form.name?.trim() || "",
      description: form.description?.trim() || "",
      price:
        form.price === "" || form.price == null ? 0 : parseFloat(form.price),
      oldPrice:
        form.oldPrice === "" || form.oldPrice == null
          ? null
          : parseFloat(form.oldPrice),
      features: normalizedFeatures,
    };

    if (planModalMode === "create") {
      const nextId =
        subscriptionPlans.reduce((m, p) => (p.id > m ? p.id : m), 0) + 1;
      const newPlan = {
        id: nextId,
        ...normalized,
        subscribers: 0,
        revenue: 0,
        status: "Active",
      };
      setSubscriptionPlans((prev) => [newPlan, ...prev]);
    } else if (planModalMode === "edit" && currentPlanId != null) {
      setSubscriptionPlans((prev) =>
        prev.map((p) => (p.id === currentPlanId ? { ...p, ...normalized } : p))
      );
    }

    setIsPlanModalOpen(false);
    setPlanModalInitial(null);
    setCurrentPlanId(null);
  };

  const handleDelete = (id) => {
    setSubscriptionPlans((prev) => prev.filter((p) => p.id !== id));
    if (currentPlanId === id) {
      handleModalCancel();
    }
  };

  // Calculate totals
  const totalPlans = subscriptionPlans.length;
  const totalSubscribers = subscriptionPlans.reduce(
    (sum, plan) => sum + plan.subscribers,
    0
  );
  const monthlyRevenue = subscriptionPlans.reduce(
    (sum, plan) => sum + plan.revenue,
    0
  );
  const averageRevenuePerUser =
    totalSubscribers > 0 ? monthlyRevenue / totalSubscribers : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100 p-6">
      <div className="w-full space-y-6">
        {/* Header with gradient background */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-400 p-6 text-white shadow-lg flex justify-between items-center"
        >
          <div>
            <h1 className="text-3xl font-bold mb-2">Subscription Plans</h1>
            <p className="text-indigo-100">
              Manage pricing plans and subscription tiers
            </p>
          </div>
          <Button
            onClick={openCreateModal}
            className="bg-white hover:bg-indigo-50 text-indigo-600 shadow-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Plan
          </Button>
        </motion.div>

        {/* Metrics Cards Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {/* Total Plans Card */}
          <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase">Total Plans</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{totalPlans}</p>
                  <p className="text-xs text-gray-500 mt-1">Active subscription tiers</p>
                </div>
                <SquareChartGantt className="w-8 h-8 text-indigo-600" />
              </div>
            </CardContent>
          </Card>

          {/* Total Subscribers Card */}
          <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase">Total Subscribers</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{totalSubscribers.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">Across all plans</p>
                </div>
                <UserRoundCheck className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          {/* Monthly Revenue Card */}
          <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase">Monthly Revenue</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    ${monthlyRevenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Monthly recurring revenue</p>
                </div>
                <DollarSign className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          {/* Average Revenue Per User Card */}
          <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase">Avg Revenue/User</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">${averageRevenuePerUser.toFixed(2)}</p>
                  <p className="text-xs text-gray-500 mt-1">Per subscription</p>
                </div>
                <DollarSign className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Plans Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {subscriptionPlans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
              className="group relative"
            >
              <Card className="shadow-lg border-0 hover:shadow-2xl transition-all duration-300 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500 group-hover:h-2 transition-all duration-300" />
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Plan Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{plan.description}</p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4 text-indigo-600 hover:text-indigo-700" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => openEditModal(plan)}
                            className="flex items-center gap-2"
                          >
                            <Edit className="h-4 w-4" />
                            Edit Plan
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(plan.id)}
                            className="flex items-center gap-2 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Pricing */}
                    <div className="space-y-1">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-gray-900">
                          ${plan.price}
                        </span>
                        <span className="text-sm text-gray-500">/month</span>
                      </div>
                      {plan.oldPrice != null && plan.oldPrice > plan.price && (
                        <p className="text-sm text-gray-500">
                          <span className="line-through">${plan.oldPrice}</span>
                          <Badge className="ml-2 bg-red-100 text-red-800">
                            Save ${(plan.oldPrice - plan.price).toFixed(2)}
                          </Badge>
                        </p>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-200">
                      <div className="bg-indigo-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600 uppercase font-semibold">
                          Subscribers
                        </p>
                        <p className="text-lg font-bold text-gray-900 mt-1">
                          {plan.subscribers.toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600 uppercase font-semibold">
                          Revenue
                        </p>
                        <p className="text-lg font-bold text-gray-900 mt-1">
                          ${plan.revenue.toLocaleString("en-US", {
                            maximumFractionDigits: 0,
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Features */}
                    {Array.isArray(plan.features) && plan.features.length > 0 && (
                      <div className="pt-2 border-t border-gray-200">
                        <p className="text-xs font-semibold text-gray-600 uppercase mb-2">
                          Features
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {plan.features.map((f, i) => (
                            <Badge
                              key={`${plan.id}-feature-${i}`}
                              variant="secondary"
                              className="text-xs"
                            >
                              {f}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                      <Badge
                        className={
                          plan.status === "Active"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }
                      >
                        {plan.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <PlanModal
          open={isPlanModalOpen}
          title={planModalTitle}
          initialPlan={planModalInitial}
          onSave={handleModalSave}
          onCancel={handleModalCancel}
        />
      </div>
    </div>
  );
};

export default SubscriptionPage;

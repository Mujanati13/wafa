import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PlanModal from "@/components/admin/PlanModal";
import { DollarSign, SquareChartGantt, UserRoundCheck } from "lucide-react";

const SubscriptionPage = () => {
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
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Subscription Plans
          </h1>
          <p className="text-gray-600 mt-1">
            Manage pricing plans and subscription tiers
          </p>
        </div>
        <Button
          onClick={openCreateModal}
          className="bg-black hover:bg-gray-800 text-white px-4 py-2"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Create Plan
        </Button>
      </div>

      {/* Metrics Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Plans Card */}
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="p-6">
            <div>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-600">Total Plans</p>
                <SquareChartGantt className="w-6 h-6" />
              </div>
              <div className="flex items-center justify-between gap-2 mt-2">
                <span className="text-3xl font-bold text-gray-900">
                  {totalPlans}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Active subscription tiers
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Total Subscribers Card */}
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="p-6">
            <div>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-600">
                  Total Subscribers
                </p>
                <UserRoundCheck className="w-6 h-6" />
              </div>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {totalSubscribers.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 mt-1">Across all plans</p>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Revenue Card */}
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="p-6">
            <div>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-600">
                  Monthly Revenue
                </p>
                <DollarSign className="w-6 h-6" />
              </div>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                $
                {monthlyRevenue.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Estimated monthly recurring revenue
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Average Revenue Per User Card */}
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="p-6">
            <div>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-600">
                  Average Revenue Per User
                </p>
                <DollarSign className="w-6 h-6" />
              </div>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                ${averageRevenuePerUser.toFixed(2)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                ARPU across all plans
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subscription Plans Table Section */}
      <Card className="bg-white border-gray-200">
        <CardHeader className="pb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              All Subscription Plans
            </h2>
            <p className="text-gray-600 mt-1">
              Manage your platform's pricing and subscription tiers
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-6 font-medium text-gray-900">
                    Plan Details
                  </th>
                  <th className="text-center py-4 px-6 font-medium text-gray-900">
                    Pricing
                  </th>
                  <th className="text-center py-4 px-6 font-medium text-gray-900">
                    Subscribers
                  </th>
                  <th className="text-center py-4 px-6 font-medium text-gray-900">
                    Revenue
                  </th>
                  <th className="text-center py-4 px-6 font-medium text-gray-900">
                    Status
                  </th>
                  <th className="text-right py-4 px-6 font-medium text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {subscriptionPlans.map((plan, index) => (
                  <tr
                    key={plan.id}
                    className={
                      index < subscriptionPlans.length - 1
                        ? "border-b border-gray-200"
                        : ""
                    }
                  >
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {plan.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {plan.description}
                        </p>
                        {Array.isArray(plan.features) &&
                          plan.features.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {plan.features.map((f, i) => (
                                <span
                                  key={`${plan.id}-feature-${i}`}
                                  className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700"
                                >
                                  {f}
                                </span>
                              ))}
                            </div>
                          )}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div>
                        {plan.oldPrice != null && plan.oldPrice > plan.price ? (
                          <p className="text-sm text-gray-500">
                            <span className="line-through mr-2">
                              ${plan.oldPrice}
                            </span>
                            <span className="font-semibold text-gray-900">
                              ${plan.price}
                            </span>
                          </p>
                        ) : (
                          <p className="font-semibold text-gray-900">
                            ${plan.price}
                          </p>
                        )}
                        <p className="text-sm text-gray-500">per month</p>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <svg
                          className="w-4 h-4 text-gray-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                          />
                        </svg>
                        <span className="text-gray-900">
                          {plan.subscribers.toLocaleString()}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="text-gray-900">
                        $
                        {plan.revenue.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-black text-white">
                        {plan.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <>
                          <button
                            onClick={() => openEditModal(plan)}
                            className="p-1 text-gray-500 hover:text-gray-700"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(plan.id)}
                            className="p-1 text-gray-500 hover:text-red-600"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      <PlanModal
        open={isPlanModalOpen}
        title={planModalTitle}
        initialPlan={planModalInitial}
        onSave={handleModalSave}
        onCancel={handleModalCancel}
      />
    </div>
  );
};

export default SubscriptionPage;

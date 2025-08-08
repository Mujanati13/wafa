import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SubscriptionPage = () => {
  // Mock data for subscription plans
  const subscriptionPlans = [
    {
      id: 1,
      name: "Basic",
      description: "Essential features for medical students",
      price: 29.99,
      subscribers: 2847,
      revenue: 85381.53,
      status: "Active",
    },
    {
      id: 2,
      name: "Premium",
      description: "Advanced features for serious exam preparation",
      price: 59.99,
      subscribers: 4521,
      revenue: 271214.79,
      status: "Active",
    },
    {
      id: 3,
      name: "Enterprise",
      description: "Comprehensive solution for institutions",
      price: 199.99,
      subscribers: 1064,
      revenue: 212789.36,
      status: "Active",
    },
    {
      id: 4,
      name: "Student Discount",
      description: "Special pricing for verified students",
      price: 19.99,
      subscribers: 892,
      revenue: 17831.08,
      status: "Active",
    },
  ];

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
        <Button className="bg-black hover:bg-gray-800 text-white px-4 py-2">
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
              <p className="text-sm font-medium text-gray-600">Total Plans</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-3xl font-bold text-gray-900">
                  {totalPlans}
                </span>
                <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-600">
                    {totalPlans}
                  </span>
                </div>
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
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
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
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
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
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div>
                        <p className="font-semibold text-gray-900">
                          ${plan.price}
                        </p>
                        <p className="text-sm text-gray-500">per monthly</p>
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
                        <button className="p-1 text-gray-500 hover:text-gray-700">
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
                        <button className="p-1 text-gray-500 hover:text-red-600">
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
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionPage;

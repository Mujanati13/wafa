import { SubscrptionChart, UserGrowChart } from "@/components/admin/Charts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { TrendingUp, Users, GraduationCap, CreditCard } from "lucide-react";

// Stats Cards Data
const stats = [
  {
    label: "Total Users",
    value: "12,847",
    change: "+12.5%",
    changeText: "from last month",
    icon: <Users className="w-6 h-6 text-gray-400" />,
  },
  {
    label: "Active Subscriptions",
    value: "8,432",
    change: "+8.2%",
    changeText: "from last month",
    icon: <CreditCard className="w-6 h-6 text-gray-400" />,
  },
  {
    label: "Exam Attempts",
    value: "3,247",
    change: "+15.3%",
    changeText: "from last month",
    icon: <GraduationCap className="w-6 h-6 text-gray-400" />,
  },
  {
    label: "Monthly Revenue",
    value: "$28,450",
    change: "+18.7%",
    changeText: "from last month",
    icon: <TrendingUp className="w-6 h-6 text-gray-400" />,
  },
];

const AnalyticsPage = () => {
  return (
    <div className="p-5 space-y-6 flex flex-col">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex flex-row justify-between items-center bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200 min-h-[140px]"
          >
            <div className="flex flex-col gap-2">
              <span className="text-gray-700 font-medium">{stat.label}</span>
              <span className="text-3xl font-bold text-black">
                {stat.value}
              </span>
              <span className="text-sm text-green-600 font-semibold">
                {stat.change}{" "}
                <span className="text-gray-400 font-normal">
                  {stat.changeText}
                </span>
              </span>
            </div>
            <div className="flex items-center justify-center ml-4">
              {stat.icon}
            </div>
          </div>
        ))}
      </div>
      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UserGrowChart />
        <SubscrptionChart />
      </div>
    </div>
  );
};

export default AnalyticsPage;

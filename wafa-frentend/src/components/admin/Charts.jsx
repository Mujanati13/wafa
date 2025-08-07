import { Chart as ChartJS, ArcElement, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement } from "chart.js";
import { Doughnut, Line } from "react-chartjs-2";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement
);

const doughnutData = {
  labels: ["Free Plan", "Standard Plan", "Premium Plan"],
  datasets: [
    {
      label: "Subscriptions",
      data: [2500, 3400, 2100],
      backgroundColor: ["#2563eb", "#22c55e", "#f97316"],
      borderWidth: 1,
    },
  ],
};

const doughnutOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: "bottom",
    },
  },
};

const userGrowthChartData = {
  labels: ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  datasets: [
    {
      label: "Total Users",
      data: [8500, 9200, 10100, 11300, 12100, 12847],
      borderColor: "#2563eb",
      backgroundColor: "rgba(37, 99, 235, 0.2)",
      tension: 0.4,
      fill: true,
    },
  ],
};

const options = {
  responsive: true,
  plugins: {
    legend: { position: "top" },
  },
};

export function SubscrptionChart() {
  return (
    <Card className="h-[500px] flex flex-col">
      <CardHeader>
        <CardTitle>Plan Distribution</CardTitle>
        <CardDescription>
          User subscriptions across different plans
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-xs h-full flex items-center justify-center">
          <Doughnut data={doughnutData} options={doughnutOptions} />
        </div>
      </CardContent>
    </Card>
  );
}

export function UserGrowChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>User Growth Trend</CardTitle>
        <CardDescription>Total users over time</CardDescription>
      </CardHeader>
      <CardContent>
        <Line
          key={JSON.stringify(userGrowthChartData)}
          data={userGrowthChartData}
          options={options}
        />
      </CardContent>
    </Card>
  );
}

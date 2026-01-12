import { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
} from "chart.js";
import { Doughnut, Line, Bar, Pie } from "react-chartjs-2";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { adminAnalyticsService } from "@/services/adminAnalyticsService";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement
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

// Subject Performance Bar Chart Data
const subjectPerformanceData = {
  labels: ["Mathematics", "Physics", "Chemistry", "Biology", "English"],
  datasets: [
    {
      label: "Average Score (%)",
      data: [85, 78, 82, 79, 88],
      backgroundColor: [
        "rgba(37, 99, 235, 0.8)",
        "rgba(34, 197, 94, 0.8)",
        "rgba(249, 115, 22, 0.8)",
        "rgba(168, 85, 247, 0.8)",
        "rgba(236, 72, 153, 0.8)",
      ],
      borderColor: [
        "rgba(37, 99, 235, 1)",
        "rgba(34, 197, 94, 1)",
        "rgba(249, 115, 22, 1)",
        "rgba(168, 85, 247, 1)",
        "rgba(236, 72, 153, 1)",
      ],
      borderWidth: 1,
    },
  ],
};

const barOptions = {
  responsive: true,
  plugins: {
    legend: { position: "top" },
  },
  scales: {
    y: {
      beginAtZero: true,
      max: 100,
    },
  },
};

// Exam Attempts Over Time
const examAttemptsData = {
  labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  datasets: [
    {
      label: "Exam Attempts",
      data: [156, 189, 234, 201, 178, 245, 198],
      borderColor: "#22c55e",
      backgroundColor: "rgba(34, 197, 94, 0.2)",
      tension: 0.4,
      fill: true,
    },
  ],
};

// User Demographics Pie Chart
const userDemographicsData = {
  labels: ["High School", "College", "University", "Professional"],
  datasets: [
    {
      label: "Users",
      data: [3200, 4100, 3800, 1747],
      backgroundColor: [
        "rgba(37, 99, 235, 0.8)",
        "rgba(34, 197, 94, 0.8)",
        "rgba(249, 115, 22, 0.8)",
        "rgba(168, 85, 247, 0.8)",
      ],
      borderColor: [
        "rgba(37, 99, 235, 1)",
        "rgba(34, 197, 94, 1)",
        "rgba(249, 115, 22, 1)",
        "rgba(168, 85, 247, 1)",
      ],
      borderWidth: 2,
    },
  ],
};

const pieOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: "bottom",
    },
  },
};

export function SubscrptionChart() {
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscriptionData = async () => {
      try {
        const response = await adminAnalyticsService.getSubscriptionAnalytics();
        const data = response.data;
        
        setSubscriptionData({
          labels: ["Free Plan", "Premium Plan"],
          datasets: [
            {
              label: "Subscriptions",
              data: [data.free || 0, data.premium || 0],
              backgroundColor: ["#2563eb", "#22c55e"],
              borderWidth: 1,
            },
          ],
        });
      } catch (error) {
        console.error('Error fetching subscription data:', error);
        // Fallback to static data
        setSubscriptionData(doughnutData);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionData();
  }, []);

  return (
    <Card className="h-auto sm:h-[400px] md:h-[450px] lg:h-[500px] flex flex-col">
      <CardHeader className="p-3 sm:p-4 md:p-6">
        <CardTitle className="text-sm sm:text-base md:text-lg">Plan Distribution</CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          User subscriptions across different plans
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 items-center justify-center p-2 sm:p-4 md:p-6">
        {loading ? (
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        ) : (
          <div className="w-full max-w-[200px] sm:max-w-xs h-full flex items-center justify-center">
            <Doughnut data={subscriptionData || doughnutData} options={doughnutOptions} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function UserGrowChart() {
  const [userGrowthData, setUserGrowthData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserGrowth = async () => {
      try {
        const response = await adminAnalyticsService.getUserGrowth('30d');
        const data = response.data;
        
        // Format the data for the chart
        const labels = data.map(item => {
          const date = new Date(item._id.year, item._id.month - 1, item._id.day);
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });
        
        const counts = data.map(item => item.count);
        
        // Calculate cumulative counts
        const cumulativeCounts = counts.reduce((acc, count, index) => {
          const prevTotal = index > 0 ? acc[index - 1] : 0;
          acc.push(prevTotal + count);
          return acc;
        }, []);
        
        setUserGrowthData({
          labels,
          datasets: [
            {
              label: "Total Users",
              data: cumulativeCounts,
              borderColor: "#2563eb",
              backgroundColor: "rgba(37, 99, 235, 0.2)",
              tension: 0.4,
              fill: true,
            },
          ],
        });
      } catch (error) {
        console.error('Error fetching user growth:', error);
        // Fallback to static data
        setUserGrowthData(userGrowthChartData);
      } finally {
        setLoading(false);
      }
    };

    fetchUserGrowth();
  }, []);

  return (
    <Card>
      <CardHeader className="p-3 sm:p-4 md:p-6">
        <CardTitle className="text-sm sm:text-base md:text-lg">User Growth Trend</CardTitle>
        <CardDescription className="text-xs sm:text-sm">Total users over time</CardDescription>
      </CardHeader>
      <CardContent className="p-2 sm:p-4 md:p-6">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <Line
            key={JSON.stringify(userGrowthData)}
            data={userGrowthData || userGrowthChartData}
            options={options}
          />
        )}
      </CardContent>
    </Card>
  );
}

export function SubjectPerformanceChart() {
  return (
    <Card>
      <CardHeader className="p-3 sm:p-4 md:p-6">
        <CardTitle className="text-sm sm:text-base md:text-lg">Subject Performance</CardTitle>
        <CardDescription className="text-xs sm:text-sm">Average scores by subject</CardDescription>
      </CardHeader>
      <CardContent className="p-2 sm:p-4 md:p-6">
        <Bar data={subjectPerformanceData} options={barOptions} />
      </CardContent>
    </Card>
  );
}

export function ExamAttemptsChart() {
  return (
    <Card>
      <CardHeader className="p-3 sm:p-4 md:p-6">
        <CardTitle className="text-sm sm:text-base md:text-lg">Weekly Exam Activity</CardTitle>
        <CardDescription className="text-xs sm:text-sm">Exam attempts throughout the week</CardDescription>
      </CardHeader>
      <CardContent className="p-2 sm:p-4 md:p-6">
        <Line data={examAttemptsData} options={options} />
      </CardContent>
    </Card>
  );
}

export function UserDemographicsChart() {
  const [demographicsData, setDemographicsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDemographics = async () => {
      try {
        const response = await adminAnalyticsService.getUserDemographics();
        const data = response.data;
        
        // Take top 5 demographics
        const topDemographics = data.slice(0, 5);
        
        setDemographicsData({
          labels: topDemographics.map(d => d._id || 'N/A'),
          datasets: [
            {
              label: "Users",
              data: topDemographics.map(d => d.count),
              backgroundColor: [
                "rgba(37, 99, 235, 0.8)",
                "rgba(34, 197, 94, 0.8)",
                "rgba(249, 115, 22, 0.8)",
                "rgba(168, 85, 247, 0.8)",
                "rgba(236, 72, 153, 0.8)",
              ],
              borderColor: [
                "rgba(37, 99, 235, 1)",
                "rgba(34, 197, 94, 1)",
                "rgba(249, 115, 22, 1)",
                "rgba(168, 85, 247, 1)",
                "rgba(236, 72, 153, 1)",
              ],
              borderWidth: 2,
            },
          ],
        });
      } catch (error) {
        console.error('Error fetching demographics:', error);
        // Fallback to static data
        setDemographicsData(userDemographicsData);
      } finally {
        setLoading(false);
      }
    };

    fetchDemographics();
  }, []);

  return (
    <Card className="h-auto sm:h-[400px] md:h-[450px] lg:h-[500px] flex flex-col">
      <CardHeader className="p-3 sm:p-4 md:p-6">
        <CardTitle className="text-sm sm:text-base md:text-lg">User Demographics</CardTitle>
        <CardDescription className="text-xs sm:text-sm">User distribution by semester</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 items-center justify-center p-2 sm:p-4 md:p-6">
        {loading ? (
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        ) : (
          <div className="w-full max-w-[200px] sm:max-w-xs h-full flex items-center justify-center">
            <Pie data={demographicsData || userDemographicsData} options={pieOptions} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

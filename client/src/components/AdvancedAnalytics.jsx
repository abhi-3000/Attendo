import React from "react";
import { useGetAdvancedAnalyticsQuery } from "../features/api/apiSlice";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

const AdvancedAnalytics = () => {
  const { data, isLoading } = useGetAdvancedAnalyticsQuery();

  if (isLoading)
    return (
      <div className="p-8 text-center text-slate-500 font-medium">
        Loading Analytics...
      </div>
    );
  if (!data) return null;

  const branchChartData = {
    labels: data.branchStats.map((b) => b.name),
    datasets: [
      {
        label: "Overall Attendance Percentage",
        data: data.branchStats.map((b) => b.percentage),
        backgroundColor: "rgba(59, 130, 246, 0.8)",
        borderColor: "rgb(37, 99, 235)",
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const trendChartData = {
    labels: data.trendData.map((t) => t.date),
    datasets: [
      {
        label: "Present Students",
        data: data.trendData.map((t) => t.present),
        borderColor: "rgb(34, 197, 94)",
        backgroundColor: "rgba(34, 197, 94, 0.2)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "Absent Students",
        data: data.trendData.map((t) => t.absent),
        borderColor: "rgb(239, 68, 68)",
        backgroundColor: "rgba(239, 68, 68, 0.2)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
    },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 min-h-[350px] flex flex-col">
        <h2 className="text-lg font-bold text-slate-800 mb-6">
          Branch Performance
        </h2>
        <div className="flex-1 relative">
          <Bar data={branchChartData} options={chartOptions} />
        </div>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 min-h-[350px] flex flex-col">
        <h2 className="text-lg font-bold text-slate-800 mb-6">
          Recent Attendance Trends
        </h2>
        <div className="flex-1 relative">
          <Line data={trendChartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};

export default AdvancedAnalytics;

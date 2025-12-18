import { useGetAdminStatsQuery } from "../../features/api/apiSlice";
import { motion } from "framer-motion";
import {
  Users,
  BookOpen,
  GraduationCap,
  TrendingUp,
  Activity,
  Loader2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

// Reusable Stat Card
const StatCard = ({ title, value, icon, color, subtext }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <h3 className="text-2xl font-bold text-slate-800 mt-1">{value}</h3>
      </div>
      <div className={`p-3 rounded-lg ${color}`}>{icon}</div>
    </div>
    {subtext && (
      <div className="mt-4 flex items-center text-sm text-slate-400 gap-1">
        <span>{subtext}</span>
      </div>
    )}
  </motion.div>
);

const AdminDashboard = () => {
  const { data, isLoading } = useGetAdminStatsQuery();

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Overview</h1>
        <div className="text-sm text-slate-500 bg-white px-3 py-1 rounded-full border shadow-sm">
          Academic Year: 2024-2025
        </div>
      </div>

      {/* Dynamic Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Students"
          value={data?.totalStudents || 0}
          icon={<GraduationCap size={24} className="text-blue-600" />}
          color="bg-blue-50"
          subtext="Registered across all branches"
        />
        <StatCard
          title="Total Faculty"
          value={data?.totalFaculty || 0}
          icon={<Users size={24} className="text-purple-600" />}
          color="bg-purple-50"
          subtext="Active teaching staff"
        />
        <StatCard
          title="Active Courses"
          value={data?.activeCourses || 0}
          icon={<BookOpen size={24} className="text-orange-600" />}
          color="bg-orange-50"
          subtext="Currently running"
        />
        <StatCard
          title="Avg. Attendance"
          value={`${data?.avgAttendance || 0}%`}
          icon={<TrendingUp size={24} className="text-green-600" />}
          color="bg-green-50"
          subtext="Institute-wide average"
        />
      </div>

      {/* Recent System Activity */}
      <div className="mt-8 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 mb-6">
          <Activity size={20} className="text-blue-600" />
          <h2 className="text-lg font-bold text-slate-800">
            Recent System Activity
          </h2>
        </div>

        <div className="space-y-4">
          {data?.recentActivity?.length === 0 ? (
            <p className="text-slate-500 text-sm">No recent activity found.</p>
          ) : (
            data?.recentActivity.map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-lg transition-colors border-b border-slate-50 last:border-0"
              >
                <div
                  className={`h-2 w-2 rounded-full ${
                    activity.type === "student"
                      ? "bg-blue-500"
                      : activity.type === "faculty"
                      ? "bg-purple-500"
                      : "bg-orange-500"
                  }`}
                ></div>

                <p className="text-sm text-slate-600 flex-1">{activity.text}</p>

                <span className="text-xs text-slate-400 whitespace-nowrap">
                  {formatDistanceToNow(new Date(activity.time), {
                    addSuffix: true,
                  })}
                </span>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

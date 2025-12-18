import { useGetStudentDashboardQuery } from "../../features/api/apiSlice";
import { motion } from "framer-motion";
import { BookOpen, AlertCircle, CheckCircle } from "lucide-react";

const StudentDashboard = () => {
  const { data, isLoading } = useGetStudentDashboardQuery();

  if (isLoading)
    return (
      <div className="p-8 text-center text-slate-500">
        Loading your academic data...
      </div>
    );

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-xl">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {data?.studentName?.split(" ")[0] || "Student"}!
        </h1>
        <p className="opacity-90">
          {data?.program} • {data?.branch} • Semester {data?.semester}
        </p>
      </div>

      <h2 className="text-xl font-bold text-slate-800">My Attendance</h2>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.courses?.map((course) => {
          const percent = parseFloat(course.percentage);
          const isSafe = percent >= 75;
          const color = isSafe
            ? "bg-green-500"
            : percent >= 65
            ? "bg-yellow-500"
            : "bg-red-500";
          const statusColor = isSafe
            ? "text-green-600 bg-green-50"
            : "text-red-600 bg-red-50";

          return (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">
                    {course.name}
                  </h3>
                  <p className="text-sm text-slate-500 font-mono">
                    {course.code}
                  </p>
                </div>
                <div className={`p-2 rounded-lg ${statusColor}`}>
                  {isSafe ? (
                    <CheckCircle size={20} />
                  ) : (
                    <AlertCircle size={20} />
                  )}
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Faculty</span>
                  <span className="font-medium text-slate-700">
                    {course.faculty}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Classes Attended</span>
                  <span className="font-medium text-slate-700">
                    {course.attendedClasses} / {course.totalClasses}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="relative pt-2">
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className={isSafe ? "text-green-600" : "text-red-600"}>
                    {course.percentage}%
                  </span>
                  <span className="text-slate-400">Target: 75%</span>
                </div>
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${color}`}
                    style={{ width: `${course.percentage}%` }}
                  ></div>
                </div>
              </div>
            </motion.div>
          );
        })}

        {data?.courses?.length === 0 && (
          <div className="col-span-full text-center py-10 text-slate-500 bg-white rounded-xl border border-dashed">
            No courses found for your current semester.
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;

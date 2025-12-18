import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useGetCourseStudentsQuery,
  useMarkAttendanceMutation,
} from "../../features/api/apiSlice";
import { format } from "date-fns";
import {
  ArrowLeft,
  Save,
  Download,
  Calendar,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

const AttendanceSheet = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  // State for Date (Default: Today in YYYY-MM-DD)
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // Fetch Students & Existing Attendance
  const {
    data: students,
    isLoading,
    refetch,
  } = useGetCourseStudentsQuery({ courseId, date: selectedDate });
  const [markAttendance, { isLoading: isSaving }] = useMarkAttendanceMutation();

  // Local State to hold attendance changes before saving
  const [attendanceMap, setAttendanceMap] = useState({});

  // When data loads, sync local state
  useEffect(() => {
    if (students) {
      const initialMap = {};
      students.forEach((student) => {
        // If DB has status, use it. Else default to "PRESENT"
        initialMap[student.id] = student.status || "PRESENT";
      });
      setAttendanceMap(initialMap);
    }
  }, [students, selectedDate]);

  // Toggle Logic
  const toggleStatus = (studentId) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: prev[studentId] === "PRESENT" ? "ABSENT" : "PRESENT",
    }));
  };

  // Save Function with Toast
  const handleSave = async () => {
    const records = Object.keys(attendanceMap).map((studentId) => ({
      studentId,
      status: attendanceMap[studentId],
    }));

    try {
      await markAttendance({ courseId, date: selectedDate, records }).unwrap();

      // Success Notification
      toast.success("Attendance marked successfully!", {
        style: {
          border: "1px solid #4ade80",
          padding: "16px",
          color: "#14532d",
        },
        iconTheme: { primary: "#4ade80", secondary: "#FFFAEE" },
      });

      refetch(); // Refresh data to confirm save
    } catch (err) {
      toast.error("Failed to save attendance.");
    }
  };

  // Export Excel Function
  const handleExport = async () => {
    try {
      toast.loading("Generating Excel report...", { id: "exportToast" });

      const token = localStorage.getItem("token"); // Get auth token

      // Note: Ensure your API URL is correct here (localhost:5000 or your production URL)
      const response = await fetch(
        `https://attendo-hfmg.onrender.com/api/faculty/attendance/${courseId}/export`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Export failed");

      // Convert response to blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Attendance_Report_${selectedDate}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      toast.success("Excel downloaded successfully!", { id: "exportToast" });
    } catch (error) {
      toast.error("Failed to download Excel file.", { id: "exportToast" });
    }
  };

  if (isLoading)
    return (
      <div className="p-8 text-center text-slate-500">
        Loading Class List...
      </div>
    );

  // Calculate Live Stats
  const total = students?.length || 0;
  const presentCount = Object.values(attendanceMap).filter(
    (s) => s === "PRESENT"
  ).length;
  const absentCount = total - presentCount;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div>
          <button
            onClick={() => navigate("/faculty/dashboard")}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-2 transition-colors"
          >
            <ArrowLeft size={18} /> Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-slate-800">Mark Attendance</h1>
          <p className="text-slate-500 text-sm mt-1">
            <span className="font-semibold text-green-600">
              {presentCount} Present
            </span>{" "}
            •{" "}
            <span className="font-semibold text-red-500">
              {absentCount} Absent
            </span>
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-lg border border-slate-200">
          <Calendar size={20} className="text-slate-500 ml-2" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-transparent border-none focus:ring-0 text-slate-700 font-medium outline-none cursor-pointer"
          />
        </div>
      </div>

      {/* Student Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Roll No
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Student Name
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">
                  Status
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students?.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-slate-500">
                    No students found for this branch/semester.
                  </td>
                </tr>
              ) : (
                students?.map((student) => {
                  const status = attendanceMap[student.id] || "PRESENT";
                  const isPresent = status === "PRESENT";

                  return (
                    <motion.tr
                      key={student.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`transition-colors ${
                        !isPresent ? "bg-red-50/50" : "hover:bg-slate-50"
                      }`}
                    >
                      <td className="px-6 py-4 font-mono text-sm font-medium text-slate-700">
                        {student.rollNumber}
                      </td>
                      <td className="px-6 py-4 text-slate-900 font-medium">
                        {student.name}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                            isPresent
                              ? "bg-green-100 text-green-700 border border-green-200"
                              : "bg-red-100 text-red-700 border border-red-200"
                          }`}
                        >
                          {isPresent ? (
                            <CheckCircle size={14} />
                          ) : (
                            <XCircle size={14} />
                          )}
                          {status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => toggleStatus(student.id)}
                          className={`w-24 py-1.5 rounded-lg text-sm font-semibold transition-all shadow-sm ${
                            isPresent
                              ? "bg-white border border-red-200 text-red-600 hover:bg-red-50"
                              : "bg-white border border-green-200 text-green-600 hover:bg-green-50"
                          }`}
                        >
                          Mark {isPresent ? "Absent" : "Present"}
                        </button>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 flex justify-end gap-4 shadow-lg md:relative md:bg-transparent md:border-0 md:p-0 md:shadow-none z-10">
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-colors"
        >
          <Download size={20} /> Export Excel
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold shadow-lg shadow-blue-500/30 transition-all disabled:opacity-70"
        >
          <Save size={20} /> {isSaving ? "Saving..." : "Save Attendance"}
        </button>
      </div>
    </div>
  );
};

export default AttendanceSheet;

import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import ManageFaculty from "./pages/admin/ManageFaculty";
import Login from "./pages/Login";
import AdminLayout from "./components/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import PrivateRoute from "./components/PrivateRoute";
import ManageStudents from "./pages/admin/ManageStudents";
import ManageCourses from "./pages/admin/ManageCourses";
import FacultyLayout from "./components/FacultyLayout";
import FacultyDashboard from "./pages/faculty/FacultyDashboard";
import AttendanceSheet from "./pages/faculty/AttendanceSheet";
import StudentLayout from "./components/StudentLayout";
import StudentDashboard from "./pages/student/StudentDashboard";

function App() {
  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<Login />} />

        {/* Protected Admin Routes */}
        <Route element={<PrivateRoute allowedRoles={["ADMIN"]} />}>
          <Route path="/admin" element={<AdminLayout />}>
            {/* Default redirect to dashboard */}
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />

            <Route path="faculty" element={<ManageFaculty />} />
            <Route path="students" element={<ManageStudents />} />
            <Route path="courses" element={<ManageCourses />} />
          </Route>
        </Route>

        <Route element={<PrivateRoute allowedRoles={["FACULTY"]} />}>
          <Route path="/faculty" element={<FacultyLayout />}>
            <Route
              index
              element={<Navigate to="/faculty/dashboard" replace />}
            />
            <Route path="dashboard" element={<FacultyDashboard />} />
            <Route path="attendance/:courseId" element={<AttendanceSheet />} />
          </Route>
        </Route>

        <Route element={<PrivateRoute allowedRoles={["STUDENT"]} />}>
          <Route path="/student" element={<StudentLayout />}>
            <Route
              index
              element={<Navigate to="/student/dashboard" replace />}
            />
            <Route path="dashboard" element={<StudentDashboard />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}

export default App;










import { useGetFacultyCoursesQuery } from "../../features/api/apiSlice";
import { useNavigate } from "react-router-dom";
import { BookOpen, Users } from "lucide-react";

const FacultyDashboard = () => {
  const { data: courses, isLoading } = useGetFacultyCoursesQuery();
  const navigate = useNavigate();

  if (isLoading) return <div className="p-8">Loading Courses...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">My Courses</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses?.map((course) => (
          <div
            key={course.id}
            onClick={() => navigate(`/faculty/attendance/${course.id}`)}
            className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <BookOpen size={28} />
              </div>
              <span className="text-xs font-bold bg-slate-100 px-2 py-1 rounded text-slate-600">
                {course.code}
              </span>
            </div>

            <h3 className="text-lg font-bold text-slate-800 mb-1">
              {course.name}
            </h3>
            <p className="text-slate-500 text-sm mb-4">{course.branch.name}</p>

            <div className="flex items-center gap-2 text-sm text-slate-500 border-t pt-3">
              <Users size={16} />
              <span>{course._count.enrollments} Students Enrolled</span>
            </div>
          </div>
        ))}

        {courses?.length === 0 && (
          <div className="col-span-3 text-center py-10 text-slate-500">
            You have not been assigned any courses yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default FacultyDashboard;

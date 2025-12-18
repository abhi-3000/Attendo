import { useState } from "react";
import { useGetCoursesQuery } from "../../features/api/apiSlice";
import { Plus, Search, BookOpen } from "lucide-react";
import AddCourseModal from "../../components/AddCourseModal";

const ManageCourses = () => {
  const { data: courses, isLoading } = useGetCoursesQuery();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  if (isLoading)
    return (
      <div className="p-8 text-center text-slate-500">Loading Courses...</div>
    );

  const filteredCourses = courses?.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Course Management
          </h1>
          <p className="text-slate-500 text-sm">
            Create courses and assign faculty
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 shadow-lg"
        >
          <Plus size={20} />
          Add Course
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-2.5 text-slate-400" size={20} />
        <input
          type="text"
          placeholder="Search by Code or Name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses?.map((course) => (
          <div
            key={course.id}
            className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <BookOpen size={24} />
              </div>
              <span className="text-xs font-semibold bg-slate-100 px-2 py-1 rounded text-slate-600">
                {course.branch.code} - Sem {course.semester}
              </span>
            </div>

            <h3 className="font-bold text-slate-800 text-lg">{course.name}</h3>
            <p className="text-slate-500 text-sm font-mono mb-4">
              {course.code}
            </p>

            <div className="border-t pt-3 flex items-center gap-2 text-sm text-slate-600">
              <span className="font-medium text-slate-400">Faculty:</span>
              {course.faculty ? (
                <span className="text-blue-600 font-medium">
                  {course.faculty.user.name}
                </span>
              ) : (
                <span className="text-red-400 italic">Unassigned</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <AddCourseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default ManageCourses;

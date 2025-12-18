import { useState } from "react";
import { useGetStudentsQuery } from "../../features/api/apiSlice";
import { Plus, Search } from "lucide-react";
import AddStudentModal from "../../components/AddStudentModal";

const ManageStudents = () => {
  const { data: students, isLoading } = useGetStudentsQuery();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  if (isLoading)
    return (
      <div className="p-8 text-center text-slate-500">
        Loading Student Data...
      </div>
    );

  const filteredStudents = students?.filter(
    (s) =>
      s.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Student Management
          </h1>
          <p className="text-slate-500 text-sm">
            Manage student records and enrollments
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all shadow-lg"
        >
          <Plus size={20} />
          Add Student
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-2.5 text-slate-400" size={20} />
        <input
          type="text"
          placeholder="Search by Name or Roll No..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                Student Details
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                Roll No
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                Branch & Batch
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                Sem
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredStudents?.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-6 text-center text-slate-500">
                  No students found.
                </td>
              </tr>
            ) : (
              filteredStudents?.map((student) => (
                <tr
                  key={student.id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold">
                        {student.user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">
                          {student.user.name}
                        </div>
                        <div className="text-sm text-slate-500">
                          {student.user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-sm text-slate-600">
                    {student.rollNumber}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-900 font-medium">
                      {student.branch.code}
                    </div>
                    <div className="text-xs text-slate-500">
                      {student.batch}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {student.semester}
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AddStudentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default ManageStudents;

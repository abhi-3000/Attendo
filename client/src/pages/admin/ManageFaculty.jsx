import { useState } from "react";
import { useGetFacultyListQuery } from "../../features/api/apiSlice";
import { Plus, Search, User } from "lucide-react";
import AddFacultyModal from "../../components/AddFacultyModal";

const ManageFaculty = () => {
  const { data: facultyList, isLoading } = useGetFacultyListQuery();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  if (isLoading)
    return (
      <div className="p-8 text-center text-slate-500">
        Loading Faculty Data...
      </div>
    );

  // Filter logic
  const filteredList = facultyList?.filter(
    (f) =>
      f.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Faculty Management
          </h1>
          <p className="text-slate-500 text-sm">
            Manage professors and departments
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
        >
          <Plus size={20} />
          Add Faculty
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-2.5 text-slate-400" size={20} />
        <input
          type="text"
          placeholder="Search by name or department..."
          className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Faculty Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                Profile
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                Department
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                Designation
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredList?.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-6 text-center text-slate-500">
                  No faculty found.
                </td>
              </tr>
            ) : (
              filteredList?.map((faculty) => (
                <tr
                  key={faculty.id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                        {faculty.user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">
                          {faculty.user.name}
                        </div>
                        <div className="text-sm text-slate-500">
                          {faculty.user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                      {faculty.department}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {faculty.designation}
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

      {/* Modal */}
      <AddFacultyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default ManageFaculty;

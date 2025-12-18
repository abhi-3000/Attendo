import { useForm } from "react-hook-form";
import {
  useAddCourseMutation,
  useGetBranchesQuery,
  useGetFacultyListQuery,
} from "../features/api/apiSlice";
import { X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const AddCourseModal = ({ isOpen, onClose }) => {
  const { register, handleSubmit, reset } = useForm();
  const [addCourse, { isLoading }] = useAddCourseMutation();
  const { data: branches } = useGetBranchesQuery();
  const { data: facultyList } = useGetFacultyListQuery();

  const onSubmit = async (data) => {
    try {
      await addCourse(data).unwrap();
      toast.success("Course added successfully!");
      reset();
      onClose();
    } catch (err) {
      toast.error(err.data?.error || "Failed to add course");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-800">Add New Course</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-red-500 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                Course Code
              </label>
              <input
                {...register("code", { required: true })}
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="CS101"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                Course Name
              </label>
              <input
                {...register("name", { required: true })}
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Data Structures"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                Semester
              </label>
              <input
                type="number"
                {...register("semester", { required: true })}
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                Credits
              </label>
              <input
                type="number"
                {...register("credits", { required: true })}
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="4"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Branch
            </label>
            <select
              {...register("branchId", { required: true })}
              className="w-full border rounded-lg p-2 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">Select Branch</option>
              {branches?.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Assign Faculty (Optional)
            </label>
            <select
              {...register("facultyId")}
              className="w-full border rounded-lg p-2 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">No Faculty Assigned</option>
              {facultyList?.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.user.name} ({f.department})
                </option>
              ))}
            </select>
          </div>

          <button
            disabled={isLoading}
            className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded-lg hover:bg-blue-700 transition-all flex justify-center items-center gap-2 disabled:opacity-70"
          >
            {isLoading && <Loader2 size={18} className="animate-spin" />}
            {isLoading ? "Creating..." : "Create Course"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddCourseModal;

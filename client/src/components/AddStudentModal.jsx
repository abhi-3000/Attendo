import { useForm } from "react-hook-form";
import {
  useAddStudentMutation,
  useGetBranchesQuery,
} from "../features/api/apiSlice";
import { X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const AddStudentModal = ({ isOpen, onClose }) => {
  const { register, handleSubmit, reset } = useForm();
  const [addStudent, { isLoading }] = useAddStudentMutation();
  const { data: branches } = useGetBranchesQuery();

  const onSubmit = async (data) => {
    try {
      await addStudent(data).unwrap();
      toast.success("Student added successfully!");
      reset();
      onClose();
    } catch (err) {
      toast.error(err.data?.error || "Failed to add student");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6 animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-800">Add New Student</h2>
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
                Full Name
              </label>
              <input
                {...register("name", { required: true })}
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Rahul Kumar"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                Email
              </label>
              <input
                {...register("email", { required: true })}
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="rahul@iiitranchi.ac.in"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                Roll Number
              </label>
              <input
                {...register("rollNumber", { required: true })}
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="2022UGCS001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                Program
              </label>
              <select
                {...register("program")}
                className="w-full border rounded-lg p-2 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="BTECH">B.Tech</option>
                <option value="MTECH">M.Tech</option>
                <option value="PHD">Ph.D</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
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
                    {b.code}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                Batch
              </label>
              <input
                {...register("batch", { required: true })}
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="2022-2026"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                Semester
              </label>
              <input
                type="number"
                {...register("semester", { required: true })}
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="1"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Password
            </label>
            <input
              type="password"
              {...register("password", { required: true })}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="••••••"
            />
          </div>

          <button
            disabled={isLoading}
            className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded-lg hover:bg-blue-700 transition-all flex justify-center items-center gap-2 disabled:opacity-70"
          >
            {isLoading && <Loader2 size={18} className="animate-spin" />}
            {isLoading ? "Adding Student..." : "Create Student"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddStudentModal;

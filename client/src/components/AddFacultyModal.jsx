import { useForm } from "react-hook-form";
import { useAddFacultyMutation } from "../features/api/apiSlice";
import { X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const AddFacultyModal = ({ isOpen, onClose }) => {
  const { register, handleSubmit, reset } = useForm();
  const [addFaculty, { isLoading }] = useAddFacultyMutation();

  const onSubmit = async (data) => {
    try {
      await addFaculty(data).unwrap();
      toast.success("Faculty account created!");
      reset();
      onClose();
    } catch (err) {
      toast.error(err.data?.error || "Failed to create faculty");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-800">Add New Faculty</h2>
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
                placeholder="Dr. John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                Email
              </label>
              <input
                {...register("email", { required: true })}
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="john@iiitranchi.ac.in"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                Department
              </label>
              <select
                {...register("department")}
                className="w-full border rounded-lg p-2 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="CSE">Computer Science (CSE)</option>
                <option value="CSE-DSAI">CSE (Data Science & AI)</option>
                <option value="ECE">Electronics (ECE)</option>
                <option value="ECE-ES&IOT">ECE (IoT & Embedded)</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Physics">Physics</option>
                <option value="Humanities">Humanities</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                Designation
              </label>
              <input
                {...register("designation")}
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Assistant Professor"
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
            {isLoading ? "Creating..." : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddFacultyModal;

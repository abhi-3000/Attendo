import { useForm } from "react-hook-form";
import { useLoginMutation } from "../features/api/apiSlice";
import { useDispatch } from "react-redux";
import { setCredentials } from "../features/auth/authSlice";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [login, { isLoading, error }] = useLoginMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      const userData = await login(data).unwrap();
      dispatch(setCredentials({ user: userData, token: userData.token }));
      alert("Login Successful!");
      if (userData.role === "ADMIN") {
        navigate("/admin/dashboard");
      } else if (userData.role === "FACULTY") {
        navigate("/faculty/dashboard");
      } else {
        navigate("/student/dashboard");
      }
    } catch (err) {
      console.error("Failed to login:", err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-4">
      {/* Animated gradient orbs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div
        className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "1s" }}
      ></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Glass card */}
        <div className="bg-white/5 backdrop-blur-xl p-10 rounded-3xl border border-white/10 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-10">
            <motion.h1
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
              className="text-4xl font-bold mb-2 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent"
            >
              IIIT Ranchi
            </motion.h1>
            <p className="text-slate-400 text-sm font-medium tracking-wide">
              Attendance Management System
            </p>
          </div>

          {/* Error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-6 p-4 bg-red-500/10 backdrop-blur-sm border border-red-400/30 text-red-300 text-sm rounded-xl"
            >
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{error.data?.error || "Login failed"}</span>
              </div>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email field */}
            <div>
              <label className="block text-slate-300 text-sm font-semibold mb-2 bg-gradient-to-r from-slate-300 to-slate-400 bg-clip-text text-transparent">
                Email Address
              </label>
              <div className="relative">
                <input
                  {...register("email", { required: "Email is required" })}
                  className="w-full bg-slate-900/40 border border-slate-700/50 rounded-xl px-5 py-3.5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300"
                  placeholder="admin@iiitranchi.ac.in"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-blue-500/0 opacity-0 hover:opacity-100 transition-opacity pointer-events-none blur-xl -z-10"></div>
              </div>
              {errors.email && (
                <motion.span
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-xs mt-1.5 block"
                >
                  {errors.email.message}
                </motion.span>
              )}
            </div>

            {/* Password field */}
            <div>
              <label className="block text-slate-300 text-sm font-semibold mb-2 bg-gradient-to-r from-slate-300 to-slate-400 bg-clip-text text-transparent">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  {...register("password", {
                    required: "Password is required",
                  })}
                  className="w-full bg-slate-900/40 border border-slate-700/50 rounded-xl px-5 py-3.5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300"
                  placeholder="••••••••"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-blue-500/0 opacity-0 hover:opacity-100 transition-opacity pointer-events-none blur-xl -z-10"></div>
              </div>
              {errors.password && (
                <motion.span
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-xs mt-1.5 block"
                >
                  {errors.password.message}
                </motion.span>
              )}
            </div>

            {/* Submit button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isLoading}
              className="w-full relative mt-8 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:via-blue-500 hover:to-purple-500 text-white font-bold py-4 rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group"
            >
              <span className="relative z-10">
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Signing In...
                  </span>
                ) : (
                  "Sign In"
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </motion.button>
          </form>

          {/* Footer text */}
          <div className="mt-8 text-center">
            <p className="text-slate-500 text-xs">
              Secure authentication powered by IIIT Ranchi
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;

// import { useForm } from "react-hook-form";
// import { useLoginMutation } from "../features/api/apiSlice";
// import { useDispatch } from "react-redux";
// import { setCredentials } from "../features/auth/authSlice";
// import { useNavigate } from "react-router-dom";
// import { motion } from "framer-motion";

// const Login = () => {
//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm();
//   const [login, { isLoading, error }] = useLoginMutation();
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   const onSubmit = async (data) => {
//     try {
//       const userData = await login(data).unwrap();
//       dispatch(setCredentials({ user: userData, token: userData.token }));
//       alert("Login Successful!");
//       if (userData.role === "ADMIN") {
//         navigate("/admin/dashboard");
//       } else if (userData.role === "FACULTY") {
//         navigate("/faculty/dashboard");
//       } else {
//         navigate("/student/dashboard");
//       }
//     } catch (err) {
//       console.error("Failed to login:", err);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-black p-4">
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="w-full max-w-md bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/10 shadow-xl"
//       >
//         <div className="text-center mb-8">
//           <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
//             IIIT Ranchi
//           </h1>
//           <p className="text-gray-400 text-sm mt-2">
//             Attendance Management System
//           </p>
//         </div>

//         {error && (
//           <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 text-red-200 text-sm rounded">
//             {error.data?.error || "Login failed"}
//           </div>
//         )}

//         <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
//           <div>
//             <label className="block text-gray-300 text-sm font-medium mb-1">
//               Email
//             </label>
//             <input
//               {...register("email", { required: "Email is required" })}
//               className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
//               placeholder="admin@iiitranchi.ac.in"
//             />
//             {errors.email && (
//               <span className="text-red-400 text-xs">
//                 {errors.email.message}
//               </span>
//             )}
//           </div>

//           <div>
//             <label className="block text-gray-300 text-sm font-medium mb-1">
//               Password
//             </label>
//             <input
//               type="password"
//               {...register("password", { required: "Password is required" })}
//               className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
//               placeholder="••••••"
//             />
//             {errors.password && (
//               <span className="text-red-400 text-xs">
//                 {errors.password.message}
//               </span>
//             )}
//           </div>

//           <button
//             disabled={isLoading}
//             className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-blue-500/30"
//           >
//             {isLoading ? "Signing In..." : "Sign In"}
//           </button>
//         </form>
//       </motion.div>
//     </div>
//   );
// };

// export default Login;

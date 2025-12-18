import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../features/auth/authSlice";
import { LayoutDashboard, LogOut, BookCheck } from "lucide-react";

const FacultyLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 border-b border-slate-700">
          <h2 className="font-bold text-xl">Faculty Panel</h2>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <NavLink
            to="/faculty/dashboard"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-3 rounded-lg ${
                isActive ? "bg-blue-600" : "hover:bg-slate-800"
              }`
            }
          >
            <LayoutDashboard size={20} /> Dashboard
          </NavLink>
        </nav>
        <div className="p-4 border-t border-slate-700">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 text-red-400 hover:bg-slate-800 rounded-lg"
          >
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b flex items-center justify-between px-6 shadow-sm">
          <h1 className="text-xl font-semibold text-slate-800">
            IIIT Ranchi AMS
          </h1>
          <span className="text-sm font-medium text-slate-600">
            Prof. {user?.name}
          </span>
        </header>
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default FacultyLayout;

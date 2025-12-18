import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const PrivateRoute = ({ allowedRoles }) => {
  const { user, token } = useSelector((state) => state.auth);

  // 1. Not logged in? -> Go to Login
  if (!token || !user) {
    return <Navigate to="/" replace />;
  }

  // 2. Logged in but wrong role? -> Warning or Redirect (we'll just redirect to login for now)
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    alert("Access Denied: You do not have permission.");
    return <Navigate to="/" replace />;
  }

  // 3. All good? -> Show the page
  return <Outlet />;
};

export default PrivateRoute;

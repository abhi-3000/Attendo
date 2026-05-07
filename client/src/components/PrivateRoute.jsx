import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const PrivateRoute = ({ allowedRoles }) => {
  const { user, token } = useSelector((state) => state.auth);

  
  if (!token || !user) {
    return <Navigate to="/" replace />;
  }

  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    alert("Access Denied: You do not have permission.");
    return <Navigate to="/" replace />;
  }

  
  return <Outlet />;
};

export default PrivateRoute;

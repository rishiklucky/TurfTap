import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, role }) {
  if (role === "admin") {
    const adminToken = localStorage.getItem("admin_token");
    return adminToken ? children : <Navigate to="/admin-login" />;
  }

  if (role === "user") {
    const userToken = sessionStorage.getItem("user_token");
    return userToken ? children : <Navigate to="/" />;
  }

  return <Navigate to="/" />;
}

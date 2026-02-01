import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../services/api";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const login = async () => {
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email,
        password
      });

      if (res.data.role !== "admin") {
        alert("Not an admin account");
        return;
      }

      // 🔐 STORE ADMIN SESSION (SEPARATE)
      localStorage.setItem("admin_token", res.data.token);
      localStorage.setItem("admin_id", res.data.userId);

      navigate("/admin");
    } catch (err) {
      alert(err.response?.data?.message || "Admin login failed");
    }
  };

  return (
    <div className="container-fluid vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="card shadow-sm p-4" style={{ maxWidth: "420px", width: "100%" }}>
        <h4 className="text-center fw-bold mb-2">Admin Login</h4>
        <p className="text-center text-muted mb-4">
          Sign in to manage turfs & bookings
        </p>

        {/* EMAIL */}
        <div className="mb-3">
          <label className="form-label">Email address</label>
          <input
            type="email"
            className="form-control"
            placeholder="admin@example.com"
            onChange={e => setEmail(e.target.value)}
          />
        </div>

        {/* PASSWORD */}
        <div className="mb-3">
          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            placeholder="Enter password"
            onChange={e => setPassword(e.target.value)}
          />
        </div>

        {/* LOGIN BUTTON */}
        <button className="btn btn-danger w-100 py-2" onClick={login}>
          Login
        </button>

        {/* FOOTER */}
        <div className="text-center mt-3">
          <small className="text-muted">
            Authorized personnel only
          </small>
        </div>
      </div>
    </div>
  );
}

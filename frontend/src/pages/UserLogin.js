import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { API_BASE_URL } from "../services/api";
import "bootstrap/dist/css/bootstrap.min.css";

export default function UserLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const login = async () => {
    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email,
        password
      });

      if (res.data.role !== "user") {
        alert("This account is not a user account");
        setLoading(false);
        return;
      }

      // 🔐 STORE USER SESSION
      sessionStorage.setItem("user_token", res.data.token);
      sessionStorage.setItem("user_id", res.data.userId);

      navigate("/userdashboard");
    } catch (err) {
      alert(err.response?.data?.message || "User login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="row w-100 justify-content-center">
        <div className="col-11 col-sm-8 col-md-5 col-lg-4">
          <div className="card shadow-sm p-4">
            <h4 className="text-center fw-bold mb-2">User Login</h4>
            <p className="text-center text-muted mb-4">
              Book turfs near you instantly
            </p>

            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                placeholder="Enter your email"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>

            <button
              className="btn btn-success w-100 mb-3"
              onClick={login}
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>

            <div className="text-center">
              <small className="text-muted">
                Don’t have an account?{" "}
                <Link to="/register">Register</Link>
              </small>
            </div>

            
          </div>
        </div>
      </div>
    </div>
  );
}

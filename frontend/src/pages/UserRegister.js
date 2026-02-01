import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { API_BASE_URL } from "../services/api";
import "bootstrap/dist/css/bootstrap.min.css";

export default function UserRegister() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const register = async () => {
    if (!form.name || !form.email || !form.password) {
      alert("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      await axios.post(`${API_BASE_URL}/api/auth/register`, form);

      alert("Registered successfully 🎉");
      navigate("/"); // redirect to login
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="row w-100 justify-content-center">
        <div className="col-11 col-sm-8 col-md-5 col-lg-4">
          <div className="card shadow-sm p-4">
            <h4 className="text-center fw-bold mb-2">User Registration</h4>
            <p className="text-center text-muted mb-4">
              Create your account to book turfs
            </p>

            <div className="mb-3">
              <label className="form-label">Name</label>
              <input
                className="form-control"
                placeholder="Enter your name"
                value={form.name}
                onChange={e =>
                  setForm({ ...form, name: e.target.value })
                }
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                placeholder="Enter your email"
                value={form.email}
                onChange={e =>
                  setForm({ ...form, email: e.target.value })
                }
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Create a password"
                value={form.password}
                onChange={e =>
                  setForm({ ...form, password: e.target.value })
                }
              />
            </div>

            <button
              className="btn btn-primary w-100 mb-3"
              onClick={register}
              disabled={loading}
            >
              {loading ? "Registering..." : "Register"}
            </button>

            <div className="text-center">
              <small className="text-muted">
                Already have an account?{" "}
                <Link to="/">Login</Link>
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

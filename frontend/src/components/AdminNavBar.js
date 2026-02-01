import { Link, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

export default function AdminNavBar() {
  const navigate = useNavigate();

  const logout = () => {
  localStorage.removeItem("admin_token");
  localStorage.removeItem("admin_id");
  navigate("/admin-login");
};


  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-danger">
      <div className="container-fluid">
        <Link className="navbar-brand fw-bold" to="/admin">
          Admin Panel
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#adminNavbar"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="adminNavbar">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/admin">
                Turfs
              </Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link" to="/admin/bookings">
                Bookings
              </Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link" to="/admin/stats">
                Turf Stats
              </Link>
            </li>

            <li className="nav-item">
              <button
                className="btn btn-sm btn-outline-light ms-2"
                onClick={logout}
              >
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

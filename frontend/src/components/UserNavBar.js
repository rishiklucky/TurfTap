import { Link, useNavigate } from "react-router-dom";

export default function UserNavBar() {
  const navigate = useNavigate();

  const logout = () => {
    sessionStorage.removeItem("user_token");
    sessionStorage.removeItem("user_id");
    navigate("/");
  };

  // helper to close navbar after click (mobile UX)
  const closeNavbar = () => {
    const navbar = document.getElementById("userNavbar");
    if (navbar.classList.contains("show")) {
      navbar.classList.remove("show");
    }
  };

  return (
    <nav className="navbar navbar-expand-md navbar-dark bg-dark sticky-top shadow">
      <div className="container-fluid">
        {/* Brand */}
        <Link className="navbar-brand fw-bold" to="/userdashboard">
          TurfBooking
        </Link>

        {/* Toggle button */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#userNavbar"
          aria-controls="userNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Collapsible content */}
        <div className="collapse navbar-collapse" id="userNavbar">
          <ul className="navbar-nav ms-auto text-center text-md-start">
            <li className="nav-item">
              <Link
                className="nav-link"
                to="/userdashboard"
                onClick={closeNavbar}
              >
                📍 Map
              </Link>
            </li>

            <li className="nav-item">
              <Link
                className="nav-link"
                to="/my-bookings"
                onClick={closeNavbar}
              >
                📖 My Bookings
              </Link>
            </li>

            <li className="nav-item mt-2 mt-md-0 ms-md-3">
              <button
                className="btn btn-outline-light btn-sm w-100"
                onClick={() => {
                  closeNavbar();
                  logout();
                }}
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

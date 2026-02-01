import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

// USER PAGES
import MapHome from "./pages/MapHome";
import BookingPage from "./pages/BookingPage";
import BookingHistory from "./pages/BookingHistory";

// ADMIN PAGES
import AdminDashboard from "./pages/Admindashboard";
import AdminBookings from "./pages/AdminBookings";
import AdminTurfStats from "./pages/AdminTurfStats";

// AUTH PAGES
import UserLogin from "./pages/UserLogin";
import UserRegister from "./pages/UserRegister";
import AdminLogin from "./pages/AdminLogin";

// NAVBARS
import UserNavBar from "./components/UserNavBar";
import AdminNavBar from "./components/AdminNavBar";

/**
 * LAYOUT – decides which navbar to show
 */
function Layout({ children }) {
  const location = useLocation();

  const userToken = sessionStorage.getItem("user_token");
  const adminToken = localStorage.getItem("admin_token");

  // Pages without navbar
  const authPages = ["/", "/register", "/admin-login"];
  if (authPages.includes(location.pathname)) {
    return children;
  }

  // Admin navbar
  if (adminToken) {
    return (
      <>
        <AdminNavBar />
        {children}
      </>
    );
  }

  // User navbar
  if (userToken) {
    return (
      <>
        <UserNavBar />
        {children}
      </>
    );
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {/* ========== PUBLIC ========== */}
          <Route path="/" element={<UserLogin />} />
          <Route path="/register" element={<UserRegister />} />
          <Route path="/admin-login" element={<AdminLogin />} />

          {/* ========== USER ========== */}
          <Route
            path="/userdashboard"
            element={
              <ProtectedRoute role="user">
                <MapHome />
              </ProtectedRoute>
            }
          />

          <Route
            path="/book/:turfId"
            element={
              <ProtectedRoute role="user">
                <BookingPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute role="user">
                <BookingHistory />
              </ProtectedRoute>
            }
          />

          {/* ========== ADMIN ========== */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/bookings"
            element={
              <ProtectedRoute role="admin">
                <AdminBookings />
              </ProtectedRoute>
            }
          />
          

            <Route
              path="/admin/stats"
              element={
                <ProtectedRoute role="admin">
                  <AdminTurfStats />
                </ProtectedRoute>
              }
            />

        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;

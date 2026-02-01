import { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { API_BASE_URL } from "../services/api";

export default function AdminTurfStats() {
  const [stats, setStats] = useState([]);

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/bookings/stats/turf-wise`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`
        }
      })
      .then(res => setStats(res.data))
      .catch(err =>
        alert(err.response?.data?.message || "Failed to load stats")
      );
  }, []);

  return (
    <div className="container-fluid px-3 py-3">
      <h3 className="fw-bold mb-4">Turf-wise Booking Statistics</h3>

      {stats.length === 0 ? (
        <div className="alert alert-info">
          No booking data available.
        </div>
      ) : (
        <div className="row g-3">
          {stats.map(stat => (
            <div className="col-12 col-md-6 col-lg-4" key={stat._id}>
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  {/* TURF NAME */}
                  <h5 className="card-title fw-bold mb-3">
                    {stat.turfName}
                  </h5>

                  {/* TOTAL BOOKINGS */}
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Total Bookings</span>
                    <strong>{stat.totalBookings}</strong>
                  </div>

                  {/* ACTIVE BOOKINGS */}
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Active</span>
                    <span className="badge bg-success">
                      {stat.activeBookings}
                    </span>
                  </div>

                  {/* CANCELLED BOOKINGS */}
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Cancelled</span>
                    <span className="badge bg-danger">
                      {stat.cancelledBookings}
                    </span>
                  </div>

                  <hr />

                  {/* REVENUE */}
                  <div className="d-flex justify-content-between">
                    <span className="fw-bold">Revenue</span>
                    <span className="fw-bold text-success">
                      ₹{stat.revenue}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

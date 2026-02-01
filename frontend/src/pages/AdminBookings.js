import { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { API_BASE_URL } from "../services/api";

const DEFAULT_IMAGE =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRbcKtU3BWTb-XajjkuP4S0O-sltktg1H3A1g&s";

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState("active");
  const [selectedTurfId, setSelectedTurfId] = useState(null);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/bookings/all`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`
        }
      })
      .then(res => setBookings(res.data))
      .catch(err =>
        alert(err.response?.data?.message || "Failed to load bookings")
      );
  }, []);

  /* ---------- FILTER LOGIC ---------- */
  const filteredBookings = bookings.filter(b => {
    if (selectedTurfId && b.turfId?._id !== selectedTurfId) return false;

    if (filter === "cancelled") return b.status === "cancelled";
    if (b.status === "cancelled") return false;

    if (filter === "active") return b.date === today;
    if (filter === "upcoming") return b.date > today;
    if (filter === "past") return b.date < today;

    return true;
  });

  /* ---------- UNIQUE TURFS ---------- */
  const turfs = Object.values(
    bookings.reduce((acc, b) => {
      if (!b.turfId) return acc;
      acc[b.turfId._id] = b.turfId;
      return acc;
    }, {})
  );

  return (
    <div className="container-fluid px-3 py-3">
      <h3 className="fw-bold mb-4">Admin – Bookings Overview</h3>

      {/* ---------- TURF CARDS ---------- */}
      <div className="row g-3 mb-4">
        {/* ALL TURFS */}
        <div className="col-6 col-md-3">
          <div
            className={`card h-100 text-center shadow-sm ${
              !selectedTurfId ? "border-primary" : ""
            }`}
            role="button"
            onClick={() => setSelectedTurfId(null)}
          >
            <div
              className="d-flex align-items-center justify-content-center bg-light fw-bold"
              style={{ height: "130px" }}
            >
              All Turfs
            </div>
            <div className="card-body py-2">
              <small className="text-muted">View all bookings</small>
            </div>
          </div>
        </div>

        {/* INDIVIDUAL TURFS */}
        {turfs.map(turf => (
          <div className="col-6 col-md-3" key={turf._id}>
            <div
              className={`card h-100 shadow-sm ${
                selectedTurfId === turf._id ? "border-primary" : ""
              }`}
              role="button"
              onClick={() => setSelectedTurfId(turf._id)}
            >
              <img
                src={turf.image || DEFAULT_IMAGE}
                alt={turf.name}
                className="img-fluid rounded-top"
                style={{ height: "130px", objectFit: "cover" }}
                onError={e => (e.target.src = DEFAULT_IMAGE)}
              />
              <div className="card-body py-2 text-center">
                <h6 className="mb-1 text-truncate">{turf.name}</h6>
                <small className="text-muted">
                  ₹{turf.pricePerHour}/hour
                </small>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ---------- FILTER BUTTONS ---------- */}
      <div className="btn-group flex-wrap mb-3">
        <button
          className={`btn btn-outline-primary ${filter === "active" && "active"}`}
          onClick={() => setFilter("active")}
        >
          Today
        </button>
        <button
          className={`btn btn-outline-primary ${filter === "upcoming" && "active"}`}
          onClick={() => setFilter("upcoming")}
        >
          Upcoming
        </button>
        <button
          className={`btn btn-outline-secondary ${filter === "past" && "active"}`}
          onClick={() => setFilter("past")}
        >
          Past
        </button>
        <button
          className={`btn btn-outline-danger ${filter === "cancelled" && "active"}`}
          onClick={() => setFilter("cancelled")}
        >
          Cancelled
        </button>
      </div>

      {/* ---------- BOOKINGS TABLE ---------- */}
      <div className="table-responsive">
        {filteredBookings.length === 0 ? (
          <p className="text-muted">No bookings found.</p>
        ) : (
          <table className="table table-bordered table-hover align-middle">
            <thead className="table-dark">
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Turf</th>
                <th>Date</th>
                <th>Slot</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map(b => (
                <tr
                  key={b._id}
                  className={b.status === "cancelled" ? "table-danger" : ""}
                >
                  <td>{b.userId?.name}</td>
                  <td className="text-truncate">{b.userId?.email}</td>
                  <td>{b.turfId?.name}</td>
                  <td>{b.date}</td>
                  <td>{b.slotTime}</td>
                  <td>
                    {b.status === "cancelled" ? (
                      <span className="badge bg-danger">Cancelled</span>
                    ) : (
                      <span className="badge bg-success">Booked</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

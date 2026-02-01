import { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { API_BASE_URL } from "../services/api";
import { useLocation } from "react-router-dom";

export default function BookingHistory() {
  const [bookings, setBookings] = useState([]);
  const location = useLocation();

  const [filter, setFilter] = useState(
    location.state?.filter || "active"
  );

  const today = new Date().toISOString().split("T")[0];

  const loadBookings = () => {
    axios
      .get(`${API_BASE_URL}/api/bookings/my`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("user_token")}`
        }
      })
      .then(res => setBookings(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const cancelBooking = async bookingId => {
    if (!window.confirm("Cancel this booking?")) return;

    try {
      await axios.delete(
        `${API_BASE_URL}/api/bookings/cancel/${bookingId}`,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("user_token")}`
          }
        }
      );
      loadBookings();
    } catch {
      alert("Cancel failed");
    }
  };

  /* ---------- FILTER LOGIC ---------- */
  const filteredBookings = bookings.filter(b => {
    if (filter === "cancelled") return b.status === "cancelled";
    if (b.status === "cancelled") return false;

    if (filter === "active") return b.date === today;
    if (filter === "upcoming") return b.date > today;
    if (filter === "past") return b.date < today;

    return true;
  });

  return (
    <div className="container-fluid px-3 py-3">
      <h3 className="fw-bold mb-3">My Bookings</h3>

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
                <th>Turf</th>
                <th>Date</th>
                <th>Slot</th>
                <th>Price</th>
                <th>Status</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map(b => (
                <tr key={b._id}>
                  <td className="fw-semibold">{b.turfId?.name}</td>
                  <td>{b.date}</td>
                  <td>{b.slotTime}</td>
                  <td>₹{b.turfId?.pricePerHour}</td>
                  <td>
                    {b.status === "cancelled" ? (
                      <span className="badge bg-danger">Cancelled</span>
                    ) : (
                      <span className="badge bg-success">Booked</span>
                    )}
                  </td>
                  <td className="text-center">
                    {b.status === "booked" && b.date >= today && (
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => cancelBooking(b._id)}
                      >
                        Cancel
                      </button>
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

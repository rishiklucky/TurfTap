import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { API_BASE_URL } from "../services/api";

export default function BookingPage() {
  const { turfId } = useParams();
  const navigate = useNavigate();

  const [turf, setTurf] = useState(null);
  const [date, setDate] = useState("");
  const [bookedSlots, setBookedSlots] = useState([]);

  /* ---------- LOAD TURF DETAILS ---------- */
  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/turfs/all`)
      .then(res => {
        const t = res.data.find(t => t._id === turfId);
        setTurf(t);
      });
  }, [turfId]);

  /* ---------- LOAD BOOKED SLOTS ---------- */
  useEffect(() => {
    if (!date) return;

    axios.get(
      `${API_BASE_URL}/api/bookings/booked-slots?turfId=${turfId}&date=${date}`,
      {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("user_token")}`
        }
      }
    )
    .then(res => setBookedSlots(res.data));
  }, [date, turfId]);

  /* ---------- BOOK SLOT ---------- */
  const bookSlot = async (slotId) => {
    if (!date) return alert("Select date");

    try {
      await axios.post(
        `${API_BASE_URL}/api/bookings/book`,
        { turfId, date, slotId },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("user_token")}`
          }
        }
      );

      const today = new Date().toISOString().split("T")[0];
      const filter = date === today ? "active" : "upcoming";

      navigate("/my-bookings", { state: { filter } });
    } catch (err) {
      alert(err.response?.data?.message || "Booking failed");
    }
  };

  if (!turf) {
    return <p className="text-center mt-5">Loading turf...</p>;
  }

  return (
    <div className="container-fluid px-3 py-3">
      {/* ---------- TURF INFO ---------- */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h4 className="fw-bold mb-1">{turf.name}</h4>
          <p className="text-muted mb-2">
            ₹{turf.pricePerHour}/hour
          </p>

          <label className="form-label fw-semibold">
            Select Date
          </label>
          <input
            type="date"
            className="form-control"
            value={date}
            onChange={e => setDate(e.target.value)}
          />
        </div>
      </div>

      {/* ---------- SLOTS ---------- */}
      <h5 className="fw-bold mb-3">Available Slots</h5>

      <div className="row g-3">
        {turf.slots.map(slot => {
          const isBooked = bookedSlots.includes(slot.time);

          return (
            <div className="col-12 col-md-6 col-lg-4" key={slot._id}>
              <div
                className={`card h-100 shadow-sm ${
                  isBooked ? "border-danger" : "border-success"
                }`}
              >
                <div className="card-body text-center">
                  <h6 className="mb-2">{slot.time}</h6>

                  {isBooked ? (
                    <span className="badge bg-danger mb-2">
                      Booked
                    </span>
                  ) : (
                    <span className="badge bg-success mb-2">
                      Available
                    </span>
                  )}

                  {!isBooked && (
                    <button
                      className="btn btn-success w-100 mt-2"
                      onClick={() => bookSlot(slot._id)}
                    >
                      Book Slot
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

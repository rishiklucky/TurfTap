import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "../utils/fixLeafletIcon";
import blueMarker from "../utils/blueMarker";
import { API_BASE_URL } from "../services/api";

/* ---------- MAP CLICK PICKER ---------- */
function LocationPicker({ setPosition }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    }
  });
  return null;
}

export default function AdminDashboard() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [position, setPosition] = useState(null);
  const [message, setMessage] = useState("");
  const [turfs, setTurfs] = useState([]);
  const [editingTurfId, setEditingTurfId] = useState(null);
  const [selectedTurf, setSelectedTurf] = useState(null);
  const [selectedSlots, setSelectedSlots] = useState([]);

  const predefinedSlots = [
    "12 PM - 1 PM","1 PM - 2 PM","2 PM - 3 PM","3 PM - 4 PM",
    "4 PM - 5 PM","5 PM - 6 PM","6 PM - 7 PM","7 PM - 8 PM",
    "8 PM - 9 PM","9 PM - 10 PM","10 PM - 11 PM","11 PM - 12 AM"
  ];

  const adminAuth = {
    headers: { Authorization: `Bearer ${localStorage.getItem("admin_token")}` }
  };

  const loadTurfs = async () => {
    const res = await axios.get(`${API_BASE_URL}/api/turfs/all`, adminAuth);
    setTurfs(res.data);
  };

  useEffect(() => {
    loadTurfs();
  }, []);

  /* ---------- ADD / UPDATE TURF ---------- */
  const addTurf = async () => {
    if (!name || !price || !position) return alert("Fill all fields");

    const payload = {
      name,
      pricePerHour: price,
      image,
      location: { type: "Point", coordinates: [position[1], position[0]] }
    };

    if (editingTurfId) {
      await axios.put(`${API_BASE_URL}/api/turfs/update/${editingTurfId}`, payload, adminAuth);
      setMessage("✏️ Turf updated");
    } else {
      await axios.post(`${API_BASE_URL}/api/turfs/add`, payload, adminAuth);
      setMessage("✅ Turf added");
    }

    setName(""); setPrice(""); setImage(""); setPosition(null);
    setEditingTurfId(null);
    loadTurfs();
  };

  const startEdit = turf => {
    setEditingTurfId(turf._id);
    setName(turf.name);
    setPrice(turf.pricePerHour);
    setImage(turf.image || "");
    setPosition([turf.location.coordinates[1], turf.location.coordinates[0]]);
  };

  const deleteTurf = async id => {
    if (!window.confirm("Delete turf?")) return;
    await axios.delete(`${API_BASE_URL}/api/turfs/delete/${id}`, adminAuth);
    loadTurfs();
  };

  const toggleSlot = slot => {
    setSelectedSlots(prev =>
      prev.includes(slot) ? prev.filter(s => s !== slot) : [...prev, slot]
    );
  };

  const updateSlots = async () => {
    await axios.put(
      `${API_BASE_URL}/api/turfs/${selectedTurf._id}/slots`,
      { slots: selectedSlots },
      adminAuth
    );
    alert("Slots updated");
    loadTurfs();
  };

  return (
    <div className="container-fluid px-3 py-3">
      <h3 className="fw-bold mb-4">Admin Dashboard</h3>

      <div className="row g-3">
        {/* ---------- LEFT PANEL ---------- */}
        <div className="col-lg-4">
          <div className="card shadow-sm mb-3">
            <div className="card-body">
              <h5 className="mb-3">
                {editingTurfId ? "Edit Turf" : "Add Turf"}
              </h5>

              <input className="form-control mb-2" placeholder="Turf Name"
                value={name} onChange={e => setName(e.target.value)} />

              <input type="number" className="form-control mb-2"
                placeholder="Price per hour"
                value={price} onChange={e => setPrice(e.target.value)} />

              <input className="form-control mb-2"
                placeholder="Image URL (optional)"
                value={image} onChange={e => setImage(e.target.value)} />

              <button className="btn btn-success w-100" onClick={addTurf}>
                {editingTurfId ? "Update Turf" : "Add Turf"}
              </button>

              {message && <div className="alert alert-info mt-3 py-1">{message}</div>}
              {position && (
                <small className="text-muted">
                  📍 {position[0].toFixed(4)}, {position[1].toFixed(4)}
                </small>
              )}
            </div>
          </div>

          {/* ---------- SLOT MANAGEMENT ---------- */}
          {selectedTurf && (
            <div className="card shadow-sm">
              <div className="card-body">
                <h6 className="mb-2">Slots – {selectedTurf.name}</h6>

                <div className="row">
                  {predefinedSlots.map(slot => (
                    <div className="col-6" key={slot}>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={selectedSlots.includes(slot)}
                          onChange={() => toggleSlot(slot)}
                        />
                        <label className="form-check-label small">{slot}</label>
                      </div>
                    </div>
                  ))}
                </div>

                <button className="btn btn-primary w-100 mt-3" onClick={updateSlots}>
                  Save Slots
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ---------- MAP PANEL ---------- */}
        <div className="col-lg-8">
          <div className="card shadow-sm">
            <MapContainer center={[17.385, 78.4867]} zoom={13}
              style={{ height: "75vh", borderRadius: "6px" }}>
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LocationPicker setPosition={setPosition} />

              {turfs.map(turf => (
                <Marker
                  key={turf._id}
                  position={[turf.location.coordinates[1], turf.location.coordinates[0]]}
                  icon={blueMarker}
                >
                  <Popup>
                      <div
                        className="text-center"
                        style={{ width: "220px" }}
                      >
                        {/* IMAGE */}
                        <img
                          src={turf.image || "https://via.placeholder.com/300"}
                          alt={turf.name}
                          className="img-fluid rounded mb-2 mx-auto d-block"
                          style={{ height: "120px", objectFit: "cover" }}
                          onError={e => (e.target.src = "https://via.placeholder.com/300")}
                        />

                        {/* DETAILS */}
                        <h6 className="fw-bold mb-1">{turf.name}</h6>

                        <p className="text-muted mb-2">
                          ₹{turf.pricePerHour}/hour
                        </p>

                        <hr className="my-2" />

                        {/* ACTION BUTTONS */}
                        <div className="d-flex justify-content-center gap-2 flex-wrap">
                          <button
                            className="btn btn-sm btn-warning"
                            onClick={() => startEdit(turf)}
                          >
                            Edit
                          </button>

                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => deleteTurf(turf._id)}
                          >
                            Delete
                          </button>

                          <button
                            className="btn btn-sm btn-info"
                            onClick={() => {
                              setSelectedTurf(turf);
                              setSelectedSlots(turf.slots?.map(s => s.time) || []);
                            }}
                          >
                            Slots
                          </button>
                        </div>
                      </div>
                    </Popup>

                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

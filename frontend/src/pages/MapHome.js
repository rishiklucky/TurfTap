import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useEffect, useState } from "react";
import axios from "axios";
import "../utils/fixLeafletIcon";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../services/api";

const DEFAULT_IMAGE =
  "https://via.placeholder.com/300?text=Turf+Image";

export default function MapHome() {
  const [turfs, setTurfs] = useState([]);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!navigator.geolocation) {
      loadDefaultLocation();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async pos => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        setLocation([lat, lng]);
        await loadNearbyTurfs(lat, lng);
        setLoading(false);
      },
      async () => {
        await loadDefaultLocation();
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }, []);

  /* ---------- FETCH TURFS ---------- */
  const loadNearbyTurfs = async (lat, lng) => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/turfs/nearby?lat=${lat}&lng=${lng}`
      );
      setTurfs(res.data);
    } catch (err) {
      console.error("Failed to fetch turfs", err);
    }
  };

  /* ---------- DEFAULT LOCATION ---------- */
  const loadDefaultLocation = async () => {
    const defaultLat = 17.385;
    const defaultLng = 78.4867;

    setLocation([defaultLat, defaultLng]);
    await loadNearbyTurfs(defaultLat, defaultLng);
  };

  /* ---------- LOADING STATE ---------- */
  if (loading) {
    return (
      <div className="container-fluid vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="card shadow-sm p-4 text-center">
          <div className="spinner-border text-primary mb-3" />
          <h5>Fetching your location</h5>
          <p className="text-muted mb-0">
            Please allow location access
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-0">
      <MapContainer
        center={location}
        zoom={14}
        style={{ height: "100vh", width: "100%" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {turfs.map(turf => (
          <Marker
            key={turf._id}
            position={[
              turf.location.coordinates[1],
              turf.location.coordinates[0]
            ]}
          >
            <Popup>
                  <div
                    className="text-center"
                    style={{ width: "200px" }}
                  >
                    {/* IMAGE */}
                    <img
                      src={turf.image || DEFAULT_IMAGE}
                      alt={turf.name}
                      className="img-fluid rounded mb-2 mx-auto d-block"
                      style={{ height: "100px", objectFit: "cover" }}
                      onError={e => (e.target.src = DEFAULT_IMAGE)}
                    />

                    {/* DETAILS */}
                    <h6 className="fw-bold mb-1">{turf.name}</h6>

                    <p className="text-muted mb-2">
                      ₹{turf.pricePerHour}/hour
                    </p>

                    {/* ACTION */}
                    <button
                      className="btn btn-primary btn-sm w-100"
                      onClick={() => navigate(`/book/${turf._id}`)}
                    >
                      Book Now
                    </button>
                  </div>
              </Popup>

          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

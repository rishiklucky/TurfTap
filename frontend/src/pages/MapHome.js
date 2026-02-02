import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import { useEffect, useState } from "react";
import axios from "axios";
import "../utils/fixLeafletIcon";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../services/api";

const DEFAULT_IMAGE =
  "https://via.placeholder.com/300?text=Turf+Image";

const DEFAULT_LOCATION = [17.385, 78.4867]; // Hyderabad

/* ---------- MANUAL MAP CLICK PICKER ---------- */
function LocationPicker({ setManualLocation }) {
  useMapEvents({
    click(e) {
      setManualLocation([e.latlng.lat, e.latlng.lng]);
    }
  });
  return null;
}

export default function MapHome() {
  const [turfs, setTurfs] = useState([]);
  const [location, setLocation] = useState(null);
  const [manualLocation, setManualLocation] = useState(null);
  const [showManual, setShowManual] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  /* ---------- AUTO LOCATION ---------- */
  useEffect(() => {
    const saved = sessionStorage.getItem("user_location");
    if (saved) {
      const loc = JSON.parse(saved);
      setLocation(loc);
      loadNearbyTurfs(loc[0], loc[1]);
      setLoading(false);
      return;
    }

    if (!navigator.geolocation) {
      enableManual();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async pos => {
        const { latitude, longitude, accuracy } = pos.coords;

        // ❗ Poor accuracy → manual fallback
        if (accuracy > 1000) {
          enableManual();
          return;
        }

        setLocation([latitude, longitude]);
        await loadNearbyTurfs(latitude, longitude);
        setLoading(false);
      },
      () => enableManual(),
      {
        enableHighAccuracy: true,
        timeout: 10000
      }
    );
  }, []);

  /* ---------- ENABLE MANUAL ---------- */
  const enableManual = () => {
    setLocation(DEFAULT_LOCATION);
    setShowManual(true);
    setLoading(false);
  };

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

  /* ---------- SEARCH CITY ---------- */
  const searchLocation = async () => {
    if (!searchText) return;

    try {
      const res = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${searchText}`
      );

      if (!res.data.length) {
        alert("Location not found");
        return;
      }

      setManualLocation([
        parseFloat(res.data[0].lat),
        parseFloat(res.data[0].lon)
      ]);
    } catch {
      alert("Search failed");
    }
  };

  /* ---------- SAVE MANUAL LOCATION ---------- */
  const saveManualLocation = async () => {
    if (!manualLocation) return;

    sessionStorage.setItem(
      "user_location",
      JSON.stringify(manualLocation)
    );

    setLocation(manualLocation);
    setShowManual(false);
    await loadNearbyTurfs(manualLocation[0], manualLocation[1]);
  };

  /* ---------- LOADING ---------- */
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
    <>
      {/* ---------- MANUAL LOCATION UI ---------- */}
      {showManual && (
        <div className="container mt-3">
          <div className="alert alert-warning text-center">
            <strong>We couldn’t get your precise location.</strong>
            <br />
            Please select your area to see nearby turfs.
          </div>

          <div className="input-group mb-2">
            <input
              className="form-control"
              placeholder="Search city or area"
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
            />
            <button
              className="btn btn-outline-primary"
              onClick={searchLocation}
            >
              Search
            </button>
          </div>

          <button
            className="btn btn-success w-100 mb-2"
            disabled={!manualLocation}
            onClick={saveManualLocation}
          >
            Use This Location
          </button>
        </div>
      )}

      {/* ---------- MAP ---------- */}
      <div className="container-fluid p-0">
        <MapContainer
          center={manualLocation || location}
          zoom={14}
          style={{ height: "100vh", width: "100%" }}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* MANUAL PIN */}
          {showManual && (
            <>
              <LocationPicker setManualLocation={setManualLocation} />
              {manualLocation && <Marker position={manualLocation} />}
            </>
          )}

          {/* TURFS */}
          {!showManual &&
            turfs.map(turf => (
              <Marker
                key={turf._id}
                position={[
                  turf.location.coordinates[1],
                  turf.location.coordinates[0]
                ]}
              >
                <Popup>
                  <div className="text-center" style={{ width: "200px" }}>
                    <img
                      src={turf.image || DEFAULT_IMAGE}
                      alt={turf.name}
                      className="img-fluid rounded mb-2 mx-auto d-block"
                      style={{ height: "100px", objectFit: "cover" }}
                      onError={e => (e.target.src = DEFAULT_IMAGE)}
                    />

                    <h6 className="fw-bold mb-1">{turf.name}</h6>

                    <p className="text-muted mb-2">
                      ₹{turf.pricePerHour}/hour
                    </p>

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
    </>
  );
}

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  useMap
} from "react-leaflet";
import { useEffect, useState } from "react";
import axios from "axios";
import "../utils/fixLeafletIcon";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../services/api";

const DEFAULT_IMAGE =
  "https://via.placeholder.com/300?text=Turf+Image";

const DEFAULT_LOCATION = [17.385, 78.4867]; // Hyderabad

/* ---------- MAP CLICK PICKER ---------- */
function LocationPicker({ setManualLocation }) {
  useMapEvents({
    click(e) {
      setManualLocation([e.latlng.lat, e.latlng.lng]);
    }
  });
  return null;
}

/* ---------- MAP CONTROLLER ---------- */
function MapController({ center, zoom }) {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.setView(center, zoom, { animate: true });
    }
  }, [center, zoom, map]);

  return null;
}

export default function MapHome() {
  const [turfs, setTurfs] = useState([]);
  const [location, setLocation] = useState(null);
  const [manualLocation, setManualLocation] = useState(null);
  const [showManual, setShowManual] = useState(false);
  const [mapZoom, setMapZoom] = useState(14);
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

    navigator.geolocation?.getCurrentPosition(
      pos => {
        const { latitude, longitude, accuracy } = pos.coords;

        if (accuracy > 1000) {
          enableManual();
          return;
        }

        setLocation([latitude, longitude]);
        loadNearbyTurfs(latitude, longitude);
        setLoading(false);
      },
      () => enableManual(),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  /* ---------- LOAD TURFS ---------- */
  const loadNearbyTurfs = async (lat, lng) => {
    const res = await axios.get(
      `${API_BASE_URL}/api/turfs/nearby?lat=${lat}&lng=${lng}`
    );
    setTurfs(res.data);
  };

  const loadAllTurfs = async () => {
    const res = await axios.get(`${API_BASE_URL}/api/turfs/all`);
    setTurfs(res.data);
  };

  /* ---------- MANUAL MODE ---------- */
  const enableManual = () => {
    setShowManual(true);
    setLocation(DEFAULT_LOCATION);
    setMapZoom(12);
    setLoading(false);
  };

  const saveManualLocation = async () => {
    if (!manualLocation) return;

    sessionStorage.setItem(
      "user_location",
      JSON.stringify(manualLocation)
    );

    setLocation(manualLocation);
    setShowManual(false);
    setMapZoom(15);

    await loadNearbyTurfs(manualLocation[0], manualLocation[1]);
  };

  /* ---------- BUTTON ACTIONS ---------- */
  const changeLocation = () => {
    sessionStorage.removeItem("user_location");
    setShowManual(true);
    setManualLocation(null);
    setMapZoom(12);
  };

  const showAllTurfs = async () => {
    setShowManual(false);
    setMapZoom(11);
    setLocation(DEFAULT_LOCATION);
    await loadAllTurfs();
  };

  /* ---------- SEARCH CITY ---------- */
  const searchLocation = async () => {
    if (!searchText) return;

    const res = await axios.get(
      `https://nominatim.openstreetmap.org/search?format=json&q=${searchText}`
    );

    if (res.data.length) {
      setManualLocation([
        parseFloat(res.data[0].lat),
        parseFloat(res.data[0].lon)
      ]);
    }
  };

  /* ---------- LOADING ---------- */
  if (loading) {
    return (
      <div className="vh-100 d-flex align-items-center justify-content-center">
        <div className="spinner-border text-primary" />
      </div>
    );
  }

  return (
    <div style={{ position: "relative", height: "100vh", width: "100%" }}>
      
      {/* ---------- RIGHT FLOATING CONTROLS ---------- */}
      <div
        className="d-flex flex-column gap-2"
        style={{
          position: "absolute",
          top: "80px",
          right: "12px",
          zIndex: 1200
        }}
      >
        <button
          className="btn btn-light btn-sm shadow"
          onClick={changeLocation}
        >
          📍 Change Location
        </button>

        <button
          className="btn btn-primary btn-sm shadow"
          onClick={showAllTurfs}
        >
          🌍 Show All Turfs
        </button>
      </div>

      {/* ---------- MANUAL LOCATION UI ------------- */}
      {showManual && (
        <div
          className="position-absolute top-0 start-0 w-100 p-3"
          style={{ zIndex: 1200 }}
        >
          <div className="card shadow">
            <div className="card-body text-center">
              <p className="fw-bold mb-2">
                We couldn’t get your precise location
              </p>

              <div className="input-group mb-2">
                <input
                  className="form-control"
                  placeholder="Search city / area"
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
                className="btn btn-success w-100"
                disabled={!manualLocation}
                onClick={saveManualLocation}
              >
                Use This Location
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------- MAP ---------- */}
      <MapContainer
        center={location}
        zoom={mapZoom}
        style={{ height: "100%", width: "100%" }}
      >
        <MapController center={manualLocation || location} zoom={mapZoom} />

        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {showManual && (
          <>
            <LocationPicker setManualLocation={setManualLocation} />
            {manualLocation && <Marker position={manualLocation} />}
          </>
        )}

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
                    className="img-fluid rounded mb-2"
                    style={{ height: "100px", objectFit: "cover" }}
                    alt={turf.name}
                  />
                  <h6 className="fw-bold">{turf.name}</h6>
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
  );
}

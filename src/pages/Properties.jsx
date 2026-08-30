import Navbar from "../components/Navbar";
import "./Properties.css";
import { useEffect, useState } from "react";

const API_URL = (() => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  const host = window.location.hostname;
  if (host === "localhost" || host === "127.0.0.1" || /^192\.168\.\d+\.\d+$/.test(host) || /^10\.\d+\.\d+\.\d+$/.test(host) || /^172\.(1[6-9]|2[0-9]|3[0-1])\.\d+\.\d+$/.test(host)) {
    return `http://${host}:8000`;
  }
  return "https://zenvoraa-backend.onrender.com";
})();

function Properties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [location, setLocation] = useState("");
  const [purpose, setPurpose] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const [selectedProperty, setSelectedProperty] = useState(null);
  const [enquiryMessage, setEnquiryMessage] = useState("");
  const [enquiryLoading, setEnquiryLoading] = useState(false);

  // Authenticity Check
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifySearchQuery, setVerifySearchQuery] = useState("");
  const [verifySearchResult, setVerifySearchResult] = useState(null);
  const [verifySearchLoading, setVerifySearchLoading] = useState(false);

  const [loggedCustomer, setLoggedCustomer] = useState(() => {
    try {
      const saved = localStorage.getItem("loggedCustomer");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Read URL Search Parameters on initial page load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const initialLoc = urlParams.get("location") || "";
    const initialPurp = urlParams.get("purpose") || "";
    const initialMin = urlParams.get("min_price") || "";
    const initialMax = urlParams.get("max_price") || "";
    const initialBeds = urlParams.get("bedrooms") || "";

    if (initialLoc) setLocation(initialLoc);
    if (initialPurp) setPurpose(initialPurp);
    if (initialMin) setMinPrice(initialMin);
    if (initialMax) setMaxPrice(initialMax);
    if (initialBeds) setBedrooms(initialBeds);
  }, []);

  const fetchProperties = async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();

      if (location.trim()) params.append("location", location.trim());
      if (purpose) params.append("purpose", purpose.toLowerCase());
      if (minPrice) params.append("min_price", minPrice);
      if (maxPrice) params.append("max_price", maxPrice);
      if (bedrooms) params.append("bedrooms", bedrooms);
      if (verifiedOnly) params.append("verified_only", "true");

      const query = params.toString();
      const url = `${API_URL}/properties${query ? `?${query}` : ""}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch properties");
      }

      const data = await response.json();
      setProperties(data.properties || []);
    } catch (err) {
      console.error(err);
      setProperties([]);
      setError("⚠️ Unable to load properties. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [verifiedOnly]);

  const resetFilters = () => {
    setLocation("");
    setPurpose("");
    setMinPrice("");
    setMaxPrice("");
    setBedrooms("");
    setVerifiedOnly(false);

    setTimeout(() => {
      fetchProperties();
    }, 0);
  };

  const handleEnquiry = async () => {
    if (!loggedCustomer) {
      alert("Please login before sending an enquiry.");
      localStorage.setItem("openLogin", "true");
      window.location.href = "/";
      return;
    }

    if (!enquiryMessage.trim()) {
      alert("Please enter your enquiry message.");
      return;
    }

    setEnquiryLoading(true);

    try {
      const response = await fetch(`${API_URL}/enquiries`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer_id: loggedCustomer.id,
          property_id: selectedProperty.id,
          message: enquiryMessage,
          customer_location: loggedCustomer.city || loggedCustomer.location || "Online Browser",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to create enquiry");
      }

      alert("📩 Enquiry sent successfully! The admin and owner have been notified.");

      setEnquiryMessage("");
      setSelectedProperty(null);
    } catch (err) {
      console.error("Enquiry error:", err);
      alert(err.message);
    } finally {
      setEnquiryLoading(false);
    }
  };

  const handleCheckAuthenticity = async (e) => {
    e.preventDefault();
    if (!verifySearchQuery.trim()) return;

    setVerifySearchLoading(true);
    setVerifySearchResult(null);

    try {
      const res = await fetch(`${API_URL}/properties/verify-check/${encodeURIComponent(verifySearchQuery.trim())}`);
      const data = await res.json();
      setVerifySearchResult(data);
    } catch (err) {
      console.error("Auth check err:", err);
      setVerifySearchResult({ found: false, message: "Unable to connect to verification server." });
    } finally {
      setVerifySearchLoading(false);
    }
  };

  return (
    <>
      <Navbar
        loggedCustomer={loggedCustomer}
        setLoggedCustomer={setLoggedCustomer}
        setAuthMessage={() => {}}
        setAuthMode={() => {}}
        setShowAuth={() => { localStorage.setItem("openLogin", "true"); window.location.href = "/"; }}
        setShowDashboard={() => { window.location.href = "/"; }}
        fetchMyEnquiries={() => {}}
        fetchMyProperties={() => {}}
        setShowAdminEnquiries={() => { window.location.href = "/"; }}
        fetchAdminEnquiries={() => {}}
      />
      <div className="properties-page">
      <div className="properties-container">

        <div className="properties-header">
          <h1 style={{ fontSize: "38px", marginBottom: "10px", color: "#111827" }}>
            🏠 Explore Properties
          </h1>

          <p style={{ color: "#4b5563", fontSize: "17px" }}>
            Find authentic, 100% verified properties with registered ownership title checks.
          </p>
          
          <div style={{ marginTop: "15px" }}>
            <button
              onClick={() => setShowVerifyModal(true)}
              style={{
                background: "linear-gradient(135deg, #10b981, #059669)",
                color: "white",
                border: "none",
                padding: "10px 20px",
                borderRadius: "8px",
                fontWeight: "bold",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              🔍 Check Property Authenticity Certificate
            </button>
          </div>
        </div>

        <div
          style={{
            background: "linear-gradient(135deg, #111827 0%, #1e293b 55%, #172033 100%)",
            padding: "28px",
            borderRadius: "20px",
            boxShadow: "0 18px 45px rgba(15, 23, 42, 0.22)",
            marginBottom: "45px",
            border: "1px solid rgba(198, 161, 90, 0.25)",
          }}
        >
          <h2 className="search-panel-heading">🔍 Search Properties</h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "12px",
            }}
          >
            <input
              type="text"
              placeholder="📍 Location / City"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              style={inputStyle}
            />

            <select
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              style={inputStyle}
            >
              <option value="">🏷️ Buy / Rent / Sell</option>
              <option value="buy">Buy</option>
              <option value="rent">Rent</option>
              <option value="sell">Sell</option>
            </select>

            <input
              type="number"
              placeholder="₹ Min Price"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              style={inputStyle}
            />

            <input
              type="number"
              placeholder="₹ Max Price"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              style={inputStyle}
            />

            <select
              value={bedrooms}
              onChange={(e) => setBedrooms(e.target.value)}
              style={inputStyle}
            >
              <option value="">🛏️ Bedrooms</option>
              <option value="1">1 Bedroom</option>
              <option value="2">2 Bedrooms</option>
              <option value="3">3 Bedrooms</option>
              <option value="4">4 Bedrooms</option>
              <option value="5">5+ Bedrooms</option>
            </select>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "18px",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "#34d399",
                fontWeight: "bold",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
              />
              ✅ Show Only Verified Properties
            </label>

            <div style={{ display: "flex", gap: "12px" }}>
              <button onClick={fetchProperties} style={searchButton}>
                🔍 Search
              </button>

              <button onClick={resetFilters} style={resetButton}>
                ↻ Reset
              </button>
            </div>
          </div>
        </div>

        <h2 style={{ marginBottom: "20px", color: "#111827" }}>
          🏡 Available Properties ({properties.length})
        </h2>

        {loading && (
          <p style={{ textAlign: "center", fontSize: "18px" }}>
            Loading properties...
          </p>
        )}

        {error && (
          <p style={{ textAlign: "center" }}>
            {error}
          </p>
        )}

        {!loading && !error && properties.length === 0 && (
          <div
            style={{
              textAlign: "center",
              background: "#fff",
              padding: "40px",
              borderRadius: "15px",
            }}
          >
            <h2>🏠 No Properties Found</h2>
            <p>Try changing your search filters or clear verified-only toggle.</p>
          </div>
        )}

        <div className="property-grid">
          {properties.map((property) => (
            <div key={property.id} className="premium-property-card">
              <div style={{ position: "relative" }}>
                {property.image_url && (
                  <img
                    src={property.image_url}
                    alt={property.title}
                    className="premium-property-image"
                    style={{
                      width: "100%",
                      height: "210px",
                      objectFit: "cover",
                      borderRadius: "12px 12px 0 0",
                    }}
                  />
                )}
                {property.is_verified ? (
                  <span
                    style={{
                      position: "absolute",
                      top: "10px",
                      right: "10px",
                      background: "#10b981",
                      color: "white",
                      padding: "4px 10px",
                      borderRadius: "6px",
                      fontWeight: "bold",
                      fontSize: "11px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                    }}
                  >
                    ✅ Verified Title
                  </span>
                ) : (
                  <span
                    style={{
                      position: "absolute",
                      top: "10px",
                      right: "10px",
                      background: "rgba(100, 116, 139, 0.85)",
                      color: "white",
                      padding: "4px 8px",
                      borderRadius: "6px",
                      fontWeight: "bold",
                      fontSize: "11px",
                    }}
                  >
                    ⏳ Unverified
                  </span>
                )}
              </div>

              <div className="property-card-body">
                <span
                  style={{
                    display: "inline-block",
                    padding: "6px 10px",
                    borderRadius: "20px",
                    background:
                      property.purpose === "rent"
                        ? "#fff3cd"
                        : "#e8f5e9",
                    fontSize: "12px",
                    fontWeight: "bold",
                    marginBottom: "10px",
                  }}
                >
                  {property.purpose === "rent"
                    ? "FOR RENT"
                    : "FOR SALE"}
                </span>

                <h2 className="property-card-title" style={{ margin: "5px 0 12px" }}>
                  {property.title}
                </h2>

                <p className="property-location">📍 {property.location} {property.city ? `(${property.city})` : ""}</p>

                <p>
                  🛏️ {property.bedrooms || 0} Beds
                  &nbsp;&nbsp;
                  📐 {property.area || 0} sqft
                </p>

                {property.is_verified && property.owner_legal_name && (
                  <p style={{ fontSize: "12px", color: "#166534", margin: "4px 0" }}>
                    👤 Legal Owner: <strong>{property.owner_legal_name}</strong>
                  </p>
                )}

                <h2 className="property-price" style={{ margin: "15px 0" }}>
                  ₹{Number(property.price || 0).toLocaleString("en-IN")}
                </h2>

                <button
                  onClick={() => setSelectedProperty(property)}
                  style={detailsButton}
                >
                  👁️ View Details & Verify
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* VIEW DETAILS MODAL */}
      {selectedProperty && (
        <div style={overlayStyle} onClick={() => setSelectedProperty(null)}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>

            <button
              onClick={() => setSelectedProperty(null)}
              style={closeButton}
            >
              ✕
            </button>

            {selectedProperty.image_url && (
              <img
                src={selectedProperty.image_url}
                alt={selectedProperty.title}
                style={{
                  width: "100%",
                  height: "250px",
                  objectFit: "cover",
                  borderRadius: "12px",
                }}
              />
            )}
            
            <div style={{ marginTop: "15px" }}>
              {selectedProperty.is_verified ? (
                <span style={{ background: "#10b981", color: "white", padding: "4px 10px", borderRadius: "6px", fontWeight: "bold", fontSize: "12px" }}>
                  ✅ Officially Verified Ownership
                </span>
              ) : (
                <span style={{ background: "#64748b", color: "white", padding: "4px 10px", borderRadius: "6px", fontWeight: "bold", fontSize: "12px" }}>
                  ⏳ Title Verification Pending
                </span>
              )}
            </div>

            <h2>{selectedProperty.title}</h2>

            <p>📍 {selectedProperty.location}</p>

            <p>🛏️ {selectedProperty.bedrooms || 0} Bedrooms &nbsp;|&nbsp; 📐 {selectedProperty.area || 0} sqft</p>

            <h2>
              ₹{Number(selectedProperty.price || 0).toLocaleString("en-IN")}
            </h2>

            <p>
              🏷️ {selectedProperty.purpose === "rent" ? "For Rent" : "For Sale"}
            </p>

            {selectedProperty.is_verified && (
              <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "12px", borderRadius: "8px", margin: "14px 0", color: "#166534" }}>
                <h4 style={{ margin: "0 0 6px" }}>🛡️ Official Legal Verification</h4>
                <p style={{ margin: "2px 0" }}><strong>Registered Legal Owner:</strong> {selectedProperty.owner_legal_name}</p>
                <p style={{ margin: "2px 0" }}><strong>Registry Deed Number:</strong> {selectedProperty.registry_number}</p>
                <p style={{ margin: "2px 0", fontSize: "12px" }}><small>Verified by Zenvoraa Legal Verification Desk.</small></p>
              </div>
            )}

            <hr />

            <h3>📩 Send Direct Enquiry</h3>

            <textarea
              placeholder="Write your enquiry message or request a site visit..."
              value={enquiryMessage}
              onChange={(e) => setEnquiryMessage(e.target.value)}
              style={{
                width: "100%",
                minHeight: "100px",
                padding: "12px",
                boxSizing: "border-box",
                border: "1px solid #ddd",
                borderRadius: "8px",
                resize: "vertical",
              }}
            />

            <button
              onClick={handleEnquiry}
              disabled={enquiryLoading}
              style={{
                ...searchButton,
                width: "100%",
                marginTop: "12px",
              }}
            >
              {enquiryLoading
                ? "Sending..."
                : "📩 Send Instant Enquiry"}
            </button>
          </div>
        </div>
      )}

      {/* AUTHENTICITY CERTIFICATE SEARCH MODAL */}
      {showVerifyModal && (
        <div style={overlayStyle} onClick={() => setShowVerifyModal(false)}>
          <div style={{ ...modalStyle, maxWidth: "600px" }} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowVerifyModal(false)}
              style={closeButton}
            >
              ✕
            </button>

            <h2>🔍 Check Property Authenticity</h2>
            <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "20px" }}>
              Verify if a property exists in official records and who is the registered legal title holder.
            </p>

            <form onSubmit={handleCheckAuthenticity} style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
              <input
                type="text"
                placeholder="Enter Property ID or Registry Deed Number..."
                value={verifySearchQuery}
                onChange={(e) => setVerifySearchQuery(e.target.value)}
                style={{ ...inputStyle, border: "2px solid #10b981" }}
                required
              />
              <button type="submit" style={{ ...searchButton, background: "#10b981", whiteSpace: "nowrap" }} disabled={verifySearchLoading}>
                {verifySearchLoading ? "Searching..." : "Verify"}
              </button>
            </form>

            {verifySearchResult && (
              <div>
                {verifySearchResult.found && verifySearchResult.verification ? (
                  <div style={{ background: "#fcfbf7", border: "2px solid #b08a3e", borderRadius: "12px", padding: "20px" }}>
                    <h3 style={{ margin: "0 0 10px", color: "#1e293b" }}>🏛️ Official Property Title Certificate</h3>
                    <p><strong>Property:</strong> {verifySearchResult.verification.title}</p>
                    <p><strong>Location:</strong> {verifySearchResult.verification.location}</p>
                    <p><strong>Registered Owner:</strong> <span style={{ color: "#166534", fontWeight: "bold" }}>{verifySearchResult.verification.owner_legal_name}</span></p>
                    <p><strong>Registry Ref:</strong> <span style={{ color: "#b45309", fontWeight: "bold" }}>{verifySearchResult.verification.registry_number}</span></p>
                    <p><strong>Status:</strong> <span style={{ color: "#10b981", fontWeight: "bold" }}>{verifySearchResult.verification.certificate_status}</span></p>
                  </div>
                ) : (
                  <div style={{ background: "#fef2f2", border: "1px solid #fecaca", padding: "16px", borderRadius: "8px", color: "#991b1b" }}>
                    <h4>⚠️ Property Record Not Found</h4>
                    <p>{verifySearchResult.message}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
    </>
  );
}

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "12px",
  border: "1px solid #ddd",
  borderRadius: "8px",
  fontSize: "14px",
};

const searchButton = {
  padding: "12px 25px",
  border: "none",
  borderRadius: "8px",
  background: "linear-gradient(135deg, #c6a15a, #a77c32)",
  color: "#fff",
  cursor: "pointer",
  fontWeight: "bold",
};

const resetButton = {
  padding: "12px 25px",
  border: "none",
  borderRadius: "8px",
  background: "#172033",
  color: "#ffffff",
  cursor: "pointer",
  fontWeight: "700",
};

const detailsButton = {
  width: "100%",
  padding: "12px",
  border: "none",
  borderRadius: "8px",
  background: "#111827",
  color: "#fff",
  cursor: "pointer",
  fontWeight: "bold",
};

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.6)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "20px",
  zIndex: 1000,
};

const modalStyle = {
  position: "relative",
  background: "#fff",
  width: "100%",
  maxWidth: "550px",
  maxHeight: "90vh",
  overflowY: "auto",
  borderRadius: "16px",
  padding: "25px",
  boxSizing: "border-box",
};

const closeButton = {
  position: "absolute",
  top: "15px",
  right: "15px",
  border: "1px solid rgba(198, 161, 90, 0.7)",
  background: "#111827",
  color: "#c6a15a",
  borderRadius: "50%",
  width: "42px",
  height: "42px",
  cursor: "pointer",
  fontSize: "22px",
  fontWeight: "700",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 20,
  boxShadow: "0 6px 18px rgba(0,0,0,0.3)",
};

export default Properties;

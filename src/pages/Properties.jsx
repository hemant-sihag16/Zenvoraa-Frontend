import Navbar from "../components/Navbar";
import "./Properties.css";
import { useEffect, useState } from "react";

const API_URL = "https://zenvoraa-backend.onrender.com";

function Properties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [location, setLocation] = useState("");
  const [purpose, setPurpose] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [bedrooms, setBedrooms] = useState("");

  const [selectedProperty, setSelectedProperty] = useState(null);
  const [enquiryMessage, setEnquiryMessage] = useState("");
  const [enquiryLoading, setEnquiryLoading] = useState(false);

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
  }, []);

  const resetFilters = () => {
    setLocation("");
    setPurpose("");
    setMinPrice("");
    setMaxPrice("");
    setBedrooms("");

    setTimeout(() => {
      fetchProperties();
    }, 0);
  };

  const handleEnquiry = async () => {
    const loggedCustomer = JSON.parse(
      localStorage.getItem("loggedCustomer")
    );

    if (!loggedCustomer) {
      alert("Please login before sending an enquiry.");
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
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to create enquiry");
      }

      alert("📩 Enquiry sent successfully!");

      setEnquiryMessage("");
      setSelectedProperty(null);
    } catch (err) {
      console.error("Enquiry error:", err);
      alert(err.message);
    } finally {
      setEnquiryLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="properties-page">
      <div className="properties-container">

        <div className="properties-header">
          <h1 style={{ fontSize: "38px", marginBottom: "10px", color: "#111827" }}>
            🏠 Explore Properties
          </h1>

          <p style={{ color: "#4b5563", fontSize: "17px" }}>
            Find your perfect property with Zenvoraa.
          </p>
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
              placeholder="📍 Location"
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
              gap: "12px",
              marginTop: "15px",
              flexWrap: "wrap",
            }}
          >
            <button onClick={fetchProperties} style={searchButton}>
              🔍 Search
            </button>

            <button onClick={resetFilters} style={resetButton}>
              ↻ Reset
            </button>
          </div>
        </div>

        <h2 style={{ marginBottom: "20px", color: "#111827" }}>
          🏡 Available Properties
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
            <p>Try changing your search filters.</p>
          </div>
        )}

        <div className="property-grid">
          {properties.map((property) => (
            <div key={property.id} className="premium-property-card">

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

                <p className="property-location">📍 {property.location}</p>

                <p>
                  🛏️ {property.bedrooms || 0} Beds
                  &nbsp;&nbsp;
                  📐 {property.area || 0} sqft
                </p>

                <h2 className="property-price" style={{ margin: "15px 0" }}>
                  ₹{Number(property.price || 0).toLocaleString("en-IN")}
                </h2>

                <button
                  onClick={() => setSelectedProperty(property)}
                  style={detailsButton}
                >
                  👁️ View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* VIEW DETAILS MODAL */}
      {selectedProperty && (
        <div style={overlayStyle}>
          <div style={modalStyle}>

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

            <h2>{selectedProperty.title}</h2>

            <p>📍 {selectedProperty.location}</p>

            <p>🛏️ {selectedProperty.bedrooms || 0} Bedrooms</p>

            <p>📐 {selectedProperty.area || 0} sqft</p>

            <h2>
              ₹{Number(selectedProperty.price || 0).toLocaleString("en-IN")}
            </h2>

            <p>
              🏷️{" "}
              {selectedProperty.purpose === "rent"
                ? "For Rent"
                : "For Sale"}
            </p>

            <hr />

            <h3>📩 Send Enquiry</h3>

            <textarea
              placeholder="Write your enquiry..."
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
                : "📩 Send Enquiry"}
            </button>
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

const cardStyle = {
  background: "#fff",
  borderRadius: "12px",
  overflow: "hidden",
  boxShadow: "0 4px 18px rgba(0,0,0,0.08)",
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



























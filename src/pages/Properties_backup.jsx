import { useEffect, useState } from "react";

const API_URL = "https://zenvoraa-backend.onrender.com";

function Properties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/properties`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch properties");
        }
        return response.json();
      })
      .then((data) => {
        setProperties(data.properties || []);
        setError("");
      })
      .catch((err) => {
        console.error(err);
        setError("Unable to load properties.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1>🏠 Properties</h1>
      <p>Explore properties on Zenvoraa.</p>

      {loading && <p>Loading properties...</p>}

      {error && <p>{error}</p>}

      {!loading && !error && properties.length === 0 && (
        <p>No properties available.</p>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "25px",
          marginTop: "30px",
        }}
      >
        {properties.map((property) => (
          <div
            key={property.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: "12px",
              padding: "18px",
              background: "#fff",
            }}
          >
            {property.image_url && (
              <img
                src={property.image_url}
                alt={property.title}
                style={{
                  width: "100%",
                  height: "200px",
                  objectFit: "cover",
                  borderRadius: "10px",
                }}
              />
            )}

            <h2>{property.title}</h2>

            <p>📍 {property.location}</p>

            <p>🛏️ {property.bedrooms || 0} Beds</p>

            <p>📐 {property.area || 0} sqft</p>

            <h3>
              ₹{Number(property.price || 0).toLocaleString("en-IN")}
            </h3>

            <p>
              {property.purpose === "rent"
                ? "FOR RENT"
                : property.purpose === "sell"
                ? "FOR SALE"
                : "FOR SALE"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Properties;

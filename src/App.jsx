import { useEffect, useState } from "react";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL;


function App() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const [location, setLocation] = useState("");
  const [purpose, setPurpose] = useState("Buy");
    const [sellTitle, setSellTitle] = useState("");
  const [sellLocation, setSellLocation] = useState("");
  const [sellPrice, setSellPrice] = useState("");
  const [sellBedrooms, setSellBedrooms] = useState("");
  const [sellArea, setSellArea] = useState("");
  const [sellImageUrl, setSellImageUrl] = useState("");
  const [sellPurpose, setSellPurpose] = useState("");
  const [minPrice, setMinPrice] = useState("");
const [maxPrice, setMaxPrice] = useState("");
const [bedrooms, setBedrooms] = useState("");
const [minArea, setMinArea] = useState("");
const [sellImage, setSellImage] = useState(null);
const [imageUploading, setImageUploading] = useState(false);

  // Selected property for details
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [customerId, setCustomerId] = useState("");
const [enquiryMessage, setEnquiryMessage] = useState("");
const [enquiryLoading, setEnquiryLoading] = useState(false);
const [enquirySuccess, setEnquirySuccess] = useState("");
// Login / Register
const [showAuth, setShowAuth] = useState(false);
const [authMode, setAuthMode] = useState("login");
const [showDashboard, setShowDashboard] = useState(false);
const [showSellProperty, setShowSellProperty] = useState(false);
const [showAdminEnquiries, setShowAdminEnquiries] = useState(false);
const [adminEnquiries, setAdminEnquiries] = useState([]);
const [adminEnquiriesLoading, setAdminEnquiriesLoading] = useState(false);
const [showEnquiries, setShowEnquiries] = useState(false);
const [enquiriesLoading, setEnquiriesLoading] = useState(false);
const [myEnquiries, setMyEnquiries] = useState([]);
const [myProperties, setMyProperties] = useState([]);
const [editingProperty, setEditingProperty] = useState(null);
const [editTitle, setEditTitle] = useState("");
const [editLocation, setEditLocation] = useState("");
const [editPrice, setEditPrice] = useState("");
const [editBedrooms, setEditBedrooms] = useState("");
const [editArea, setEditArea] = useState("");
const [editImageUrl, setEditImageUrl] = useState("");

const [customerName, setCustomerName] = useState("");
const [customerEmail, setCustomerEmail] = useState("");
const [customerPhone, setCustomerPhone] = useState("");
const [customerPassword, setCustomerPassword] = useState("");

const [authLoading, setAuthLoading] = useState(false);
const [authMessage, setAuthMessage] = useState("");

const [loggedCustomer, setLoggedCustomer] = useState(null);

const [dashboardLoading, setDashboardLoading] = useState(false);
const [serverError, setServerError] = useState("");

// Auto logout after 15 minutes of inactivity
useEffect(() => {
  if (!loggedCustomer) return;

  let inactivityTimer;

  const resetInactivityTimer = () => {
    clearTimeout(inactivityTimer);

    inactivityTimer = setTimeout(() => {
      setLoggedCustomer(null);
      setShowDashboard(false);
      setShowEnquiries(false);

      alert("⏰ You have been logged out due to inactivity.");
    }, 15 * 60 * 1000);
  };

  const activityEvents = [
    "mousemove",
    "mousedown",
    "keydown",
    "scroll",
    "touchstart",
  ];

  activityEvents.forEach((event) => {
    window.addEventListener(event, resetInactivityTimer);
  });

  resetInactivityTimer();

  return () => {
    clearTimeout(inactivityTimer);

    activityEvents.forEach((event) => {
      window.removeEventListener(event, resetInactivityTimer);
    });
  };
}, [loggedCustomer]);

 const fetchProperties = async (
  searchLocation = "",
  searchPurpose = "Buy",
  searchMinPrice = "",
  searchMaxPrice = "",
  searchBedrooms = "",
  searchMinArea = ""
) => {
    setLoading(true);

    try {
     let url = `${API_URL}/properties`;

      const params = new URLSearchParams();
      if (searchMinPrice) {
  params.append("min_price", searchMinPrice);
}

if (searchMaxPrice) {
  params.append("max_price", searchMaxPrice);
}

if (searchBedrooms) {
  params.append("bedrooms", searchBedrooms);
}

if (searchMinArea) {
  params.append("min_area", searchMinArea);
}

      if (searchLocation.trim()) {
        params.append("location", searchLocation.trim());
      }

      if (searchPurpose) {
        params.append("purpose", searchPurpose.toLowerCase());
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

   const response = await fetch(url);

if (!response.ok) {
  throw new Error("Failed to fetch properties");
}

const data = await response.json();

setProperties(data.properties || []);
setServerError("");

} catch (error) {
  console.error("Error fetching properties:", error);
  setProperties([]);
  setServerError(
    "⚠️ Server temporarily unavailable. Please try again."
  );
} finally {
  setLoading(false);
}
};
  
  useEffect(() => {
  fetchProperties("", "Buy");
}, []);


 const handleSearch = () => {
  fetchProperties(
    location,
    purpose,
    minPrice,
    maxPrice,
    bedrooms,
    minArea
  );
};

const handleSellProperty = async (e) => {
  e.preventDefault();

  if (Number(sellPrice) <= 0) {
    alert("Please enter a valid property price.");
    return;
  }

  if (Number(sellBedrooms) <= 0) {
    alert("Please enter valid number of bedrooms.");
    return;
  }

  if (Number(sellArea) <= 0) {
    alert("Please enter a valid property area.");
    return;
  }

  if (!sellTitle.trim()) {
    alert("Please enter property title.");
    return;
  }

  if (!sellLocation.trim()) {
    alert("Please enter property location.");
    return;
  }

  try {
    // ==============================
    // 1. Upload image to Cloudinary
    // ==============================

    let uploadedImageUrl = "";

    if (sellImage) {
      setImageUploading(true);

      const imageFormData = new FormData();
      imageFormData.append("file", sellImage);

      const uploadResponse = await fetch(
        `${API_URL}/properties/upload-image`,
        {
          method: "POST",
          body: imageFormData,
        }
      );

      const uploadData = await uploadResponse.json();

      if (!uploadResponse.ok || !uploadData.success) {
        alert("Image upload failed.");
        return;
      }

      uploadedImageUrl = uploadData.image_url;

      console.log("Cloudinary Image URL:", uploadedImageUrl);
    }

    // ==============================
    // 2. Create property
    // ==============================

    const response = await fetch(
      `${API_URL}/properties`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: sellTitle,
          location: sellLocation,
          price: Number(sellPrice),
          bedrooms: Number(sellBedrooms),
          area: Number(sellArea),
          purpose: sellPurpose,
          image_url: uploadedImageUrl,
          customer_id: loggedCustomer.id,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.detail || "Failed to create property"
      );
    }

    alert("🏠 Property listed successfully!");

    // Reset form
    setSellTitle("");
    setSellLocation("");
    setSellPrice("");
    setSellBedrooms("");
    setSellArea("");
    setSellPurpose("");
    setSellImage(null);

    setShowSellProperty(false);

    // Refresh properties
    fetchProperties();

  } catch (error) {
    console.error("Sell property error:", error);
    alert(error.message);
  } finally {
    setImageUploading(false);
  }
};
  const handleEnquiry = async () => {
  if (!loggedCustomer || !enquiryMessage.trim()) {
    alert("Please login before sending an enquiry.");
    return;
  }

  setEnquiryLoading(true);
  setEnquirySuccess("");

  try {
    const response = await fetch(
     `${API_URL}/enquiries`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer_id: loggedCustomer.id,
          property_id: selectedProperty.id,
          message: enquiryMessage,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Failed to create enquiry");
    }

    setEnquirySuccess("Enquiry sent successfully! ✅");
   
    setEnquiryMessage("");
  } catch (error) {
    console.error("Enquiry error:", error);
    alert(error.message);
  } finally {
    setEnquiryLoading(false);
  }
};

const fetchMyEnquiries = async () => {
  if (!loggedCustomer) return;

  console.log("CUSTOMER ID:", loggedCustomer.id);

  setEnquiriesLoading(true);

  try {
    const url =
      `${API_URL}/enquiries/customer/${loggedCustomer.id}`;

    console.log("URL:", url);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Failed to fetch enquiries");
    }

    const data = await response.json();

    console.log("API COUNT:", data.count);
    console.log("API ENQUIRIES:", data.enquiries);

    setMyEnquiries(data.enquiries || []);

  } catch (error) {
    console.error("My enquiries error:", error);
  } finally {
    setEnquiriesLoading(false);
  }
};
const fetchMyProperties = async () => {
  if (!loggedCustomer) return;

  try {
    const response = await fetch(
     `${API_URL}/properties/customer/${loggedCustomer.id}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch my properties");
    }

    const data = await response.json();

    setMyProperties(data.properties || []);
  } catch (error) {
    console.error("Error fetching my properties:", error);
    setMyProperties([]);
  }
};
const fetchAdminEnquiries = async () => {
  setAdminEnquiriesLoading(true);

  try {
    const response = await fetch(
     `${API_URL}/enquiries`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch enquiries");
    }

    const data = await response.json();

    console.log("ADMIN ENQUIRIES:", data);

    setAdminEnquiries(data.enquiries || []);

  } catch (error) {
    console.error("Admin enquiries error:", error);
  } finally {
    setAdminEnquiriesLoading(false);
  }
};
const updateProperty = async () => {
  if (!editingProperty) return;

  try {
    const response = await fetch(
     `${API_URL}/properties/${editingProperty.id}?customer_id=${loggedCustomer.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: editTitle,
          location: editLocation,
          price: Number(editPrice),
          bedrooms: Number(editBedrooms),
          area: Number(editArea),
          purpose: editingProperty.purpose,
          image_url: editImageUrl,
          customer_id: loggedCustomer.id,
        }),
      }
    );

  if (!response.ok) {
  const errorText = await response.text();
  console.error("UPDATE API ERROR:", errorText);
  alert("❌ Update failed: " + errorText);
  return;
}

    alert("✅ Property updated successfully!");

    setEditingProperty(null);

    fetchMyProperties();
    fetchProperties("", "Buy");

  } catch (error) {
    console.error("Update property error:", error);
    alert("❌ Failed to update property");
  }
};
const deleteProperty = async (propertyId) => {
  if (!loggedCustomer) return;

  const confirmDelete = window.confirm(
    "Are you sure you want to delete this property?"
  );

  if (!confirmDelete) return;

  try {
    const response = await fetch(
     `${API_URL}/properties/${propertyId}?customer_id=${loggedCustomer.id}`,
      {
        method: "DELETE",
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Failed to delete property");
    }

    alert("🗑️ Property deleted successfully!");

    fetchMyProperties();
    fetchProperties("", "Buy");

  } catch (error) {
    console.error("Delete property error:", error);
    alert("❌ " + error.message);
  }
};
const updateEnquiryStatus = async (enquiryId, status) => {
  try {
    const response = await fetch(
      `${API_URL}/enquiries/${enquiryId}/status?status=${status}`,
      {
        method: "PUT",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.detail || "Failed to update status"
      );
    }

    alert("Enquiry status updated successfully!");

    fetchAdminEnquiries();
    fetchMyEnquiries();

  } catch (error) {
    console.error("Update status error:", error);
    alert(error.message);
  }
};
  
// =========================
// CUSTOMER REGISTER / LOGIN
// =========================

const handleAuth = async () => {
  setAuthLoading(true);
  setAuthMessage("");

  try {

    // REGISTER
    if (authMode === "register") {

      if (
        !customerName.trim() ||
        !customerEmail.trim() ||
        !customerPhone.trim() ||
        !customerPassword.trim()
      ) {
        setAuthMessage("Please fill all fields.");
        setAuthLoading(false);
        return;
      }

      const response = await fetch(
        `${API_URL}/customers`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: customerName,
            email: customerEmail,
            phone: customerPhone,
            password: customerPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Registration failed"
        );
      }

      setLoggedCustomer(data.customer);
      setAuthMessage("Registration successful! ✅");

      setCustomerName("");
      setCustomerEmail("");
      setCustomerPhone("");
      setCustomerPassword("");

    }

    // LOGIN
    else {

      if (
        !customerEmail.trim() ||
        !customerPassword.trim()
      ) {
        setAuthMessage(
          "Please enter email and password."
        );
        setAuthLoading(false);
        return;
      }

      const response = await fetch(
       `${API_URL}/customers/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: customerEmail,
            password: customerPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Login failed"
        );
      }

      setLoggedCustomer(data.customer);
      setShowAuth(false);
      setAuthMessage("Login successful! ✅");

      setCustomerEmail("");
      setCustomerPassword("");
    }

  } catch (error) {

    console.error("Auth error:", error);

    setAuthMessage(
      error.message || "Something went wrong."
    );

  } finally {

    setAuthLoading(false);

  }
};
  return (
     <div className="app">

      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">
          Zen<span>vora</span>
        </div>

        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#properties">Properties</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </div>

    {loggedCustomer ? (
  <>
    <button
      className="login-btn"
      onClick={() => {
        setShowDashboard(true);
        fetchMyEnquiries();
        fetchMyProperties();
      }}
    >
      👤 Dashboard
    </button>

    <button
      className="login-btn"
      onClick={() => {
        setShowAdminEnquiries(true);
        fetchAdminEnquiries();
      }}
    >
      🛠️ Admin Enquiries
    </button>

    <button
      className="login-btn"
      onClick={() => {
        setLoggedCustomer(null);
        setAuthMessage("");
        setAuthMode("login");
      }}
    >
      Logout
    </button>
  </>
) : (
  <button
    className="login-btn"
    onClick={() => {
      setAuthMode("login");
      setAuthMessage("");
      setShowAuth(true);
    }}
  >
    Login
  </button>
)}
      </nav>


      {/* Hero Section */}
      <section className="hero-section" id="home">
        <div className="hero-content">

          <p className="hero-small">
            SMART REAL ESTATE PLATFORM
          </p>

          <h1>
            Find Your
            <span> Dream Property</span>
          </h1>

          <p className="hero-text">
            Discover the perfect home, apartment or property with Zenvoraa.
          </p>


          {/* Search */}
          <div className="search-box">

            <input
              type="text"
              placeholder="Search by location..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
            />
            <input
  type="number"
  placeholder="Min Price"
  value={minPrice}
  onChange={(e) => setMinPrice(e.target.value)}
/>

<input
  type="number"
  placeholder="Max Price"
  value={maxPrice}
  onChange={(e) => setMaxPrice(e.target.value)}
/>
<input
  type="number"
  placeholder="Bedrooms"
  min="1"
  value={bedrooms}
  onChange={(e) => setBedrooms(e.target.value)}
/>
<input
  type="number"
  placeholder="Min Area (sqft)"
  min="0"
  value={minArea}
  onChange={(e) => setMinArea(e.target.value)}
/>

            <select
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
            >
              <option value="Buy">Buy</option>
              <option value="Rent">Rent</option>
              <option value="Sell">Sell</option>
            </select>

            <button onClick={handleSearch}>
              Search
            </button>

          </div>

        </div>
      <div className="sell-property-cta">

  <h2>🏠 Want to Buy, Rent or Sell a Property?</h2>

  <button
    onClick={() => setShowSellProperty(true)}
  >
    🏠 List Your Property
  </button>

</div>
      </section>


      {/* Properties */}
      <section
        className="properties-section"
        id="properties"
      >
🏠 Want to Buy, Rent or Sell a Property?
        <div className="section-heading">

          <p>EXPLORE</p>

          <h2>
            {location
              ? `Properties in ${location}`
              : "Featured Properties"}
          </h2>

        </div>


        {loading ? (

          <p className="loading">
            Finding properties...
          </p>

      ) : serverError ? (

  <div className="server-error">
    {serverError}
  </div>

) : serverError ? (
  <div className="server-error">
    {serverError}
  </div>

) : properties.length === 0 ? (

  <p className="loading">
    No properties found.
  </p>

) : (

  <div className="property-grid">
            {properties.map((property) => (

              <div
                className="property-card"
                key={property.id}
              >

     <div className="property-image">
  {property.image_url ? (
    <img
      src={property.image_url}
      alt={property.title}
      className="property-card-image"
    />
  ) : (
    <div className="property-image-placeholder">
      🏠
      <span>Property Image</span>
    </div>
  )}
</div>


                <div className="property-info">

                 <span className="property-tag">
  {property.purpose === "rent" ? "FOR RENT" : "FOR SALE"}
</span>


                  <h3>
                    {property.title}
                  </h3>


                  <p className="location">
                    📍 {property.location}
                  </p>


                  <div className="property-details">

                    <span>
                      🛏 {property.bedrooms} Beds
                    </span>

                    <span>
                      📐 {property.area} sqft
                    </span>

                  </div>


                  <div className="property-bottom">

                    <strong>
                      ₹{Number(property.price).toLocaleString("en-IN")}
                    </strong>

                    <button
                      onClick={() => setSelectedProperty(property)}
                    >
                      View Details
                    </button>

                  </div>

                </div>

              </div>

            ))}

          </div>

        )}

      </section>


      {/* Property Details Modal */}
      {selectedProperty && (

        <div
          className="modal-overlay"
          onClick={() => setSelectedProperty(null)}
        >

          <div
            className="property-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <button
              className="modal-close"
              onClick={() => setSelectedProperty(null)}
            >
              ×
            </button>

           <div className="modal-image">
  {selectedProperty.image_url ? (
    <img
      src={selectedProperty.image_url}
      alt={selectedProperty.title}
      className="modal-property-image"
    />
  ) : (
    <div className="modal-image-placeholder">
      🏠
      <span>Property Image</span>
    </div>
  )}
</div>

            <div className="modal-content">

              <span className="property-tag">
  {selectedProperty.purpose === "rent" ? "FOR RENT" : "FOR SALE"}
</span>
              <h2>
                {selectedProperty.title}
              </h2>

              <p className="modal-location">
                📍 {selectedProperty.location}
              </p>

              <div className="modal-price">
                ₹{Number(selectedProperty.price).toLocaleString("en-IN")}
              </div>

              <div className="modal-details">

  <div className="detail-item">
    <span>🛏</span>
    <strong>{selectedProperty.bedrooms}</strong>
    <small>Bedrooms</small>
  </div>

  <div className="detail-item">
    <span>📐</span>
    <strong>{selectedProperty.area}</strong>
    <small>Sqft Area</small>
  </div>

  {selectedProperty.bathrooms !== undefined && (
    <div className="detail-item">
      <span>🚿</span>
      <strong>{selectedProperty.bathrooms}</strong>
      <small>Bathrooms</small>
    </div>
  )}

  {selectedProperty.floors !== undefined && (
    <div className="detail-item">
      <span>🏢</span>
      <strong>{selectedProperty.floors}</strong>
      <small>Floors</small>
    </div>
  )}

</div>
<div className="property-description">
  <h3>🏠 Property Overview</h3>

  <p>
    {selectedProperty.description ||
      "A beautiful property with modern facilities and a convenient location."}
  </p>
</div>

<textarea
  placeholder="Write your enquiry..."
  value={enquiryMessage}
  onChange={(e) => setEnquiryMessage(e.target.value)}
  className="enquiry-input"
  rows="4"
/>

<button
  className="enquiry-btn"
  onClick={handleEnquiry}
  disabled={enquiryLoading}
>
  {enquiryLoading ? "Sending..." : "📩 Send Enquiry"}
</button>

{enquirySuccess && (
  <p className="enquiry-success">
    {enquirySuccess}
  </p>
)}

            </div>

          </div>

        </div>

      )}
    

{/* Login / Register Modal */}
{showAuth && (
  <div
    className="modal-overlay"
    onClick={() => setShowAuth(false)}
  >
    <div
      className="auth-modal"
      onClick={(e) => e.stopPropagation()}
    >

      <button
        className="modal-close"
        onClick={() => setShowAuth(false)}
      >
        ×
      </button>

      <h2>
        {authMode === "login"
          ? "Welcome Back"
          : "Create Account"}
      </h2>

      <p>
        {authMode === "login"
          ? "Login to your Zenvoraa account"
          : "Register to find your dream property"}
      </p>

      {authMode === "register" && (
        <>
          <input
            type="text"
            placeholder="Full Name"
            value={customerName}
            onChange={(e) =>
              setCustomerName(e.target.value)
            }
            className="enquiry-input"
          />

          <input
            type="text"
            placeholder="Phone Number"
            value={customerPhone}
            onChange={(e) =>
              setCustomerPhone(e.target.value)
            }
            className="enquiry-input"
          />
        </>
      )}

      <input
        type="email"
        placeholder="Email Address"
        value={customerEmail}
        onChange={(e) =>
          setCustomerEmail(e.target.value)
        }
        className="enquiry-input"
      />

      <input
        type="password"
        placeholder="Password"
        value={customerPassword}
        onChange={(e) =>
          setCustomerPassword(e.target.value)
        }
        className="enquiry-input"
      />

      <button
        className="enquiry-btn"
        onClick={handleAuth}
        disabled={authLoading}
      >
        {authLoading
          ? "Please wait..."
          : authMode === "login"
          ? "🔐 Login"
          : "📝 Register"}
      </button>

      {authMessage && (
        <p className="enquiry-success">
          {authMessage}
        </p>
      )}

      <p style={{ marginTop: "15px" }}>
        {authMode === "login"
          ? "Don't have an account?"
          : "Already have an account?"}

        <button
          type="button"
          onClick={() => {
            setAuthMode(
              authMode === "login"
                ? "register"
                : "login"
            );
            setAuthMessage("");
          }}
           style={{
    border: "none",
    background: "none",
    marginLeft: "6px",
    cursor: "pointer",
    fontWeight: "bold",
    color: "#8baaf0"
  }}
>
        
          {authMode === "login"
            ? "Register"
            : "Login"}
        </button>
      </p>

    </div>
  </div>
)}
{/* Customer Dashboard */}
{showDashboard && loggedCustomer && (
  <div
    className="modal-overlay"
    onClick={() => setShowDashboard(false)}
  >
    <div
      className="auth-modal"
      onClick={(e) => e.stopPropagation()}
    >

      <button
        className="modal-close"
        onClick={() => setShowDashboard(false)}
      >
        ×
      </button>

     <h2>👤 My Dashboard</h2>

<p className="dashboard-welcome">
  Welcome, <strong>{loggedCustomer.name}</strong> 👋
</p>

<div className="dashboard-profile">

  <div className="profile-title">
    👤 Profile Information
  </div>

  <p>
    <strong>Name:</strong>{" "}
    {loggedCustomer.name}
  </p>

  <p>
    <strong>Email:</strong>{" "}
    {loggedCustomer.email}
  </p>

  <p>
    <strong>Phone:</strong>{" "}
    {loggedCustomer.phone}
  </p>

</div>

<div className="dashboard-stats">

  <div className="dashboard-stat">
    <div className="stat-icon">📩</div>
    <div>
      <h3>{myEnquiries.length}</h3>
      <p>Total Enquiries</p>
    </div>
  </div>

  <div className="dashboard-stat">
    <div className="stat-icon">🟡</div>
    <div>
      <h3>
        {
          myEnquiries.filter(
            (e) =>
              e.status?.toLowerCase() === "pending"
          ).length
        }
      </h3>
      <p>Pending</p>
    </div>
  </div>

  <div className="dashboard-stat">
    <div className="stat-icon">✅</div>
    <div>
      <h3>
        {
          myEnquiries.filter(
            (e) =>
              e.status?.toLowerCase() === "contacted"
          ).length
        }
      </h3>
      <p>Contacted</p>
    </div>
  </div>

</div>
<h3 className="dashboard-enquiries-title">
  🏠 My Properties
</h3>

{myProperties.length === 0 ? (
  <div className="dashboard-empty">
    <p>🏠 No properties listed yet.</p>
  </div>
) : (
  <div className="dashboard-enquiries">

    {myProperties.map((property) => (
      <div
        className="dashboard-enquiry"
        key={property.id}
      >

        <div className="dashboard-enquiry-header">

          <strong>
            🏠 {property.title}
          </strong>

          <span
            className={`status-badge ${
              property.status?.toLowerCase() || "available"
            }`}
          >
            {property.status || "Available"}
          </span>
          <div className="property-status-actions">
  <button
    type="button"
    onClick={() => updatePropertyStatus(property.id, "available")}
  >
    🟢 Available
  </button>

  <button
    type="button"
    onClick={() => updatePropertyStatus(property.id, "rented")}
  >
    🟠 Rented
  </button>

  <button
    type="button"
    onClick={() => updatePropertyStatus(property.id, "sold")}
  >
    🔴 Sold
  </button>
</div>

        </div>

        <p className="dashboard-property-info">
          📍 {property.location}
        </p>

        <p className="dashboard-property-price">
          💰 ₹{Number(property.price).toLocaleString("en-IN")}
        </p>

        <p>
          🛏 {property.bedrooms} Beds
          &nbsp;&nbsp;
          📐 {property.area} sqft
        </p>
       <button
  className="login-btn"
  onClick={() => {
  setEditingProperty(property);

  setEditTitle(property.title || "");
  setEditLocation(property.location || "");
  setEditPrice(property.price || "");
  setEditBedrooms(property.bedrooms || "");
  setEditArea(property.area || "");
  setEditImageUrl(property.image_url || "");
}}


>
  ✏️ Edit Property
</button>
<button
  className="login-btn"
  onClick={() => deleteProperty(property.id)}
>
  🗑️ Delete Property
</button>
{editingProperty && (
  <div className="dashboard-edit-form">

    <h3>✏️ Edit Property</h3>

    <input
      type="text"
      placeholder="Property Title"
      value={editTitle}
      onChange={(e) => setEditTitle(e.target.value)}
    />

    <input
      type="text"
      placeholder="Location"
      value={editLocation}
      onChange={(e) => setEditLocation(e.target.value)}
    />

    <input
      type="number"
      placeholder="Price"
      value={editPrice}
      onChange={(e) => setEditPrice(e.target.value)}
    />

    <input
      type="number"
      placeholder="Bedrooms"
      value={editBedrooms}
      onChange={(e) => setEditBedrooms(e.target.value)}
    />

    <input
      type="number"
      placeholder="Area (sqft)"
      value={editArea}
      onChange={(e) => setEditArea(e.target.value)}
    />

    <input
      type="text"
      placeholder="Image URL"
      value={editImageUrl}
      onChange={(e) => setEditImageUrl(e.target.value)}
    />

    <div>
     <button
  className="login-btn"
  onClick={updateProperty}
>
  💾 Save Changes
</button>

      <button
        className="login-btn"
        onClick={() => setEditingProperty(null)}
      >
        ❌ Cancel
      </button>
    </div>

  </div>
)}


      </div>
    ))}

  </div>
)} 

<h3 className="dashboard-enquiries-title">
  📩 My Enquiries
</h3>

{dashboardLoading ? (
  <p>Loading enquiries...</p>
) : myEnquiries.length === 0 ? (
  <div className="dashboard-empty">
    <p>📭 No enquiries found.</p>
  </div>
) : (
  <div className="dashboard-enquiries">

    {myEnquiries.map((enquiry) => (
      <div
        className="dashboard-enquiry"
        key={enquiry.id}
      >

        <div className="dashboard-enquiry-header">

          <div className="dashboard-enquiry-header">

  <strong>
    🏠 {enquiry.property_title || `Property #${enquiry.property_id}`}
  </strong>

  <span
    className={`status-badge ${
      enquiry.status?.toLowerCase() || "pending"
    }`}
  >
    
  </span>

</div>

<p className="dashboard-property-info">
  📍 {enquiry.property_location}
</p>

<p className="dashboard-property-price">
  💰 ₹{Number(enquiry.property_price).toLocaleString("en-IN")}
</p>

          <span
            className={`status-badge ${
              enquiry.status?.toLowerCase() || "pending"
            }`}
          >
            {enquiry.status || "Pending"}
          </span>

        </div>

        <div className="dashboard-message">
          <strong>💬 Message</strong>
          <p>{enquiry.message}</p>
        </div>

        <div className="dashboard-date">
          📅{" "}
          {new Date(
            enquiry.created_at
          ).toLocaleDateString("en-IN")}
        </div>

      </div>
       ))}
  </div>
)}

    </div>
  </div>
)}
{/* Admin Enquiries Modal */}
{showAdminEnquiries && (
  <div
    className="modal-overlay"
    onClick={() => setShowAdminEnquiries(false)}
  >
    <div
      className="auth-modal admin-enquiries-modal"
      onClick={(e) => e.stopPropagation()}
    >

      <button
        className="modal-close"
        onClick={() => setShowAdminEnquiries(false)}
      >
        ×
      </button>

      <h2>🛠️ Admin Enquiries</h2>
      <div className="admin-stats">

  <div className="admin-stat">
    <span>📩</span>
    <div>
      <strong>{adminEnquiries.length}</strong>
      <small>Total</small>
    </div>
  </div>

  <div className="admin-stat">
    <span>🟡</span>
    <div>
      <strong>
        {adminEnquiries.filter(
          (e) => e.status?.toLowerCase() === "pending"
        ).length}
      </strong>
      <small>Pending</small>
    </div>
  </div>

  <div className="admin-stat">
    <span>🔵</span>
    <div>
      <strong>
        {adminEnquiries.filter(
          (e) => e.status?.toLowerCase() === "contacted"
        ).length}
      </strong>
      <small>Contacted</small>
    </div>
  </div>

  <div className="admin-stat">
    <span>🟢</span>
    <div>
      <strong>
        {adminEnquiries.filter(
          (e) => e.status?.toLowerCase() === "closed"
        ).length}
      </strong>
      <small>Closed</small>
    </div>
  </div>

</div>

      <p className="enquiries-welcome">
        Manage all customer enquiries
      </p>

      {adminEnquiriesLoading ? (
        <p>Loading enquiries...</p>
      ) : adminEnquiries.length === 0 ? (
        <div className="no-enquiries">
          <p>📭 No enquiries found.</p>
        </div>
      ) : (
        <div className="enquiries-grid">

          {adminEnquiries.map((enquiry) => (
            <div
              className="enquiry-card"
              key={enquiry.id}
            >

              <div className="enquiry-top">

                <strong>
                  🏠 {enquiry.property_title || "Property"}
                </strong>

                <span
                  className={`status-badge ${
                    enquiry.status?.toLowerCase() || "pending"
                  }`}
                >
                  {enquiry.status || "Pending"}
                </span>
                <select
  value={enquiry.status || "Pending"}
  onChange={(e) => {
    setAdminEnquiries((prev) =>
      prev.map((item) =>
        item.id === enquiry.id
          ? { ...item, status: e.target.value }
          : item
      )
    );
  }}
>
  <option value="Pending">Pending</option>
  <option value="Contacted">Contacted</option>
  <option value="Closed">Closed</option>
</select>

<button
  className="update-status-btn"
  onClick={() =>
    updateEnquiryStatus(
      enquiry.id,
      enquiry.status || "Pending"
    )
  }
>
  Update Status
</button>

              </div>

              <p className="dashboard-property-info">
                📍 {enquiry.property_location}
              </p>

              <p className="dashboard-property-price">
                💰 ₹{Number(
                  enquiry.property_price
                ).toLocaleString("en-IN")}
              </p>

              <p>
                👤 Customer #{enquiry.customer_id}
              </p>

              <div className="enquiry-message">
                <strong>💬 Message</strong>
                <p>{enquiry.message}</p>
              </div>

              <div className="enquiry-date">
                📅{" "}
                {new Date(
                  enquiry.created_at
                ).toLocaleDateString("en-IN")}
              </div>

            </div>
          ))}

        </div>
      )}

    </div>
  </div>
)}
{/* Sell Property Modal */}
{showSellProperty && (
  <div
    className="modal-overlay"
    onClick={() => setShowSellProperty(false)}
  >
    <div
      className="auth-modal sell-property-modal"
      onClick={(e) => e.stopPropagation()}
    >

      <button
        className="modal-close"
        onClick={() => setShowSellProperty(false)}
      >
        ×
      </button>

     <h2>🏠 Want to Buy, Rent or Sell a Property?</h2>

      <p className="enquiries-welcome">
        Enter your property details
      </p>

      <form onSubmit={handleSellProperty}>

        <input
          type="text"
          placeholder="Property Title"
          value={sellTitle}
          onChange={(e) => setSellTitle(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Location"
          value={sellLocation}
          onChange={(e) => setSellLocation(e.target.value)}
          required
        />

        <input
          type="number"
          placeholder="Price"
          value={sellPrice}
          onChange={(e) => setSellPrice(e.target.value)}
          required
        />

        <input
          type="number"
          placeholder="Bedrooms"
          min="1"
          value={sellBedrooms}
          onChange={(e) => setSellBedrooms(e.target.value)}
          required
        />

        <input
          type="number"
          placeholder="Area (sqft)"
          min="0"
          value={sellArea}
          onChange={(e) => setSellArea(e.target.value)}
          required
        />
        <select
  value={sellPurpose}
  onChange={(e) => setSellPurpose(e.target.value)}
  required
>
  <option value="">Select Purpose</option>
  <option value="buy">Buy</option>
  <option value="rent">Rent</option>
  <option value="sell">Sell</option>
</select>
<label className="sell-image-label">
  🖼️ Property Image
</label>

<input
  type="file"
  accept="image/*"
  onChange={(e) => setSellImage(e.target.files[0])}
/>

{sellImage && (
  <div className="sell-image-preview">
    <img
      src={URL.createObjectURL(sellImage)}
      alt="Property Preview"
      className="sell-preview-image"
    />

    <p>Image Preview</p>
  </div>
)} 
        <button
  type="submit"
  className="login-submit"
  disabled={imageUploading}
>
  {imageUploading ? "Uploading Image..." : "🏠 List Property"}
</button>

      </form>

    </div>
  </div>
)}
      {/* About */}
      <section
        className="about-section"
        id="about"
      >

        <p>WHY ZENVORAA</p>

        <h2>
          Real Estate Made Simple
        </h2>

        <p>
          Zenvoraa connects customers with properties through
          a smart and easy-to-use real estate platform.
        </p>


        <div className="features">

          <div>
            <h3>
              🏠 Find Properties
            </h3>

            <p>
              Explore properties according to your needs.
            </p>
          </div>


          <div>
            <h3>
              🔍 Smart Search
            </h3>

            <p>
              Search properties by location and requirements.
            </p>
          </div>


          <div>
            <h3>
              📩 Easy Enquiry
            </h3>

            <p>
              Send enquiries directly for interested properties.
            </p>
          </div>

        </div>

      </section>


      {/* Footer */}
      ```jsx
<footer id="contact">

  <div className="footer-logo">
    Zen<span>vora</span>
  </div>

  <p>
    Smart Real Estate Platform
  </p>

  <div className="footer-contact">
    <h3>Contact Us</h3>

    <p>
      📧 <a href="mailto:zenvoraa.support@gmail.com">
        zenvoraa.support@gmail.com
      </a>
    </p>

    <p>
      📞 Contact Zenvoraa for property-related enquiries
    </p>
  </div>

  <p className="copyright">
    © 2026 Zenvoraa. All rights reserved.
  </p>

</footer>
```


    </div>
  );
}

export default App;
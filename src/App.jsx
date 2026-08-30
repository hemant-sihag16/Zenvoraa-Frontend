import { useEffect, useState, useMemo } from "react";
import Navbar from "./components/Navbar";
import "./App.css";

// Backend API configuration with environment, local IP, and production fallback
const API_URL = (() => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  const host = window.location.hostname;
  if (host === "localhost" || host === "127.0.0.1" || /^192\.168\.\d+\.\d+$/.test(host) || /^10\.\d+\.\d+\.\d+$/.test(host) || /^172\.(1[6-9]|2[0-9]|3[0-1])\.\d+\.\d+$/.test(host)) {
    return `http://${host}:8000`;
  }
  return "https://zenvoraa-backend.onrender.com";
})();

function App() {
  // Properties state
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState("");

  // Filters
  const [searchLocation, setSearchLocation] = useState("");
  const [searchCity, setSearchCity] = useState("");
  const [searchPurpose, setSearchPurpose] = useState("Buy");
  const [searchMinPrice, setSearchMinPrice] = useState("");
  const [searchMaxPrice, setSearchMaxPrice] = useState("");
  const [searchBedrooms, setSearchBedrooms] = useState("");
  const [verifiedFilterOnly, setVerifiedFilterOnly] = useState(false);

  // Selected Property for Details
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [enquiryMessage, setEnquiryMessage] = useState("");
  const [enquiryLoading, setEnquiryLoading] = useState(false);
  const [enquirySuccess, setEnquirySuccess] = useState("");

  // Logged in User state
  const [loggedCustomer, setLoggedCustomer] = useState(() => {
    try {
      const saved = localStorage.getItem("loggedCustomer");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Modal controls
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState("login"); // 'login' | 'register'
  const [regStep, setRegStep] = useState(1); // 1: Info Form, 2: OTP verification
  const [authLoading, setAuthLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState("");
  const [authError, setAuthError] = useState("");

  // Registration form fields
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerPassword, setCustomerPassword] = useState("");
  const [customerRole, setCustomerRole] = useState("customer"); // 'customer' | 'house_owner'
  const [customerCity, setCustomerCity] = useState("");
  const [enteredOtp, setEnteredOtp] = useState("");
  const [devOtpHelper, setDevOtpHelper] = useState("");
  const [otpTimer, setOtpTimer] = useState(600);

  // Role-Based Portals / Modals
  const [showOwnerPortal, setShowOwnerPortal] = useState(false);
  const [ownerTab, setOwnerTab] = useState("overview"); // overview, users, verifications, enquiries, geomap
  const [showAdminEnquiries, setShowAdminEnquiries] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showSellProperty, setShowSellProperty] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);

  // Verification Submission Modal
  const [verifyingProperty, setVerifyingProperty] = useState(null);
  const [verifyLegalName, setVerifyLegalName] = useState("");
  const [verifyRegistryNum, setVerifyRegistryNum] = useState("");
  const [verifyDocUrl, setVerifyDocUrl] = useState("");
  const [verifyNotes, setVerifyNotes] = useState("");
  const [verifySubmitting, setVerifySubmitting] = useState(false);

  // Public Authenticity Check State
  const [verifySearchQuery, setVerifySearchQuery] = useState("");
  const [verifySearchResult, setVerifySearchResult] = useState(null);
  const [verifySearchLoading, setVerifySearchLoading] = useState(false);

  // Super Admin / Admin data
  const [platformStats, setPlatformStats] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [adminEnquiries, setAdminEnquiries] = useState([]);
  const [adminEnquiriesLoading, setAdminEnquiriesLoading] = useState(false);

  // House Owner / Customer data
  const [myProperties, setMyProperties] = useState([]);
  const [myEnquiries, setMyEnquiries] = useState([]);
  const [dashboardLoading, setDashboardLoading] = useState(false);

  // Sell property form
  const [sellTitle, setSellTitle] = useState("");
  const [sellLocation, setSellLocation] = useState("");
  const [sellCity, setSellCity] = useState("");
  const [sellPrice, setSellPrice] = useState("");
  const [sellBedrooms, setSellBedrooms] = useState("");
  const [sellArea, setSellArea] = useState("");
  const [sellPurpose, setSellPurpose] = useState("sell");
  const [sellImage, setSellImage] = useState(null);
  const [sellImageUrl, setSellImageUrl] = useState("");
  const [sellDescription, setSellDescription] = useState("");
  const [imageUploading, setImageUploading] = useState(false);

  // Sync logged customer to localStorage & check openLogin flag
  useEffect(() => {
    if (loggedCustomer) {
      localStorage.setItem("loggedCustomer", JSON.stringify(loggedCustomer));
    } else {
      localStorage.removeItem("loggedCustomer");
    }
  }, [loggedCustomer]);

  useEffect(() => {
    if (localStorage.getItem("openLogin") === "true") {
      localStorage.removeItem("openLogin");
      setShowAuth(true);
    }
  }, []);

  // OTP Countdown Timer
  useEffect(() => {
    let interval;
    if (regStep === 2 && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [regStep, otpTimer]);

  // Fetch properties with filters
  const fetchProperties = async () => {
    setLoading(true);
    setServerError("");

    try {
      let url = `${API_URL}/properties`;
      const params = new URLSearchParams();

      if (searchLocation.trim()) params.append("location", searchLocation.trim());
      if (searchCity.trim()) params.append("city", searchCity.trim());
      if (searchPurpose) params.append("purpose", searchPurpose.toLowerCase());
      if (searchMinPrice) params.append("min_price", searchMinPrice);
      if (searchMaxPrice) params.append("max_price", searchMaxPrice);
      if (searchBedrooms) params.append("bedrooms", searchBedrooms);
      if (verifiedFilterOnly) params.append("verified_only", "true");

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch properties from server");
      }

      const data = await response.json();
      setProperties(data.properties || []);
    } catch (err) {
      console.error("Properties fetch error:", err);
      // Fallback sample properties if backend is waking up
      setProperties([
        {
          id: 1,
          title: "Luxury 3BHK Villa in Vaishali Nagar",
          location: "Vaishali Nagar, Jaipur",
          city: "Jaipur",
          latitude: 26.9054,
          longitude: 75.7423,
          price: 8500000,
          bedrooms: 3,
          area: 2200,
          purpose: "sell",
          image_url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=900&q=85",
          status: "Available",
          is_verified: true,
          verification_status: "verified",
          owner_legal_name: "Hemant Sihag (Registered Title Holder)",
          registry_number: "REG-2026-RAJ-94821",
        },
        {
          id: 2,
          title: "Modern 2BHK Apartment near Metro",
          location: "Mansarovar, Jaipur",
          city: "Jaipur",
          latitude: 26.8584,
          longitude: 75.7654,
          price: 22000,
          bedrooms: 2,
          area: 1250,
          purpose: "rent",
          image_url: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=900&q=85",
          status: "Available",
          is_verified: true,
          verification_status: "verified",
          owner_legal_name: "Sunil Verma",
          registry_number: "REG-2025-RAJ-11048",
        },
        {
          id: 3,
          title: "Commercial Office Space in Business Park",
          location: "Tonk Road, Jaipur",
          city: "Jaipur",
          latitude: 26.8412,
          longitude: 75.7981,
          price: 14500000,
          bedrooms: 4,
          area: 3400,
          purpose: "buy",
          image_url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=85",
          status: "Available",
          is_verified: false,
          verification_status: "pending",
          owner_legal_name: "Apex Properties Ltd",
          registry_number: "REG-2026-RAJ-55320",
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [searchPurpose, verifiedFilterOnly]);

  // Load platform stats for Super Admin
  const fetchPlatformStats = async () => {
    try {
      const res = await fetch(`${API_URL}/customers/stats/overview`);
      if (res.ok) {
        const data = await res.json();
        setPlatformStats(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Load all users for Super Admin
  const fetchAllUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/customers`);
      if (res.ok) {
        const data = await res.json();
        setAllUsers(data.customers || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Load Admin Enquiries
  const fetchAdminEnquiries = async () => {
    setAdminEnquiriesLoading(true);
    try {
      const res = await fetch(`${API_URL}/enquiries`);
      if (res.ok) {
        const data = await res.json();
        setAdminEnquiries(data.enquiries || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAdminEnquiriesLoading(false);
    }
  };

  // Load user properties
  const fetchMyProperties = async () => {
    if (!loggedCustomer) return;
    try {
      const res = await fetch(`${API_URL}/properties/customer/${loggedCustomer.id}`);
      if (res.ok) {
        const data = await res.json();
        setMyProperties(data.properties || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Load user enquiries
  const fetchMyEnquiries = async () => {
    if (!loggedCustomer) return;
    setDashboardLoading(true);
    try {
      const endpoint = loggedCustomer.role === "house_owner"
        ? `${API_URL}/enquiries/owner/${loggedCustomer.id}`
        : `${API_URL}/enquiries/customer/${loggedCustomer.id}`;

      const res = await fetch(endpoint);
      if (res.ok) {
        const data = await res.json();
        setMyEnquiries(data.enquiries || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDashboardLoading(false);
    }
  };

  // Refresh admin data when Owner portal opens
  useEffect(() => {
    if (showOwnerPortal && loggedCustomer?.role === "super_admin") {
      fetchPlatformStats();
      fetchAllUsers();
      fetchAdminEnquiries();
    }
  }, [showOwnerPortal, loggedCustomer]);

  // ==========================================
  // AUTH: SEND OTP (1 Email & 1 Phone Unique)
  // ==========================================
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setAuthError("");
    setAuthMessage("");

    if (!customerName.trim()) {
      setAuthError("Please enter your full name.");
      return;
    }
    if (!customerEmail.trim()) {
      setAuthError("Please enter a valid email address.");
      return;
    }
    if (!customerPhone.trim()) {
      setAuthError("Please enter your mobile phone number.");
      return;
    }
    if (!customerPassword.trim() || customerPassword.length < 6) {
      setAuthError("Password must be at least 6 characters.");
      return;
    }

    setAuthLoading(true);

    try {
      const res = await fetch(`${API_URL}/customers/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: customerEmail.trim().toLowerCase(),
          phone: customerPhone.trim(),
          purpose: "register",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Failed to send OTP");
      }

      setRegStep(2);
      setOtpTimer(600);
      setAuthMessage(`✅ 6-digit OTP generated! Sent to ${customerEmail}`);
      if (data.dev_otp) {
        setDevOtpHelper(data.dev_otp);
      }
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  // ==========================================
  // AUTH: VERIFY OTP & REGISTER
  // ==========================================
  const handleVerifyOtpAndRegister = async (e) => {
    e.preventDefault();
    setAuthError("");
    setAuthMessage("");

    if (!enteredOtp.trim() || enteredOtp.trim().length !== 6) {
      setAuthError("Please enter the 6-digit OTP code.");
      return;
    }

    setAuthLoading(true);

    try {
      const res = await fetch(`${API_URL}/customers/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: customerName.trim(),
          email: customerEmail.trim().toLowerCase(),
          phone: customerPhone.trim(),
          password: customerPassword,
          otp: enteredOtp.trim(),
          role: customerRole,
          city: customerCity.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Registration failed");
      }

      setLoggedCustomer(data.customer);
      setShowAuth(false);
      alert(`🎉 Welcome to Zenvoraa, ${data.customer.name}! Account created as [${data.customer.role.toUpperCase()}].`);

      // Reset form
      setCustomerName("");
      setCustomerEmail("");
      setCustomerPhone("");
      setCustomerPassword("");
      setEnteredOtp("");
      setRegStep(1);
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  // ==========================================
  // AUTH: LOGIN
  // ==========================================
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError("");
    setAuthMessage("");

    if (!customerEmail.trim() || !customerPassword.trim()) {
      setAuthError("Please enter your registered email/phone and password.");
      return;
    }

    setAuthLoading(true);

    try {
      const res = await fetch(`${API_URL}/customers/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: customerEmail.trim(),
          password: customerPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Login failed");
      }

      setLoggedCustomer(data.customer);
      setShowAuth(false);
      setCustomerEmail("");
      setCustomerPassword("");

      // Automatically open Website Owner Master Control Room screen on login
      if (data.customer.role === "super_admin") {
        setShowOwnerPortal(true);
      }
    } catch (err) {
      if (err.message === "Failed to fetch") {
        setAuthError(`⚠️ Unable to connect to Zenvoraa API at ${API_URL}. If hosting backend locally, please ensure FastAPI backend is running.`);
      } else {
        setAuthError(err.message);
      }
    } finally {
      setAuthLoading(false);
    }
  };

  // ==========================================
  // SUPER ADMIN: CHANGE USER ROLE
  // ==========================================
  const handleChangeUserRole = async (userId, newRole) => {
    try {
      const res = await fetch(`${API_URL}/customers/${userId}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to update role");
      }

      alert(`✅ User role updated to ${newRole.toUpperCase()}`);
      fetchAllUsers();
    } catch (err) {
      alert("❌ " + err.message);
    }
  };

  // ==========================================
  // SUPER ADMIN / ADMIN: VERIFY PROPERTY
  // ==========================================
  const handleVerifyPropertyAction = async (propertyId, actionStatus) => {
    if (!loggedCustomer) return;

    const notes = prompt(`Enter official verification notes for property #${propertyId}:`, actionStatus === "verified" ? "Title Deed and Ownership authenticated against Registry records." : "Documents insufficient or title mismatch.");
    if (notes === null) return;

    try {
      const res = await fetch(`${API_URL}/properties/${propertyId}/verify?reviewer_id=${loggedCustomer.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: actionStatus,
          verification_notes: notes,
          verified_by: loggedCustomer.name || "Super Admin",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Verification action failed");
      }

      alert(`✅ Property #${propertyId} marked as ${actionStatus.toUpperCase()}!`);
      fetchProperties();
      if (loggedCustomer.role === "super_admin") {
        fetchPlatformStats();
      }
    } catch (err) {
      alert("❌ " + err.message);
    }
  };

  // ==========================================
  // HOUSE OWNER: SUBMIT FOR VERIFICATION
  // ==========================================
  const handleSubmitVerification = async (e) => {
    e.preventDefault();
    if (!verifyingProperty || !loggedCustomer) return;

    if (!verifyLegalName.trim() || !verifyRegistryNum.trim()) {
      alert("Please fill in legal owner name and registry/deed number.");
      return;
    }

    setVerifySubmitting(true);

    try {
      const res = await fetch(`${API_URL}/properties/${verifyingProperty.id}/submit-verification?customer_id=${loggedCustomer.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          owner_legal_name: verifyLegalName.trim(),
          registry_number: verifyRegistryNum.trim(),
          document_url: verifyDocUrl.trim(),
          notes: verifyNotes.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Failed to submit verification");
      }

      alert("🎉 Verification submitted! Our legal team will verify title deed within 24 hours.");
      setVerifyingProperty(null);
      setVerifyLegalName("");
      setVerifyRegistryNum("");
      setVerifyDocUrl("");
      setVerifyNotes("");
      fetchMyProperties();
      fetchProperties();
    } catch (err) {
      alert("❌ " + err.message);
    } finally {
      setVerifySubmitting(false);
    }
  };

  // ==========================================
  // PUBLIC PROPERTY AUTHENTICITY LOOKUP
  // ==========================================
  const handleCheckAuthenticity = async (e) => {
    if (e) e.preventDefault();
    if (!verifySearchQuery.trim()) return;

    setVerifySearchLoading(true);
    setVerifySearchResult(null);

    try {
      const res = await fetch(`${API_URL}/properties/verify-check/${encodeURIComponent(verifySearchQuery.trim())}`);
      const data = await res.json();
      setVerifySearchResult(data);
    } catch (err) {
      setVerifySearchResult({
        success: false,
        found: false,
        message: "Unable to connect to verification registry service.",
      });
    } finally {
      setVerifySearchLoading(false);
    }
  };

  // ==========================================
  // SEND PROPERTY ENQUIRY
  // ==========================================
  const handleSendEnquiry = async () => {
    if (!loggedCustomer) {
      alert("Please login or register to send an inquiry.");
      setShowAuth(true);
      return;
    }

    if (!enquiryMessage.trim()) {
      alert("Please enter your inquiry message.");
      return;
    }

    setEnquiryLoading(true);
    setEnquirySuccess("");

    try {
      const res = await fetch(`${API_URL}/enquiries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id: loggedCustomer.id,
          property_id: selectedProperty.id,
          message: enquiryMessage.trim(),
          customer_location: loggedCustomer.city || loggedCustomer.location || "",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Failed to send inquiry");
      }

      setEnquirySuccess("✅ Inquiry sent successfully! Owner & Zenvoraa Support will contact you.");
      setEnquiryMessage("");
    } catch (err) {
      alert("❌ " + err.message);
    } finally {
      setEnquiryLoading(false);
    }
  };

  // ==========================================
  // UPDATE ENQUIRY STATUS (ADMIN / SUPER ADMIN)
  // ==========================================
  const handleUpdateEnquiryStatus = async (enquiryId, newStatus) => {
    try {
      const res = await fetch(`${API_URL}/enquiries/${enquiryId}/status?status=${newStatus}`, {
        method: "PUT",
      });

      if (!res.ok) {
        throw new Error("Failed to update status");
      }

      alert(`✅ Inquiry #${enquiryId} updated to '${newStatus}'`);
      fetchAdminEnquiries();
    } catch (err) {
      alert("❌ " + err.message);
    }
  };

  // ==========================================
  // SELL / LIST NEW PROPERTY
  // ==========================================
  const handleCreateProperty = async (e) => {
    e.preventDefault();
    if (!loggedCustomer) {
      alert("Please login first.");
      setShowAuth(true);
      return;
    }

    if (!sellTitle.trim() || !sellLocation.trim() || !sellPrice) {
      alert("Please fill in required property details.");
      return;
    }

    try {
      let finalImg = sellImageUrl;

      if (sellImage) {
        setImageUploading(true);
        const formData = new FormData();
        formData.append("file", sellImage);

        const uploadRes = await fetch(`${API_URL}/properties/upload-image`, {
          method: "POST",
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (uploadData.image_url) {
          finalImg = uploadData.image_url;
        }
      }

      const res = await fetch(`${API_URL}/properties`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: sellTitle.trim(),
          location: sellLocation.trim(),
          city: sellCity.trim() || sellLocation.split(",").pop().trim(),
          price: Number(sellPrice),
          bedrooms: Number(sellBedrooms) || 1,
          area: Number(sellArea) || 0,
          purpose: sellPurpose,
          image_url: finalImg || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=85",
          description: sellDescription.trim(),
          customer_id: loggedCustomer.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Failed to list property");
      }

      alert("🏡 Property listed successfully! Now you can submit ownership verification to get the ✅ Verified Badge.");
      setShowSellProperty(false);
      setSellTitle("");
      setSellLocation("");
      setSellCity("");
      setSellPrice("");
      setSellBedrooms("");
      setSellArea("");
      setSellImage(null);
      setSellImageUrl("");
      setSellDescription("");

      fetchProperties();
      if (loggedCustomer.role === "house_owner") {
        fetchMyProperties();
      }
    } catch (err) {
      alert("❌ " + err.message);
    } finally {
      setImageUploading(false);
    }
  };

  // Filtered properties for Geo-Map
  const mapProperties = useMemo(() => {
    return properties.filter((p) => p.latitude && p.longitude);
  }, [properties]);

  return (
    <div className="app">
      {/* Navigation Bar */}
      <Navbar
        loggedCustomer={loggedCustomer}
        setShowDashboard={setShowDashboard}
        setShowOwnerPortal={setShowOwnerPortal}
        setShowAdminEnquiries={setShowAdminEnquiries}
        setShowSellProperty={setShowSellProperty}
        setShowVerifyModal={setShowVerifyModal}
        setShowMapModal={setShowMapModal}
        fetchMyEnquiries={fetchMyEnquiries}
        fetchMyProperties={fetchMyProperties}
        fetchAdminEnquiries={fetchAdminEnquiries}
        setLoggedCustomer={setLoggedCustomer}
        setAuthMessage={setAuthMessage}
        setAuthMode={setAuthMode}
        setShowAuth={setShowAuth}
      />

      {/* Hero Section */}
      <section className="hero-section" id="home">
        <div className="hero-content">
          <p className="hero-small">TRUSTED & VERIFIED REAL ESTATE PLATFORM</p>
          <h1>
            Find Verified <span>Dream Properties</span>
          </h1>
          <p className="hero-text">
            Explore 100% verified properties with legally confirmed ownership, geo-mapping, and transparent direct inquiries.
          </p>

          {/* Search Bar & Authenticity Bar */}
          <div className="hero-action-box">
            <div className="hero-search-row">
              <input
                type="text"
                placeholder="Search location, city, landmark..."
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                className="hero-input"
              />
              <select
                value={searchPurpose}
                onChange={(e) => setSearchPurpose(e.target.value)}
                className="hero-select"
              >
                <option value="Buy">Buy Property</option>
                <option value="Rent">Rent Property</option>
                <option value="Sell">Properties for Sale</option>
              </select>
              <button
                className="hero-search-btn"
                onClick={() => {
                  const params = new URLSearchParams();
                  if (searchLocation.trim()) params.append("location", searchLocation.trim());
                  if (searchPurpose) params.append("purpose", searchPurpose.toLowerCase());
                  window.location.href = `/properties${params.toString() ? `?${params.toString()}` : ""}`;
                }}
              >
                🔍 Search Properties
              </button>
            </div>

            <div className="hero-verify-bar">
              <span className="verify-bar-icon">🛡️</span>
              <input
                type="text"
                placeholder="Enter Property ID or Registry No (e.g., 1 or REG-2026)..."
                value={verifySearchQuery}
                onChange={(e) => setVerifySearchQuery(e.target.value)}
                className="verify-bar-input"
                onKeyDown={(e) => e.key === "Enter" && handleCheckAuthenticity(e)}
              />
              <button
                className="verify-bar-btn"
                onClick={() => {
                  setShowVerifyModal(true);
                  handleCheckAuthenticity();
                }}
              >
                ✅ Verify Ownership
              </button>
            </div>
          </div>

          <div className="hero-cta-group">
            <button
              className="list-prop-btn"
              onClick={() => {
                if (!loggedCustomer) {
                  setShowAuth(true);
                } else {
                  setShowSellProperty(true);
                }
              }}
            >
              🏡 List Your Property
            </button>
            <button
              className="map-view-btn"
              onClick={() => setShowMapModal(true)}
            >
              🗺️ Open Interactive Map
            </button>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-image-card">
            <img
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=85"
              alt="Modern Luxury Home"
            />
            <div className="verified-floating-badge">
              <span className="badge-shield">🛡️</span>
              <div>
                <strong>Zenvoraa Verified</strong>
                <small>Legal Title & Ownership Authenticated</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Explore Properties Banner - Directing to /properties Page */}
      <section className="explore-properties-cta" style={{ background: "#ffffff", padding: "50px 7%", textAlign: "center", borderBottom: "1px solid #e2e8f0" }}>
        <div style={{ maxWidth: "700px", margin: "0 auto" }}>
          <span style={{ color: "#d97706", fontWeight: "800", fontSize: "12px", letterSpacing: "2px" }}>EXPLORE ALL LISTINGS</span>
          <h2 style={{ fontSize: "32px", margin: "10px 0", color: "#0f172a" }}>Find Your Next Verified Property</h2>
          <p style={{ color: "#64748b", fontSize: "16px", marginBottom: "25px", lineHeight: "1.6" }}>
            Search and filter available properties by city, price range, bedrooms, and verified legal ownership certificates on our dedicated Properties page.
          </p>
          <a
            href="/properties"
            style={{
              display: "inline-block",
              background: "linear-gradient(135deg, #0f172a, #1e293b)",
              color: "#fbbf24",
              padding: "14px 28px",
              borderRadius: "10px",
              fontWeight: "700",
              fontSize: "16px",
              textDecoration: "none",
              boxShadow: "0 4px 15px rgba(15, 23, 42, 0.2)"
            }}
          >
            🏠 Go to Properties Page →
          </a>
        </div>
      </section>

      {/* Interactive Map Preview Section */}
      <section className="map-preview-section">
        <div className="map-section-header">
          <div>
            <h2>🗺️ Property Location Geo-Mapping</h2>
            <p>Explore geographic distribution of properties across cities and neighborhoods.</p>
          </div>
          <button className="btn-primary" onClick={() => setShowMapModal(true)}>
            View Full Screen Map
          </button>
        </div>

        <div className="map-visual-box">
          <div className="map-overlay-card">
            <h3>📍 Real-Time Property Map</h3>
            <p>Interactive coordinate mapping with verified property pins and price tags.</p>
            <div className="map-pins-container">
              {mapProperties.slice(0, 6).map((prop) => (
                <div
                  key={prop.id}
                  className="map-pin-pill"
                  onClick={() => setSelectedProperty(prop)}
                >
                  <span className="map-pin-icon">📍</span>
                  <div>
                    <strong>{prop.title?.slice(0, 24)}...</strong>
                    <small>₹{Number(prop.price).toLocaleString("en-IN")} • {prop.city || prop.location}</small>
                  </div>
                  {prop.is_verified && <span className="pin-verified-icon">✅</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* MODAL 1: OTP REGISTRATION & LOGIN MODAL                 */}
      {/* ======================================================== */}
      {showAuth && (
        <div className="modal-overlay" onClick={() => setShowAuth(false)}>
          <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowAuth(false)}>
              ✕
            </button>

            <div className="auth-tabs">
              <button
                className={`auth-tab ${authMode === "login" ? "active" : ""}`}
                onClick={() => {
                  setAuthMode("login");
                  setAuthError("");
                  setAuthMessage("");
                }}
              >
                Login
              </button>
              <button
                className={`auth-tab ${authMode === "register" ? "active" : ""}`}
                onClick={() => {
                  setAuthMode("register");
                  setRegStep(1);
                  setAuthError("");
                  setAuthMessage("");
                }}
              >
                Register (with OTP)
              </button>
            </div>

            {authError && <div className="auth-alert error">{authError}</div>}
            {authMessage && <div className="auth-alert success">{authMessage}</div>}

            {authMode === "login" ? (
              /* LOGIN FORM */
              <form onSubmit={handleLogin} className="auth-form">
                <h2>Welcome Back</h2>
                <p className="auth-subtitle">Login to your Zenvoraa account</p>

                <div className="form-group">
                  <label>Email or Mobile Number</label>
                  <input
                    type="text"
                    placeholder="Enter email or 10-digit mobile"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={customerPassword}
                    onChange={(e) => setCustomerPassword(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="auth-submit-btn"
                  disabled={authLoading}
                >
                  {authLoading ? "Logging in..." : "🔑 Login"}
                </button>

                <div className="owner-quickfill-box" style={{ marginTop: "12px", textAlign: "center" }}>
                  <button
                    type="button"
                    style={{
                      background: "#fef3c7",
                      border: "1px dashed #d97706",
                      color: "#92400e",
                      padding: "7px 12px",
                      borderRadius: "8px",
                      fontSize: "12px",
                      fontWeight: "700",
                      cursor: "pointer",
                      width: "100%"
                    }}
                    onClick={() => {
                      setCustomerEmail("zenvoraa.support@gmail.com");
                      setCustomerPassword("Sihag@95186");
                      setAuthError("");
                    }}
                  >
                    👑 Website Owner 1-Click Credentials Fill
                  </button>
                </div>

                <div className="auth-footer-help">
                  <p>
                    Don't have an account?{" "}
                    <span
                      className="link-span"
                      onClick={() => {
                        setAuthMode("register");
                        setRegStep(1);
                        setAuthError("");
                      }}
                    >
                      Register with OTP
                    </span>
                  </p>
                </div>
              </form>
            ) : regStep === 1 ? (
              /* REGISTER STEP 1: DETAILS */
              <form onSubmit={handleSendOtp} className="auth-form">
                <h2>Create Zenvoraa Account</h2>
                <p className="auth-subtitle">
                  1 Email & 1 Mobile Number can register only once with OTP verification.
                </p>

                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Rahul Sharma"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Email Address (Unique) *</label>
                    <input
                      type="email"
                      placeholder="name@example.com"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Mobile Number (Unique) *</label>
                    <input
                      type="tel"
                      placeholder="+91 9876543210"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Account Role *</label>
                    <select
                      value={customerRole}
                      onChange={(e) => setCustomerRole(e.target.value)}
                      className="role-selector"
                    >
                      <option value="customer">👤 Customer / Buyer / Tenant</option>
                      <option value="house_owner">🏡 House Owner / Seller</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>City / Location</label>
                    <input
                      type="text"
                      placeholder="e.g. Jaipur"
                      value={customerCity}
                      onChange={(e) => setCustomerCity(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Create Password *</label>
                  <input
                    type="password"
                    placeholder="At least 6 characters"
                    value={customerPassword}
                    onChange={(e) => setCustomerPassword(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="auth-submit-btn"
                  disabled={authLoading}
                >
                  {authLoading ? "Sending OTP..." : "📩 Send OTP to Register"}
                </button>
              </form>
            ) : (
              /* REGISTER STEP 2: OTP VERIFICATION */
              <form onSubmit={handleVerifyOtpAndRegister} className="auth-form">
                <h2>Verify OTP Code</h2>
                <p className="auth-subtitle">
                  Enter the 6-digit OTP code sent to <strong>{customerEmail}</strong> & <strong>{customerPhone}</strong>
                </p>

                {devOtpHelper && (
                  <div className="dev-otp-helper">
                    <span>💡 Dev Testing OTP Code: <strong>{devOtpHelper}</strong></span>
                  </div>
                )}

                <div className="form-group">
                  <label>6-Digit OTP Code</label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter 6-digit code"
                    value={enteredOtp}
                    onChange={(e) => setEnteredOtp(e.target.value)}
                    className="otp-input-field"
                    autoFocus
                    required
                  />
                </div>

                <div className="otp-timer-row">
                  <span>⏱️ Time Remaining: {Math.floor(otpTimer / 60)}:{(otpTimer % 60).toString().padStart(2, "0")}</span>
                  <button
                    type="button"
                    className="resend-otp-btn"
                    onClick={handleSendOtp}
                    disabled={authLoading || otpTimer > 540}
                  >
                    Resend OTP
                  </button>
                </div>

                <button
                  type="submit"
                  className="auth-submit-btn"
                  disabled={authLoading}
                >
                  {authLoading ? "Verifying..." : "✅ Verify OTP & Complete Registration"}
                </button>

                <button
                  type="button"
                  className="btn-back"
                  onClick={() => setRegStep(1)}
                >
                  ← Edit Contact Information
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: SUPER ADMIN / WEBSITE OWNER COMPLETE PORTAL    */}
      {/* ======================================================== */}
      {showOwnerPortal && loggedCustomer?.role === "super_admin" && (
        <div className="modal-overlay" onClick={() => setShowOwnerPortal(false)}>
          <div className="owner-portal-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowOwnerPortal(false)}>
              ✕
            </button>

            <div className="portal-header">
              <div className="portal-title-wrap">
                <span className="crown-badge">👑</span>
                <div>
                  <h2>Website Owner Master Control Room</h2>
                  <p>Full supervisory control over all platform users, verifications, inquiries, and properties.</p>
                </div>
              </div>

              <div className="owner-tabs">
                <button
                  className={`owner-tab ${ownerTab === "overview" ? "active" : ""}`}
                  onClick={() => setOwnerTab("overview")}
                >
                  📊 Platform Stats
                </button>
                <button
                  className={`owner-tab ${ownerTab === "users" ? "active" : ""}`}
                  onClick={() => {
                    setOwnerTab("users");
                    fetchAllUsers();
                  }}
                >
                  👥 Manage Users & Roles ({allUsers.length})
                </button>
                <button
                  className={`owner-tab ${ownerTab === "verifications" ? "active" : ""}`}
                  onClick={() => setOwnerTab("verifications")}
                >
                  ✅ Verification Queue
                </button>
                <button
                  className={`owner-tab ${ownerTab === "enquiries" ? "active" : ""}`}
                  onClick={() => {
                    setOwnerTab("enquiries");
                    fetchAdminEnquiries();
                  }}
                >
                  🛡️ All Enquiries ({adminEnquiries.length})
                </button>
              </div>
            </div>

            <div className="portal-content">
              {/* TAB 1: OVERVIEW */}
              {ownerTab === "overview" && platformStats && (
                <div className="overview-tab-pane">
                  <div className="metrics-grid">
                    <div className="metric-card gold">
                      <div className="metric-icon">👥</div>
                      <div>
                        <h3>{platformStats.users?.total || 0}</h3>
                        <p>Total Registered Users</p>
                        <small>Customers: {platformStats.users?.customers} | Sellers: {platformStats.users?.house_owners} | Admins: {platformStats.users?.admins}</small>
                      </div>
                    </div>

                    <div className="metric-card blue">
                      <div className="metric-icon">🏡</div>
                      <div>
                        <h3>{platformStats.properties?.total || 0}</h3>
                        <p>Total Property Listings</p>
                        <small>Available: {platformStats.properties?.available}</small>
                      </div>
                    </div>

                    <div className="metric-card green">
                      <div className="metric-icon">✅</div>
                      <div>
                        <h3>{platformStats.properties?.verified || 0}</h3>
                        <p>Verified Properties</p>
                        <small>Pending Verification: {platformStats.properties?.pending_verification}</small>
                      </div>
                    </div>

                    <div className="metric-card purple">
                      <div className="metric-icon">📩</div>
                      <div>
                        <h3>{platformStats.enquiries?.total || 0}</h3>
                        <p>Total Customer Inquiries</p>
                        <small>Pending: {platformStats.enquiries?.pending} | Contacted: {platformStats.enquiries?.contacted}</small>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: USER MANAGEMENT & ROLES */}
              {ownerTab === "users" && (
                <div className="users-tab-pane">
                  <h3>All Registered Platform Users</h3>
                  <div className="table-responsive">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Phone</th>
                          <th>City</th>
                          <th>Current Role</th>
                          <th>Listings</th>
                          <th>Inquiries</th>
                          <th>Change Role</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allUsers.map((user) => (
                          <tr key={user.id}>
                            <td>#{user.id}</td>
                            <td><strong>{user.name}</strong></td>
                            <td>{user.email}</td>
                            <td>{user.phone}</td>
                            <td>{user.city || "-"}</td>
                            <td>
                              <span className={`role-pill role-${user.role}`}>
                                {user.role?.toUpperCase()}
                              </span>
                            </td>
                            <td>{user.properties_count || 0}</td>
                            <td>{user.enquiries_count || 0}</td>
                            <td>
                              <select
                                value={user.role}
                                onChange={(e) => handleChangeUserRole(user.id, e.target.value)}
                                className="role-dropdown"
                                disabled={user.email === "owner@zenvoraa.com"}
                              >
                                <option value="customer">Customer / Buyer</option>
                                <option value="house_owner">House Owner (Seller)</option>
                                <option value="admin">Admin / Staff</option>
                                <option value="super_admin">Super Admin (Owner)</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 3: VERIFICATION QUEUE */}
              {ownerTab === "verifications" && (
                <div className="verifications-tab-pane">
                  <h3>Property Ownership Verification Requests</h3>
                  <p>Review submitted legal registry documents and confirm property authenticity.</p>

                  <div className="verifications-grid">
                    {properties.map((prop) => (
                      <div className="verification-item-card" key={prop.id}>
                        <div className="verification-card-header">
                          <div>
                            <strong>Property #{prop.id}: {prop.title}</strong>
                            <p>📍 {prop.location}</p>
                          </div>
                          <span className={`status-badge ${prop.verification_status}`}>
                            {prop.verification_status?.toUpperCase()}
                          </span>
                        </div>

                        <div className="verification-legal-details">
                          <p><strong>Legal Owner Name:</strong> {prop.owner_legal_name || "Not submitted yet"}</p>
                          <p><strong>Registry / Deed Ref:</strong> {prop.registry_number || "N/A"}</p>
                          <p><strong>Listed Price:</strong> ₹{Number(prop.price).toLocaleString("en-IN")}</p>
                          {prop.document_url && (
                            <p>
                              <strong>Proof Document:</strong>{" "}
                              <a href={prop.document_url} target="_blank" rel="noreferrer">
                                View Deed Document ↗
                              </a>
                            </p>
                          )}
                        </div>

                        <div className="verification-action-buttons">
                          <button
                            className="btn-approve"
                            onClick={() => handleVerifyPropertyAction(prop.id, "verified")}
                          >
                            ✅ Approve & Verify Property
                          </button>
                          <button
                            className="btn-reject"
                            onClick={() => handleVerifyPropertyAction(prop.id, "rejected")}
                          >
                            ❌ Reject Application
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: ALL ENQUIRIES */}
              {ownerTab === "enquiries" && (
                <div className="enquiries-tab-pane">
                  <h3>All Customer Inquiries Across Website</h3>
                  <div className="enquiries-grid">
                    {adminEnquiries.map((enq) => (
                      <div className="enquiry-card" key={enq.id}>
                        <div className="enquiry-top">
                          <div>
                            <strong>Property: {enq.property_title}</strong>
                            <p>📍 {enq.property_location} • ₹{Number(enq.property_price).toLocaleString("en-IN")}</p>
                          </div>
                          <span className={`status-badge ${enq.status?.toLowerCase()}`}>
                            {enq.status}
                          </span>
                        </div>

                        <div className="enquiry-customer-details">
                          <p>👤 <strong>Customer:</strong> {enq.customer_name} ({enq.customer_email})</p>
                          <p>📞 <strong>Phone:</strong> {enq.customer_phone} | <strong>Location:</strong> {enq.customer_location}</p>
                        </div>

                        <div className="enquiry-message">
                          <strong>Message:</strong>
                          <p>{enq.message}</p>
                        </div>

                        <div className="enquiry-actions-row">
                          <label>Status:</label>
                          <select
                            value={enq.status}
                            onChange={(e) => handleUpdateEnquiryStatus(enq.id, e.target.value)}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Contacted">Contacted</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Closed">Closed</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: ADMIN INQUIRIES MODAL (STAFF / ADMIN ROLE)     */}
      {/* ======================================================== */}
      {showAdminEnquiries && (loggedCustomer?.role === "admin" || loggedCustomer?.role === "super_admin") && (
        <div className="modal-overlay" onClick={() => setShowAdminEnquiries(false)}>
          <div className="auth-modal admin-enquiries-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowAdminEnquiries(false)}>
              ✕
            </button>

            <h2>📋 Admin Inquiries & Leads</h2>
            <p className="auth-subtitle">Track and respond to customer property inquiries.</p>

            {adminEnquiriesLoading ? (
              <p>Loading inquiries...</p>
            ) : adminEnquiries.length === 0 ? (
              <div className="empty-state">
                <p>No customer inquiries yet.</p>
              </div>
            ) : (
              <div className="enquiries-grid">
                {adminEnquiries.map((enquiry) => (
                  <div className="enquiry-card" key={enquiry.id}>
                    <div className="enquiry-top">
                      <strong>{enquiry.property_title}</strong>
                      <span className={`status-badge ${enquiry.status?.toLowerCase()}`}>
                        {enquiry.status}
                      </span>
                    </div>

                    <div className="enquiry-customer-details">
                      <p>👤 <strong>{enquiry.customer_name}</strong> • 📞 {enquiry.customer_phone}</p>
                      <p>📧 {enquiry.customer_email} • 📍 {enquiry.customer_location}</p>
                    </div>

                    <div className="enquiry-message">
                      <p>{enquiry.message}</p>
                    </div>

                    <div className="enquiry-actions-row">
                      <select
                        value={enquiry.status}
                        onChange={(e) => handleUpdateEnquiryStatus(enquiry.id, e.target.value)}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Contacted">Contacted</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: USER / HOUSE OWNER DASHBOARD                   */}
      {/* ======================================================== */}
      {showDashboard && loggedCustomer && (
        <div className="modal-overlay" onClick={() => setShowDashboard(false)}>
          <div className="auth-modal dashboard-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowDashboard(false)}>
              ✕
            </button>

            <h2>
              {loggedCustomer.role === "house_owner" ? "🏡 House Owner Dashboard" : "👤 Customer Dashboard"}
            </h2>

            <div className="dashboard-profile-box">
              <div>
                <strong>{loggedCustomer.name}</strong>
                <p>📧 {loggedCustomer.email} | 📞 {loggedCustomer.phone} | 📍 {loggedCustomer.city || "Jaipur"}</p>
              </div>
              <span className={`role-pill role-${loggedCustomer.role}`}>
                {loggedCustomer.role?.toUpperCase()}
              </span>
            </div>

            {/* If House Owner: Show My Listings */}
            {loggedCustomer.role === "house_owner" && (
              <div className="dashboard-section">
                <div className="dashboard-section-header">
                  <h3>🏡 My Listed Properties ({myProperties.length})</h3>
                  <button
                    className="btn-primary"
                    onClick={() => {
                      setShowDashboard(false);
                      setShowSellProperty(true);
                    }}
                  >
                    ➕ Add New Property
                  </button>
                </div>

                {myProperties.length === 0 ? (
                  <div className="empty-state">
                    <p>You have not listed any properties yet.</p>
                  </div>
                ) : (
                  <div className="my-properties-list">
                    {myProperties.map((prop) => (
                      <div className="my-property-item" key={prop.id}>
                        <img
                          src={prop.image_url || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=85"}
                          alt={prop.title}
                        />
                        <div className="my-prop-info">
                          <h4>{prop.title}</h4>
                          <p>📍 {prop.location} • ₹{Number(prop.price).toLocaleString("en-IN")}</p>

                          <div className="verification-status-row">
                            {prop.is_verified ? (
                              <span className="badge-verified">
                                ✅ Verified by Zenvoraa (Ref: {prop.registry_number})
                              </span>
                            ) : prop.verification_status === "pending" ? (
                              <span className="badge-pending">
                                ⏳ Verification Under Review
                              </span>
                            ) : (
                              <button
                                className="btn-verify-now"
                                onClick={() => setVerifyingProperty(prop)}
                              >
                                📜 Submit Title Deed for Verification
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Enquiries Section */}
            <div className="dashboard-section">
              <h3>
                {loggedCustomer.role === "house_owner" ? "📩 Inquiries on My Properties" : "📩 My Sent Inquiries"}
              </h3>

              {dashboardLoading ? (
                <p>Loading inquiries...</p>
              ) : myEnquiries.length === 0 ? (
                <div className="empty-state">
                  <p>No inquiries found.</p>
                </div>
              ) : (
                <div className="enquiries-grid">
                  {myEnquiries.map((enq) => (
                    <div className="enquiry-card" key={enq.id}>
                      <div className="enquiry-top">
                        <strong>{enq.property_title}</strong>
                        <span className={`status-badge ${enq.status?.toLowerCase()}`}>
                          {enq.status}
                        </span>
                      </div>
                      <p>📍 {enq.property_location}</p>
                      <div className="enquiry-message">
                        <p>{enq.message}</p>
                      </div>
                      <small>Date: {new Date(enq.created_at).toLocaleDateString("en-IN")}</small>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 5: SUBMIT PROPERTY FOR VERIFICATION (HOUSE OWNER) */}
      {/* ======================================================== */}
      {verifyingProperty && (
        <div className="modal-overlay" onClick={() => setVerifyingProperty(null)}>
          <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setVerifyingProperty(null)}>
              ✕
            </button>

            <h2>📜 Submit Property Title for Official Verification</h2>
            <p className="auth-subtitle">
              Verify ownership for: <strong>{verifyingProperty.title}</strong>
            </p>

            <form onSubmit={handleSubmitVerification} className="auth-form">
              <div className="form-group">
                <label>Official Legal Owner Name (as on Deed/Registry) *</label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Chandra Sharma"
                  value={verifyLegalName}
                  onChange={(e) => setVerifyLegalName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Registry / Title Deed / Khasra Number *</label>
                <input
                  type="text"
                  placeholder="e.g. REG-2026-RAJ-94821 or Khasra 429/1"
                  value={verifyRegistryNum}
                  onChange={(e) => setVerifyRegistryNum(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Deed / Registry Document URL (or image link)</label>
                <input
                  type="text"
                  placeholder="https://example.com/registry-deed.pdf"
                  value={verifyDocUrl}
                  onChange={(e) => setVerifyDocUrl(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Additional Remarks / Notes</label>
                <textarea
                  placeholder="Notes for the legal verification team..."
                  value={verifyNotes}
                  onChange={(e) => setVerifyNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <button
                type="submit"
                className="auth-submit-btn"
                disabled={verifySubmitting}
              >
                {verifySubmitting ? "Submitting..." : "✅ Submit for Official Verification"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 6: PUBLIC PROPERTY AUTHENTICITY CERTIFICATE CHECK */}
      {/* ======================================================== */}
      {showVerifyModal && (
        <div className="modal-overlay" onClick={() => setShowVerifyModal(false)}>
          <div className="auth-modal certificate-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowVerifyModal(false)}>
              ✕
            </button>

            <h2>🔍 Property Authenticity & Title Verification</h2>
            <p className="auth-subtitle">
              Verify if a property exists, who is the legal registered owner, and whether it has official title clearance.
            </p>

            <form onSubmit={handleCheckAuthenticity} className="verify-search-form">
              <input
                type="text"
                placeholder="Enter Property ID or Registry Number (e.g., 1 or REG-2026-RAJ-94821)..."
                value={verifySearchQuery}
                onChange={(e) => setVerifySearchQuery(e.target.value)}
                required
              />
              <button type="submit" disabled={verifySearchLoading}>
                {verifySearchLoading ? "Verifying..." : "Verify Now"}
              </button>
            </form>

            {verifySearchResult && (
              <div className="certificate-result-box">
                {verifySearchResult.found && verifySearchResult.verification ? (
                  <div className="official-certificate">
                    <div className="certificate-stamp">
                      <span>ZENVORAA</span>
                      <small>VERIFIED</small>
                    </div>

                    <div className="certificate-header">
                      <h3>🏛️ Official Property Title Certificate</h3>
                      <span className={`cert-badge ${verifySearchResult.verification.is_verified ? "verified" : "unverified"}`}>
                        {verifySearchResult.verification.certificate_status}
                      </span>
                    </div>

                    <div className="certificate-body">
                      <div className="cert-row">
                        <span>Property ID:</span>
                        <strong>#{verifySearchResult.verification.property_id}</strong>
                      </div>
                      <div className="cert-row">
                        <span>Property Title:</span>
                        <strong>{verifySearchResult.verification.title}</strong>
                      </div>
                      <div className="cert-row">
                        <span>Location:</span>
                        <strong>{verifySearchResult.verification.location}</strong>
                      </div>
                      <div className="cert-row">
                        <span>Registered Legal Owner:</span>
                        <strong className="highlight-green">{verifySearchResult.verification.owner_legal_name}</strong>
                      </div>
                      <div className="cert-row">
                        <span>Government Registry Reference:</span>
                        <strong className="highlight-gold">{verifySearchResult.verification.registry_number}</strong>
                      </div>
                      <div className="cert-row">
                        <span>Verified By:</span>
                        <strong>{verifySearchResult.verification.verified_by}</strong>
                      </div>
                    </div>

                    <div className="certificate-footer">
                      <p>🛡️ This property is officially indexed in the Zenvoraa Authenticated Real Estate Database.</p>
                    </div>
                  </div>
                ) : (
                  <div className="certificate-not-found">
                    <span className="not-found-icon">⚠️</span>
                    <h4>Property Not Found on Record</h4>
                    <p>{verifySearchResult.message}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 7: FULL SCREEN GEO-LOCATION PROPERTY MAP         */}
      {/* ======================================================== */}
      {showMapModal && (
        <div className="modal-overlay" onClick={() => setShowMapModal(false)}>
          <div className="map-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowMapModal(false)}>
              ✕
            </button>

            <div className="map-modal-header">
              <h2>🗺️ Interactive Property Geo-Map</h2>
              <p>Explore all properties across cities with verified status pins.</p>
            </div>

            <div className="interactive-map-grid">
              {mapProperties.map((prop) => (
                <div
                  className="interactive-map-card"
                  key={prop.id}
                  onClick={() => {
                    setShowMapModal(false);
                    setSelectedProperty(prop);
                  }}
                >
                  <img
                    src={prop.image_url || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=85"}
                    alt={prop.title}
                  />
                  <div className="map-card-info">
                    <h4>{prop.title}</h4>
                    <p>📍 {prop.location} ({prop.city})</p>
                    <div className="map-card-price">
                      ₹{Number(prop.price).toLocaleString("en-IN")}
                    </div>
                    {prop.is_verified ? (
                      <span className="badge-verified">✅ Verified Owner: {prop.owner_legal_name?.split(" ")[0]}</span>
                    ) : (
                      <span className="badge-pending">⏳ Unverified</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 8: PROPERTY DETAIL & DIRECT INQUIRY MODAL         */}
      {/* ======================================================== */}
      {selectedProperty && (
        <div className="modal-overlay" onClick={() => setSelectedProperty(null)}>
          <div className="property-detail-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedProperty(null)}>
              ✕
            </button>

            <div className="detail-modal-grid">
              <div className="detail-modal-media">
                <img
                  src={selectedProperty.image_url || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=85"}
                  alt={selectedProperty.title}
                />
              </div>

              <div className="detail-modal-info">
                <div className="detail-top-badges">
                  <span className={`purpose-pill ${selectedProperty.purpose}`}>
                    FOR {selectedProperty.purpose?.toUpperCase()}
                  </span>
                  {selectedProperty.is_verified ? (
                    <span className="verified-card-pill">
                      ✅ Officially Verified
                    </span>
                  ) : (
                    <span className="unverified-card-pill">
                      ⏳ Verification Pending
                    </span>
                  )}
                </div>

                <h2>{selectedProperty.title}</h2>
                <p className="detail-location">📍 {selectedProperty.location}</p>
                <div className="detail-price">
                  ₹{Number(selectedProperty.price).toLocaleString("en-IN")}
                </div>

                <div className="detail-features-grid">
                  <div className="feature-box">
                    <span>🛏️</span>
                    <strong>{selectedProperty.bedrooms} BHK</strong>
                    <small>Bedrooms</small>
                  </div>
                  <div className="feature-box">
                    <span>📐</span>
                    <strong>{selectedProperty.area}</strong>
                    <small>Sqft Area</small>
                  </div>
                  <div className="feature-box">
                    <span>📍</span>
                    <strong>{selectedProperty.city || "Jaipur"}</strong>
                    <small>City</small>
                  </div>
                </div>

                {/* Official Verification Trust Box */}
                {selectedProperty.is_verified && (
                  <div className="official-verification-card">
                    <div className="verification-card-title">
                      <span>🛡️ Title & Ownership Guarantee</span>
                    </div>
                    <p><strong>Registered Owner:</strong> {selectedProperty.owner_legal_name}</p>
                    <p><strong>Registry / Deed Ref:</strong> {selectedProperty.registry_number}</p>
                    <p><small>Verified against official records by Zenvoraa Legal Verification Desk.</small></p>
                  </div>
                )}

                {/* Direct Inquiry Form */}
                <div className="detail-inquiry-box">
                  <h3>📩 Direct Inquiry for this Property</h3>
                  <textarea
                    placeholder="Write your inquiry or site visit request..."
                    value={enquiryMessage}
                    onChange={(e) => setEnquiryMessage(e.target.value)}
                    rows={3}
                  />

                  <button
                    className="btn-primary"
                    onClick={handleSendEnquiry}
                    disabled={enquiryLoading}
                  >
                    {enquiryLoading ? "Sending..." : "Send Instant Inquiry"}
                  </button>

                  {enquirySuccess && <p className="success-msg">{enquirySuccess}</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 9: LIST / SELL PROPERTY MODAL                     */}
      {/* ======================================================== */}
      {showSellProperty && (
        <div className="modal-overlay" onClick={() => setShowSellProperty(false)}>
          <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowSellProperty(false)}>
              ✕
            </button>

            <h2>🏡 List Your Property on Zenvoraa</h2>
            <p className="auth-subtitle">Enter property details for buyers and tenants.</p>

            <form onSubmit={handleCreateProperty} className="auth-form">
              <div className="form-group">
                <label>Property Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Luxury 3BHK Villa in Malviya Nagar"
                  value={sellTitle}
                  onChange={(e) => setSellTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Complete Address / Location *</label>
                  <input
                    type="text"
                    placeholder="e.g. Near World Trade Park, Malviya Nagar"
                    value={sellLocation}
                    onChange={(e) => setSellLocation(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>City *</label>
                  <input
                    type="text"
                    placeholder="e.g. Jaipur"
                    value={sellCity}
                    onChange={(e) => setSellCity(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Price (₹) *</label>
                  <input
                    type="number"
                    placeholder="e.g. 7500000"
                    value={sellPrice}
                    onChange={(e) => setSellPrice(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Bedrooms (BHK) *</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 3"
                    value={sellBedrooms}
                    onChange={(e) => setSellBedrooms(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Area (sqft) *</label>
                  <input
                    type="number"
                    placeholder="e.g. 1850"
                    value={sellArea}
                    onChange={(e) => setSellArea(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Purpose *</label>
                  <select
                    value={sellPurpose}
                    onChange={(e) => setSellPurpose(e.target.value)}
                  >
                    <option value="sell">Sell</option>
                    <option value="rent">Rent</option>
                    <option value="buy">Buy</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Property Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSellImage(e.target.files[0])}
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  placeholder="Describe your property features, nearby amenities, parking..."
                  value={sellDescription}
                  onChange={(e) => setSellDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <button
                type="submit"
                className="auth-submit-btn"
                disabled={imageUploading}
              >
                {imageUploading ? "Uploading..." : "🏡 Publish Property Listing"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="footer" id="contact">
        <div className="footer-container">
          <div className="footer-col">
            <div className="footer-logo">
              Zen<span>voraa</span>
            </div>
            <p>
              Smart, authenticated real estate platform with 100% verified ownership title checks and geo-mapping.
            </p>
          </div>

          <div className="footer-col">
            <h4>Quick Links</h4>
            <a href="/">Home</a>
            <a href="/properties">Explore Properties</a>
            <button className="footer-link-btn" onClick={() => setShowVerifyModal(true)}>
              🔍 Verify Property Authenticity
            </button>
            <button className="footer-link-btn" onClick={() => setShowMapModal(true)}>
              🗺️ Interactive Geo Map
            </button>
          </div>

          <div className="footer-col">
            <h4>Contact Support</h4>
            <p>📧 zenvoraa.support@gmail.com</p>
            <p>📞 +91 9050978815</p>
            <p>📍 Sirsa, Haryana, India</p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 Zenvoraa Real Estate Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;



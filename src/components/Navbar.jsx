import { useState } from "react";
import "./Navbar.css";

function Navbar({
  loggedCustomer,
  setShowDashboard,
  setShowOwnerPortal,
  setShowAdminEnquiries,
  setShowSellProperty,
  setShowVerifyModal,
  setShowMapModal,
  fetchMyEnquiries,
  fetchMyProperties,
  fetchAdminEnquiries,
  setLoggedCustomer,
  setAuthMessage,
  setAuthMode,
  setShowAuth,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const role = loggedCustomer?.role || "guest";

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <nav className="navbar">
      <div className="nav-top-row">
        <div className="logo" onClick={() => { closeMenu(); window.location.href = "/"; }} style={{ cursor: "pointer" }}>
          <img src="/zenvoraa-logo.png" alt="Zenvoraa Logo" />
        </div>

        <button
          className="mobile-toggle-btn"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? "✕" : "⋮"}
        </button>
      </div>

      <div className={`nav-links ${mobileMenuOpen ? "open" : ""}`}>
        <a href="/" onClick={closeMenu}>Home</a>
        <a href="/properties" onClick={closeMenu}>Properties</a>
        <button
          type="button"
          className="nav-link-btn"
          onClick={() => {
            closeMenu();
            if (setShowVerifyModal) setShowVerifyModal(true);
          }}
        >
          🔍 Verify Property
        </button>
        <button
          type="button"
          className="nav-link-btn"
          onClick={() => {
            closeMenu();
            if (setShowMapModal) setShowMapModal(true);
          }}
        >
          🗺️ Geo Map
        </button>
        <a href="/about" onClick={closeMenu}>About</a>
        <a href="/contact" onClick={closeMenu}>Contact</a>
      </div>

      <div className={`navbar-actions ${mobileMenuOpen ? "open" : ""}`}>
        {loggedCustomer ? (
          <div className="user-action-group">
            {/* 1. SUPER ADMIN / WEBSITE OWNER */}
            {role === "super_admin" && (
              <>
                <button
                  className="owner-action-btn"
                  onClick={() => {
                    closeMenu();
                    if (setShowOwnerPortal) setShowOwnerPortal(true);
                  }}
                  title="Super Admin Complete Control Room"
                >
                  👑 Owner Portal
                </button>
                <button
                  className="login-btn"
                  onClick={() => {
                    closeMenu();
                    if (setShowAdminEnquiries) setShowAdminEnquiries(true);
                    if (fetchAdminEnquiries) fetchAdminEnquiries();
                  }}
                >
                  🛡️ All Inquiries
                </button>
              </>
            )}

            {/* 2. ADMIN / STAFF */}
            {role === "admin" && (
              <>
                <button
                  className="admin-action-btn"
                  onClick={() => {
                    closeMenu();
                    if (setShowAdminEnquiries) setShowAdminEnquiries(true);
                    if (fetchAdminEnquiries) fetchAdminEnquiries();
                  }}
                >
                  📋 Manage Enquiries
                </button>
              </>
            )}

            {/* 3. HOUSE OWNER / SELLER */}
            {role === "house_owner" && (
              <>
                <button
                  className="seller-action-btn"
                  onClick={() => {
                    closeMenu();
                    if (setShowSellProperty) setShowSellProperty(true);
                  }}
                >
                  ➕ List Property
                </button>
                <button
                  className="login-btn"
                  onClick={() => {
                    closeMenu();
                    if (setShowDashboard) setShowDashboard(true);
                    if (fetchMyProperties) fetchMyProperties();
                    if (fetchMyEnquiries) fetchMyEnquiries();
                  }}
                >
                  🏠 My Properties
                </button>
              </>
            )}

            {/* 4. CUSTOMER / BUYER */}
            {role === "customer" && (
              <button
                className="login-btn"
                onClick={() => {
                  closeMenu();
                  if (setShowDashboard) setShowDashboard(true);
                  if (fetchMyEnquiries) fetchMyEnquiries();
                }}
              >
                👤 My Dashboard
              </button>
            )}

            {/* Role Badge and User Name */}
            <div className="user-profile-badge">
              <span className={`role-pill role-${role}`}>
                {role === "super_admin"
                  ? "👑 Owner"
                  : role === "admin"
                  ? "🛡️ Admin"
                  : role === "house_owner"
                  ? "🏡 Seller"
                  : "👤 Buyer"}
              </span>
              <span className="user-name">{loggedCustomer.name?.split(" ")[0]}</span>
            </div>

            <button
              className="logout-btn"
              onClick={() => {
                closeMenu();
                setLoggedCustomer(null);
                localStorage.removeItem("loggedCustomer");
                if (setAuthMessage) setAuthMessage("");
                if (setAuthMode) setAuthMode("login");
              }}
              title="Logout from Zenvoraa"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="guest-action-group">
            <button
              className="login-btn"
              onClick={() => {
                closeMenu();
                if (setAuthMode) setAuthMode("login");
                if (setAuthMessage) setAuthMessage("");
                if (setShowAuth) setShowAuth(true);
              }}
            >
              🔑 Login / Register
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;

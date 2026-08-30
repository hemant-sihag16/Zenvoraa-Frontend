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
  const role = loggedCustomer?.role || "guest";

  return (
    <nav className="navbar">
      <div className="logo" onClick={() => window.location.href = "/"} style={{ cursor: "pointer" }}>
        <img src="/zenvoraa-logo.png" alt="Zenvoraa Logo" />
      </div>

      <div className="nav-links">
        <a href="/">Home</a>
        <a href="/properties">Properties</a>
        <button
          type="button"
          className="nav-link-btn"
          onClick={() => setShowVerifyModal && setShowVerifyModal(true)}
        >
          🔍 Verify Property
        </button>
        <button
          type="button"
          className="nav-link-btn"
          onClick={() => setShowMapModal && setShowMapModal(true)}
        >
          🗺️ Geo Map
        </button>
        <a href="/about">About</a>
        <a href="/contact">Contact</a>
      </div>

      <div className="navbar-actions">
        {loggedCustomer ? (
          <div className="user-action-group">
            {/* 1. SUPER ADMIN / WEBSITE OWNER */}
            {role === "super_admin" && (
              <>
                <button
                  className="owner-action-btn"
                  onClick={() => {
                    if (setShowOwnerPortal) setShowOwnerPortal(true);
                  }}
                  title="Super Admin Complete Control Room"
                >
                  👑 Owner Portal
                </button>
                <button
                  className="login-btn"
                  onClick={() => {
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
                    if (setShowSellProperty) setShowSellProperty(true);
                  }}
                >
                  ➕ List Property
                </button>
                <button
                  className="login-btn"
                  onClick={() => {
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


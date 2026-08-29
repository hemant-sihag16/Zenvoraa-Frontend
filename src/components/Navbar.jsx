function Navbar({
  loggedCustomer,
  setShowDashboard,
  fetchMyEnquiries,
  fetchMyProperties,
  setShowAdminEnquiries,
  fetchAdminEnquiries,
  setLoggedCustomer,
  setAuthMessage,
  setAuthMode,
  setShowAuth,
}) {
  return (
    <nav className="navbar">

      <div className="logo">
        <img src="/zenvoraa-logo.png" alt="Zenvoraa Logo" />
      </div>

      <div className="nav-links">
        <a href="/">Home</a>
        <a href="/properties">Properties</a>
        <a href="/about">About</a>
        <a href="/contact">Contact</a>
      </div>

      <div className="navbar-actions">

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
              🏠 Dashboard
            </button>

            <button
              className="login-btn"
              onClick={() => {
                setShowAdminEnquiries(true);
                fetchAdminEnquiries();
              }}
            >
              🏠 Admin Enquiries
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

      </div>

    </nav>
  );
}

export default Navbar;

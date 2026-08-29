import Navbar from "../components/Navbar";
function About() {
  return (
    <>
      <Navbar />
      <div
      style={{
        minHeight: "100vh",
        background: "#f6f7f9",
        padding: "70px 20px",
      }}
    >
      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
          background: "#111827",
          color: "#fff",
          borderRadius: "24px",
          padding: "55px 45px",
          boxShadow: "0 20px 50px rgba(15,23,42,0.18)",
        }}
      >
        <p
          style={{
            color: "#c6a15a",
            fontSize: "13px",
            fontWeight: "800",
            letterSpacing: "3px",
            textTransform: "uppercase",
          }}
        >
          ABOUT ZENVORAA
        </p>

        <h1
          style={{
            fontSize: "clamp(38px, 6vw, 58px)",
            margin: "10px 0 20px",
          }}
        >
          Smart Real Estate, Made Simple.
        </h1>

        <p
          style={{
            color: "#d1d5db",
            fontSize: "18px",
            lineHeight: "1.8",
            maxWidth: "750px",
          }}
        >
          Zenvoraa is a smart real estate platform designed to make
          finding, buying, renting and selling properties easier.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "18px",
            marginTop: "35px",
          }}
        >
          <div style={{ background: "#1e293b", padding: "22px", borderRadius: "16px" }}>
            <h3>🏠 Find Properties</h3>
            <p style={{ color: "#cbd5e1" }}>
              Discover properties that match your requirements.
            </p>
          </div>

          <div style={{ background: "#1e293b", padding: "22px", borderRadius: "16px" }}>
            <h3>🔑 Buy & Rent</h3>
            <p style={{ color: "#cbd5e1" }}>
              Explore opportunities for buying and renting.
            </p>
          </div>

          <div style={{ background: "#1e293b", padding: "22px", borderRadius: "16px" }}>
            <h3>🏡 Sell Property</h3>
            <p style={{ color: "#cbd5e1" }}>
              List your property and reach potential customers.
            </p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

export default About;



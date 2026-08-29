import Navbar from "../components/Navbar";
function Contact() {
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
          maxWidth: "850px",
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
          GET IN TOUCH
        </p>

        <h1
          style={{
            fontSize: "clamp(38px, 6vw, 58px)",
            margin: "10px 0 20px",
          }}
        >
          Contact Zenvoraa
        </h1>

        <p
          style={{
            color: "#d1d5db",
            fontSize: "18px",
            lineHeight: "1.8",
          }}
        >
          Have a property-related question? Our team is here to help.
        </p>

        <div
          style={{
            marginTop: "35px",
            background: "#1e293b",
            padding: "25px",
            borderRadius: "18px",
          }}
        >
          <h3>📧 Email Support</h3>

          <p style={{ color: "#cbd5e1", fontSize: "17px" }}>
            zenvoraa.support@gmail.com
          </p>
        </div>

        <div
          style={{
            marginTop: "18px",
            background: "#1e293b",
            padding: "25px",
            borderRadius: "18px",
          }}
        >
          <h3>🏠 Zenvoraa</h3>

          <p style={{ color: "#cbd5e1" }}>
            Smart Real Estate Platform
          </p>
        </div>        
        <div
          style={{
            marginTop: "18px",
            background: "#1e293b",
            padding: "25px",
            borderRadius: "18px",
          }}
        >
          <h3>📸 Follow Zenvoraa</h3>

          <p style={{ color: "#cbd5e1" }}>
            Follow us on Instagram for property updates and new listings.
          </p>

          <a
            href="https://www.instagram.com/zenvoraa.realestate/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              marginTop: "12px",
              color: "#fff",
              textDecoration: "none",
              fontWeight: "700",
              background: "linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)",
              padding: "11px 18px",
              borderRadius: "10px",
            }}
          >
            📸 @zenvoraa.realestate
          </a>
        </div>
      
      </div>
    </div>
    </>
  );
}

export default Contact;



import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";



function Home() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const sections = document.querySelectorAll(".animate-on-scroll");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("show");
          }
        });
      },
      {
        threshold: 0.15,
      }
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="home">

      {/* ================= NAVBAR ================= */}

     {/* ================= NAVBAR ================= */}

<nav className="navbar">

  <div
    className="logo"
    onClick={() => navigate("/")}
  >
    🩸 BloodBridge
  </div>

  {/* Desktop Navigation */}
  <div className="nav-links">
    <a href="#home">Home</a>
    <a href="#how-it-works">How It Works</a>
    <a href="#compatibility">Compatibility</a>
    <a href="#about">About</a>
  </div>

  <div className="nav-buttons">

    <button
      className="login-btn"
      onClick={() => navigate("/login")}
    >
      Login
    </button>

    <button
      className="register-btn"
      onClick={() => navigate("/register")}
    >
      Register
    </button>

  </div>

  {/* Mobile Menu Button */}
  <button
    className="menu-btn"
    onClick={() => setMenuOpen(!menuOpen)}
  >
    ☰
  </button>

  {/* Mobile Menu */}
  {menuOpen && (
    <div className="mobile-menu">

      <a href="#home" onClick={() => setMenuOpen(false)}>
        Home
      </a>

      <a href="#how-it-works" onClick={() => setMenuOpen(false)}>
        How It Works
      </a>

      <a href="#compatibility" onClick={() => setMenuOpen(false)}>
        Compatibility
      </a>

      <a href="#about" onClick={() => setMenuOpen(false)}>
        About
      </a>

      <button
        onClick={() => {
          setMenuOpen(false);
          navigate("/login");
        }}
      >
        Login
      </button>

      <button
        onClick={() => {
          setMenuOpen(false);
          navigate("/register");
        }}
      >
        Register
      </button>

    </div>
  )}

</nav>
      {/* ================= HERO ================= */}

      <section className="hero" id="home">

        <div className="hero-content animate-on-scroll">

          <p className="hero-small">
            🩸 Connecting People. Saving Lives.
          </p>

          <h1>
            Every Drop
            <span> Can Save a Life.</span>
          </h1>

          <p className="hero-description">
            BloodBridge connects blood donors with people
            who urgently need blood. Find compatible donors,
            respond to requests and help save lives.
          </p>

          <div className="hero-buttons">

            <button
              className="primary-btn"
              onClick={() => navigate("/login")}
            >
              Find Blood
            </button>

            <button
              className="secondary-btn"
              onClick={() => navigate("/register")}
            >
              Become a Donor
            </button>

          </div>

        </div>

        <div className="hero-image animate-on-scroll">

          <img
            src="/src/assets/hero.jpg"
            alt="Blood donation"
          />

        </div>

      </section>

      {/* ================= QUICK ACTIONS ================= */}

      <section className="quick-section">

        <div className="section-heading animate-on-scroll">
          <p>What do you need?</p>
          <h2>Be a part of the life-saving network</h2>
        </div>

        <div className="quick-cards">

          <div className="quick-card animate-on-scroll">
            <div className="card-icon">🩸</div>

            <h3>Need Blood?</h3>

            <p>
              Create a blood request and find compatible
              donors near you.
            </p>

            <button onClick={() => navigate("/login")}>
              Request Blood →
            </button>
          </div>

          <div className="quick-card animate-on-scroll">
            <div className="card-icon">❤️</div>

            <h3>Want to Donate?</h3>

            <p>
              Become a donor and help someone who needs
              your blood group.
            </p>

            <button onClick={() => navigate("/register")}>
              Become a Donor →
            </button>
          </div>

          <div className="quick-card animate-on-scroll">
            <div className="card-icon">🔍</div>

            <h3>Find Blood</h3>

            <p>
              Discover compatible blood requests in
              your city.
            </p>

            <button onClick={() => navigate("/login")}>
              Find Requests →
            </button>
          </div>

        </div>

      </section>

      {/* ================= HOW IT WORKS ================= */}

      <section
        className="how-section"
        id="how-it-works"
      >

        <div className="section-heading animate-on-scroll">
          <p>Simple & Fast</p>
          <h2>How BloodBridge Works</h2>

          <span>
            From request to donation, everything is simple.
          </span>
        </div>

        <div className="steps">

          <div className="step animate-on-scroll">
            <div className="step-number">01</div>

            <h3>Create Request</h3>

            <p>
              Tell us which blood group is needed and
              where it is required.
            </p>
          </div>

          <div className="step animate-on-scroll">
            <div className="step-number">02</div>

            <h3>Find Compatible Donors</h3>

            <p>
              BloodBridge identifies compatible donors
              based on blood group and location.
            </p>
          </div>

          <div className="step animate-on-scroll">
            <div className="step-number">03</div>

            <h3>Donor Responds</h3>

            <p>
              A compatible donor can accept the request
              and offer to donate.
            </p>
          </div>

          <div className="step animate-on-scroll">
            <div className="step-number">04</div>

            <h3>Save a Life</h3>

            <p>
              Connect with the donor and complete the
              donation.
            </p>
          </div>

        </div>

      </section>

      {/* ================= COMPATIBILITY ================= */}

      <section
        className="compatibility-section"
        id="compatibility"
      >

        <div className="compatibility-content animate-on-scroll">

          <p className="section-label">
            Smart Blood Matching
          </p>

          <h2>
            Find the Right
            <span> Blood Match</span>
          </h2>

          <p>
            BloodBridge checks blood group compatibility
            before showing a request to a donor.
          </p>

          <button
            className="primary-btn"
            onClick={() => navigate("/register")}
          >
            Join BloodBridge
          </button>

        </div>

        <div className="blood-groups animate-on-scroll">

          <div className="blood-box">O−</div>
          <div className="blood-arrow">→</div>
          <div className="blood-box">A+</div>
          <div className="blood-arrow">→</div>
          <div className="blood-box">B+</div>
          <div className="blood-arrow">→</div>
          <div className="blood-box">AB+</div>

        </div>

      </section>

      {/* ================= WHY BLOODBRIDGE ================= */}

      <section
        className="why-section"
        id="about"
      >

        <div className="section-heading animate-on-scroll">
          <p>Why BloodBridge?</p>
          <h2>Technology with a Human Purpose</h2>
        </div>

        <div className="why-grid">

          <div className="why-card animate-on-scroll">
            <span>🧠</span>
            <h3>Smart Matching</h3>
            <p>
              Find compatible blood groups automatically.
            </p>
          </div>

          <div className="why-card animate-on-scroll">
            <span>📍</span>
            <h3>Location Based</h3>
            <p>
              Discover blood requests in your city.
            </p>
          </div>

          <div className="why-card animate-on-scroll">
            <span>⚡</span>
            <h3>Quick Response</h3>
            <p>
              Donors can respond quickly to urgent requests.
            </p>
          </div>

          <div className="why-card animate-on-scroll">
            <span>🔒</span>
            <h3>Secure</h3>
            <p>
              User accounts and requests are protected.
            </p>
          </div>

        </div>

      </section>

      {/* ================= CTA ================= */}

      <section className="cta-section animate-on-scroll">

        <div>
          <p>Someone may need your blood right now.</p>

          <h2>
            Your donation could save a life. ❤️
          </h2>
        </div>

        <div className="cta-buttons">

          <button
            onClick={() => navigate("/login")}
          >
            Request Blood
          </button>

          <button
            onClick={() => navigate("/register")}
          >
            Donate Blood
          </button>

        </div>

      </section>

      {/* ================= FOOTER ================= */}

      {/* ================= FOOTER ================= */}

<footer className="footer">

  <div className="footer-container">

    {/* Brand */}
    <div className="footer-brand">

      <h2>
        <span>🩸</span> BloodBridge
      </h2>

      <p>
        Connecting blood donors with people in need.
        Together, we can make every drop count.
      </p>

    </div>


    {/* Quick Links */}
    <div className="footer-column">

      <h3>Quick Links</h3>

      <a href="#home">Home</a>
      <a href="#how-it-works">How It Works</a>
      <a href="#compatibility">Compatibility</a>
      <a href="#about">About Us</a>
      

    </div>


    {/* Get Started */}
    <div className="footer-column">

      <h3>Get Started</h3>

      <button onClick={() => navigate("/login")}>
        Request Blood
      </button>

      <button onClick={() => navigate("/register")}>
        Become a Donor
      </button>

    </div>

  </div>


  {/* Bottom */}
  <div className="footer-bottom">

    <p>
      © 2026 BloodBridge. All rights reserved.
    </p>

    <p>
      Connecting People. Saving Lives. ❤️
    </p>

  </div>

</footer>

    </div>
  );
}

export default Home;
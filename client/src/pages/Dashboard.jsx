import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [myRequests, setMyRequests] = useState([]);
  const [availableRequests, setAvailableRequests] = useState([]);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [showProfile, setShowProfile] = useState(false);

  const [availableToDonate, setAvailableToDonate] = useState(false);

  // =====================================================
  // LOAD USER
  // =====================================================

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (!token || !savedUser) {
      navigate("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setAvailableToDonate(parsedUser.availableToDonate || false);
      fetchBloodRequests(token);
      fetchUserProfile(token);
    } catch (error) {
      console.error("User parse error:", error);
      localStorage.removeItem("user");
      navigate("/login");
    }
  }, [navigate]);

  // =====================================================
  // FETCH BLOOD REQUESTS
  // =====================================================

  const fetchBloodRequests = async (token) => {
    try {
      const response = await fetch(
        "https://bloodbridge-938f.onrender.com/api/blood-requests",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message || "Failed to fetch blood requests"
        );
        return;
      }

      setMyRequests(data.myRequests || []);
      setAvailableRequests(data.availableRequests || []);
    } catch (error) {
      console.error("Fetch blood requests error:", error);

      setMessage("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // FETCH USER PROFILE
  // =====================================================

  const fetchUserProfile = async (token) => {
    try {
      const response = await fetch(
        "https://bloodbridge-938f.onrender.com/api/auth/profile",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok && data.user) {
        setUser(data.user);
        setAvailableToDonate(data.user.availableToDonate || false);
        localStorage.setItem("user", JSON.stringify(data.user));
      }
    } catch (error) {
      console.error("Fetch profile error:", error);
    }
  };

  // =====================================================
  // TOGGLE AVAILABILITY
  // =====================================================

  const handleToggleAvailability = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const newValue = !availableToDonate;
    
    // Optimistic update
    setAvailableToDonate(newValue);

    try {
      const response = await fetch(
        "https://bloodbridge-938f.onrender.com/api/auth/availability",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            availableToDonate: newValue,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update availability");
      }

      if (data.user) {
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
      }
    } catch (error) {
      console.error("Toggle availability error:", error);
      // Revert on error
      setAvailableToDonate(!newValue);
      alert(error.message || "Failed to update donor availability status.");
    }
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (!user) {
    return (
      <div className="dashboard-loading">
        Loading...
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="dashboard-page">

      {/* =================================================
          NAVBAR
      ================================================= */}

      <nav className="dashboard-navbar">

        {/* LOGO */}

        <div
          className="dashboard-logo"
          onClick={() => navigate("/")}
        >
          <span className="logo-drop">
            🩸
          </span>

          <span>
            BloodBridge
          </span>
        </div>

        {/* NAVIGATION */}

        <div className="dashboard-nav-links">

          <button
            className="nav-link active"
            onClick={() => navigate("/dashboard")}
          >
            Dashboard
          </button>

          <button
            className="nav-link"
            onClick={() => navigate("/blood-requests")}
          >
            Blood Requests
          </button>

          <button
            className="nav-link"
            onClick={() => navigate("/find-donors")}
          >
            Find Donors
          </button>

          <button
            className="nav-link"
            onClick={() => navigate("/my-requests")}
          >
            My Requests
          </button>

          <button
            className="nav-link"
            onClick={() =>
              navigate("/my-donor-responses")
            }
          >
            My Donations
          </button>

        </div>

        {/* RIGHT SIDE */}

        <div className="dashboard-nav-right">

          {/* AVAILABLE TO DONATE */}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <span
              style={{
                fontSize: "14px",
                fontWeight: "600",
                color: "#374151",
                whiteSpace: "nowrap",
              }}
            >
              🩸 Available to Donate
            </span>

            <button
              type="button"
              onClick={handleToggleAvailability}
              aria-label="Toggle donor availability"
              aria-pressed={availableToDonate}
              style={{
                position: "relative",
                width: "64px",
                height: "32px",
                borderRadius: "20px",
                border: "none",
                cursor: "pointer",
                padding: "0",
                backgroundColor: availableToDonate
                  ? "#22c55e"
                  : "#ef4444",
                transition:
                  "background-color 0.2s ease",
                boxShadow:
                  "inset 0 1px 3px rgba(0,0,0,0.2)",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  left: availableToDonate
                    ? "8px"
                    : "30px",
                  top: "7px",
                  color: "white",
                  fontSize: "11px",
                  fontWeight: "700",
                  transition: "left 0.2s ease",
                }}
              >
                {availableToDonate ? "ON" : "OFF"}
              </span>

              <span
                style={{
                  position: "absolute",
                  top: "4px",
                  left: availableToDonate
                    ? "36px"
                    : "4px",
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  backgroundColor: "white",
                  boxShadow:
                    "0 2px 5px rgba(0,0,0,0.25)",
                  transition: "left 0.2s ease",
                }}
              />
            </button>
          </div>

          {/* PROFILE */}

          <div className="profile-wrapper">

            <button
              className="profile-button"
              onClick={() =>
                setShowProfile(!showProfile)
              }
              title="Profile"
            >
              {user.name
                ? user.name.charAt(0).toUpperCase()
                : "U"}
            </button>

            {showProfile && (
              <div className="profile-dropdown">

                <div className="profile-header">

                  <div className="profile-avatar">
                    {user.name
                      ? user.name
                          .charAt(0)
                          .toUpperCase()
                      : "U"}
                  </div>

                  <div>
                    <h3>{user.name}</h3>

                    <p>{user.email}</p>
                  </div>

                </div>

                <div className="profile-divider" />

                <div className="profile-info">

                  <div className="profile-info-row">
                    <span>📧 Email</span>

                    <strong>
                      {user.email}
                    </strong>
                  </div>

                  <div className="profile-info-row">
                    <span>📱 Mobile</span>

                    <strong>
                      {user.mobile ||
                        "Not available"}
                    </strong>
                  </div>

                  <div className="profile-info-row">
                    <span>🩸 Blood Group</span>

                    <strong>
                      {user.bloodGroup}
                    </strong>
                  </div>

                  <div className="profile-info-row">
                    <span>📍 City</span>

                    <strong>
                      {user.currentCity ||
                        user.city}
                    </strong>
                  </div>

                  <div className="profile-info-row">
                    <span>📮 PIN Code</span>

                    <strong>
                      {user.currentPinCode ||
                        user.pinCode}
                    </strong>
                  </div>

                </div>

                <div className="profile-divider" />

                <div className="profile-stats">

                  <div className="profile-stat">
                    <strong>
                      {myRequests.length}
                    </strong>

                    <span>
                      Requests Created
                    </span>
                  </div>

                  <div className="profile-stat">
                    <strong>—</strong>

                    <span>
                      Blood Donated
                    </span>
                  </div>

                </div>

                <button
                  className="profile-page-button"
                  onClick={() => {
                    setShowProfile(false);
                    navigate("/profile");
                  }}
                >
                  View Full Profile
                </button>

              </div>
            )}

          </div>

          {/* LOGOUT */}

          <button
            className="logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </nav>

      {/* =================================================
          DASHBOARD CONTENT
      ================================================= */}

      <main className="dashboard-content">

        {/* WELCOME */}

        <section className="welcome-section">

          <div>
            <h1>
              Welcome, {user.name} 👋
            </h1>

            <p>
              Help save lives by donating blood
              or requesting blood when needed.
            </p>
          </div>

        </section>

        {/* QUICK STATS */}

        <section className="dashboard-stats">

          <div className="stat-card">

            <div className="stat-icon">
              🩸
            </div>

            <div>
              <span>Blood Group</span>

              <strong>
                {user.bloodGroup}
              </strong>
            </div>

          </div>

          <div
            className="stat-card"
            onClick={() =>
              navigate("/my-requests")
            }
            style={{ cursor: "pointer" }}
          >
            <div className="stat-icon">
              📋
            </div>

            <div>
              <span>My Requests</span>

              <strong>
                {myRequests.length}
              </strong>
            </div>
          </div>

          <div
            className="stat-card"
            onClick={() =>
              navigate("/blood-requests")
            }
            style={{ cursor: "pointer" }}
          >
            <div className="stat-icon">
              🔍
            </div>

            <div>
              <span>Available Requests</span>

              <strong>
                {availableRequests.length}
              </strong>
            </div>
          </div>

          <div className="stat-card">

            <div className="stat-icon">
              📍
            </div>

            <div>
              <span>City</span>

              <strong>
                {user.currentCity ||
                  user.city}
              </strong>
            </div>

          </div>

        </section>

        {/* DONOR SECTION */}

        <section
          style={{
            marginTop: "25px",
            background: "white",
            padding: "24px",
            borderRadius: "14px",
            boxShadow:
              "0 2px 10px rgba(0,0,0,0.06)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "20px",
              flexWrap: "wrap",
            }}
          >
            <div>

              <h2
                style={{
                  margin: "0 0 8px",
                }}
              >
                My Donation Responses
              </h2>

              <p
                style={{
                  margin: 0,
                  color: "#6b7280",
                }}
              >
                Check your blood donation responses,
                acceptance status and eligibility.
              </p>

            </div>

            <button
              onClick={() =>
                navigate("/my-donor-responses")
              }
              style={{
                padding: "12px 20px",
                background: "#dc2626",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              👥 My Donation Responses
            </button>

          </div>
        </section>

        {/* ACTIONS */}

        <section className="dashboard-actions">

          <button
            className="primary-action"
            onClick={() =>
              navigate("/blood-request")
            }
          >
            🩸 Create Blood Request
          </button>

          <button
            className="secondary-action"
            onClick={() =>
              navigate("/find-donors")
            }
          >
            🔍 Find Donors
          </button>

        </section>

        {/* MY REQUESTS */}

        <section className="requests-section">

          <div className="section-heading">

            <div>
              <h2>
                My Blood Requests
              </h2>

              <p>
                Blood requests created by you
              </p>
            </div>

            {myRequests.length > 0 && (
              <button
                onClick={() =>
                  navigate("/my-requests")
                }
              >
                View All
              </button>
            )}

          </div>

          {loading && (
            <div className="empty-card">
              Loading requests...
            </div>
          )}

          {!loading &&
            myRequests.length === 0 && (
              <div className="empty-card">

                <div className="empty-icon">
                  🩸
                </div>

                <h3>
                  No Blood Requests Yet
                </h3>

                <p>
                  You haven't created any blood
                  requests.
                </p>

                <button
                  onClick={() =>
                    navigate("/blood-request")
                  }
                >
                  Create Request
                </button>

              </div>
            )}

          {!loading &&
            myRequests.length > 0 &&
            myRequests.slice(0, 3).map((request) => (
              <div
                className="request-card"
                key={request._id}
              >

                <div className="request-card-header">

                  <div>
                    <h3>
                      {request.patientName}
                    </h3>

                    <span>
                      {request.hospital}
                    </span>
                  </div>

                  <span
                    className={`status-badge ${
                      request.status
                        ?.toLowerCase()
                        .replace(" ", "-")
                    }`}
                  >
                    {request.status}
                  </span>

                </div>

                <div className="request-details">

                  <div>
                    <span>Blood Group</span>

                    <strong>
                      {request.bloodGroup}
                    </strong>
                  </div>

                  <div>
                    <span>Units</span>

                    <strong>
                      {request.unitsRequired}
                    </strong>
                  </div>

                  <div>
                    <span>Urgency</span>

                    <strong>
                      {request.urgency}
                    </strong>
                  </div>

                  <div>
                    <span>City</span>

                    <strong>
                      {request.city}
                    </strong>
                  </div>

                </div>

                <button
                  className="view-request-button"
                  onClick={() =>
                    navigate(
                      `/blood-request/${request._id}/responses`
                    )
                  }
                >
                  View Donors
                </button>

              </div>
            ))}

        </section>

        {/* AVAILABLE REQUESTS */}

        <section className="requests-section">

          <div className="section-heading">

            <div>
              <h2>
                Blood Requests For You
              </h2>

              <p>
                Compatible blood requests in
                your city
              </p>
            </div>

          </div>

          {!loading &&
            availableRequests.length === 0 && (
              <div className="empty-card">

                <div className="empty-icon">
                  🔍
                </div>

                <h3>
                  No Compatible Requests
                </h3>

                <p>
                  Currently there are no compatible
                  blood requests in your city.
                </p>

              </div>
            )}

          {!loading &&
            availableRequests
              .slice(0, 3)
              .map((request) => (
                <div
                  className="request-card"
                  key={request._id}
                >

                  <div className="request-card-header">

                    <div>
                      <h3>
                        {request.patientName}
                      </h3>

                      <span>
                        {request.hospital}
                      </span>
                    </div>

                    <span className="urgency-badge">
                      {request.urgency}
                    </span>

                  </div>

                  <div className="request-details">

                    <div>
                      <span>
                        Blood Required
                      </span>

                      <strong>
                        {request.bloodGroup}
                      </strong>
                    </div>

                    <div>
                      <span>Units</span>

                      <strong>
                        {request.unitsRequired}
                      </strong>
                    </div>

                    <div>
                      <span>City</span>

                      <strong>
                        {request.city}
                      </strong>
                    </div>

                  </div>

                  <button
                    className="respond-button"
                    onClick={() =>
                      navigate(
                        `/blood-request/${request._id}/respond`
                      )
                    }
                  >
                    Respond / Donate
                  </button>

                </div>
              ))}

        </section>

        {/* ERROR MESSAGE */}

        {message && (
          <div className="dashboard-error">
            {message}
          </div>
        )}

      </main>

    </div>
  );
}

export default Dashboard;
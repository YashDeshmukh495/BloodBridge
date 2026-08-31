import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  const [editingLocation, setEditingLocation] = useState(false);

  const [locationData, setLocationData] = useState({
    city: "",
    pinCode: ""
  });

  const [locationMessage, setLocationMessage] = useState("");
  const [locationLoading, setLocationLoading] = useState(false);

  // ======================================================
  // LOAD USER
  // ======================================================

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
      setLocationData({
        city: parsedUser.currentCity || parsedUser.city || "",
        pinCode: parsedUser.currentPinCode || parsedUser.pinCode || ""
      });
      fetchUserProfile(token);
    } catch (error) {
      console.error(error);
      navigate("/login");
    }
  }, [navigate]);

  const fetchUserProfile = async (token) => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/profile",
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
        localStorage.setItem("user", JSON.stringify(data.user));
        setLocationData({
          city: data.user.currentCity || data.user.city || "",
          pinCode: data.user.currentPinCode || data.user.pinCode || ""
        });
      }
    } catch (error) {
      console.error("Fetch profile error:", error);
    }
  };


  // ======================================================
  // LOCATION INPUT CHANGE
  // ======================================================

  const handleLocationChange = (e) => {
    setLocationData({
      ...locationData,
      [e.target.name]: e.target.value
    });
  };


  // ======================================================
  // UPDATE LOCATION
  // ======================================================

  const handleUpdateLocation = async (e) => {
    e.preventDefault();

    setLocationMessage("");

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    // ================= VALIDATION =================

    if (!locationData.city.trim()) {
      setLocationMessage("Please enter your city");
      return;
    }

    if (!/^\d{6}$/.test(locationData.pinCode)) {
      setLocationMessage(
        "Please enter a valid 6-digit PIN code"
      );
      return;
    }

    setLocationLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/update-location",
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },

          body: JSON.stringify({
            city: locationData.city.trim(),
            pinCode: locationData.pinCode
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setLocationMessage(
          data.message || "Failed to update location"
        );
        return;
      }

      // ================= UPDATE LOCAL USER =================

      const updatedUser = {
        ...user,

        currentCity: data.user.currentCity,
        currentPinCode: data.user.currentPinCode,

        // Keep registration location unchanged
        city: data.user.city,
        pinCode: data.user.pinCode
      };

      setUser(updatedUser);

      localStorage.setItem(
        "user",
        JSON.stringify(updatedUser)
      );

      setLocationData({
        city: data.user.currentCity,
        pinCode: data.user.currentPinCode
      });

      setEditingLocation(false);

      setLocationMessage(
        "Current location updated successfully"
      );

    } catch (error) {
      console.error(
        "Update location error:",
        error
      );

      setLocationMessage(
        "Unable to connect to server"
      );
    } finally {
      setLocationLoading(false);
    }
  };


  // ======================================================
  // LOADING
  // ======================================================

  if (!user) {
    return (
      <div className="profile-loading">
        Loading...
      </div>
    );
  }


  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="profile-page">

      {/* ================= NAVBAR ================= */}

      <nav className="profile-navbar">

        <div
          className="profile-logo"
          onClick={() => navigate("/")}
        >
          <span>🩸</span>
          <strong>BloodBridge</strong>
        </div>

        <button
          className="back-dashboard"
          onClick={() => navigate("/dashboard")}
        >
          ← Dashboard
        </button>

      </nav>


      {/* ================= PROFILE CONTENT ================= */}

      <main className="profile-content">

        <div className="profile-card">

          {/* ================= PROFILE HEADER ================= */}

          <div className="profile-top">

            <div className="profile-avatar-large">
              {user.name
                ? user.name.charAt(0).toUpperCase()
                : "U"}
            </div>

            <div>
              <h1>{user.name}</h1>

              <p>
                BloodBridge Member
              </p>
            </div>

          </div>


          {/* ================= PERSONAL INFORMATION ================= */}

          <div className="profile-section">

            <h2>Personal Information</h2>

            <div className="profile-grid">

              <div className="profile-field">
                <span>📧 Email</span>
                <strong>{user.email}</strong>
              </div>

              <div className="profile-field">
                <span>📱 Mobile Number</span>

                <strong>
                  {user.mobile || "Not available"}
                </strong>
              </div>

              <div className="profile-field">
                <span>🩸 Blood Group</span>

                <strong>
                  {user.bloodGroup}
                </strong>
              </div>

              <div className="profile-field">
                <span>🏠 Registration City</span>

                <strong>
                  {user.city}
                </strong>
              </div>

              <div className="profile-field">
                <span>📮 Registration PIN</span>

                <strong>
                  {user.pinCode}
                </strong>
              </div>

            </div>

          </div>


          {/* ================= ACTIVITY ================= */}

          <div className="profile-section">

            <h2>My Activity</h2>

            <div className="activity-grid">

              <div className="activity-card">
                <span>🩸</span>

                <strong>{user.donationsCount || 0}</strong>

                <p>
                  Blood Donations
                </p>
              </div>

              <div className="activity-card">
                <span>📋</span>

                <strong>{user.requestsCreatedCount || 0}</strong>

                <p>
                  Requests Created
                </p>
              </div>

              <div className="activity-card">
                <span>❤️</span>

                <strong>{user.donationsCount || 0}</strong>

                <p>
                  People Helped
                </p>
              </div>

            </div>

          </div>


          {/* ================= BLOOD DONATION ACTIVITY ================= */}

          <div className="profile-section">

            <h2>Blood Donation Activity</h2>

            <div className="profile-grid">

              <div className="profile-field">
                <span>Blood Donated</span>
                <strong>{user.donationsCount || 0}</strong>
              </div>

              <div className="profile-field">
                <span>Blood Received</span>
                <strong>{user.bloodReceivedCount || 0}</strong>
              </div>

            </div>

          </div>


          {/* ================= CURRENT LOCATION ================= */}

          <div className="profile-section">

            <h2>Current Location</h2>

            {!editingLocation ? (

              <div className="location-box">

                <div>
                  <span>📍</span>

                  <div>

                    <strong>
                      {user.currentCity ||
                        user.city}
                    </strong>

                    <p>
                      {user.currentPinCode ||
                        user.pinCode}
                    </p>

                  </div>
                </div>

                <button
                  onClick={() => {
                    setLocationMessage("");

                    setLocationData({
                      city:
                        user.currentCity ||
                        user.city,

                      pinCode:
                        user.currentPinCode ||
                        user.pinCode
                    });

                    setEditingLocation(true);
                  }}
                >
                  Edit Location
                </button>

              </div>

            ) : (

              <form
                className="location-box"
                onSubmit={handleUpdateLocation}
              >

                <div className="location-edit-fields">

                  <div>
                    <label>
                      Current City
                    </label>

                    <input
                      type="text"
                      name="city"
                      placeholder="Enter your current city"
                      value={locationData.city}
                      onChange={handleLocationChange}
                    />
                  </div>


                  <div>
                    <label>
                      Current PIN Code
                    </label>

                    <input
                      type="text"
                      name="pinCode"
                      placeholder="Enter 6-digit PIN"
                      maxLength="6"
                      value={locationData.pinCode}
                      onChange={handleLocationChange}
                    />
                  </div>

                </div>


                <div className="location-actions">

                  <button
                    type="submit"
                    disabled={locationLoading}
                  >
                    {locationLoading
                      ? "Saving..."
                      : "Save Location"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingLocation(false);
                      setLocationMessage("");
                    }}
                  >
                    Cancel
                  </button>

                </div>

              </form>

            )}


            {/* ================= LOCATION MESSAGE ================= */}

            {locationMessage && (
              <p
                style={{
                  marginTop: "10px",
                  color:
                    locationMessage.includes(
                      "successfully"
                    )
                      ? "green"
                      : "red"
                }}
              >
                {locationMessage}
              </p>
            )}

          </div>


          {/* ================= BACK ================= */}

          <button
            className="profile-dashboard-button"
            onClick={() => navigate("/dashboard")}
          >
            ← Back to Dashboard
          </button>

        </div>

      </main>

    </div>
  );
}

export default Profile;
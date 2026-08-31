import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function FindDonors() {
  const navigate = useNavigate();

  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [bloodGroup, setBloodGroup] = useState("");
  const [city, setCity] = useState("");

  // ======================================================
  // INITIAL LOAD
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
      // Pre-fill search filters with logged-in user's profile defaults
      setBloodGroup(parsedUser.bloodGroup || "");
      setCity(parsedUser.currentCity || parsedUser.city || "");
      
      // Initial fetch
      fetchDonors(parsedUser.bloodGroup || "", parsedUser.currentCity || parsedUser.city || "", token);
    } catch (e) {
      console.error(e);
      navigate("/login");
    }
  }, [navigate]);

  // ======================================================
  // FETCH COMPATIBLE DONORS
  // ======================================================

  const fetchDonors = async (bgFilter, cityFilter, token) => {
    try {
      setLoading(true);
      setMessage("");

      const activeToken = token || localStorage.getItem("token");
      if (!activeToken) {
        navigate("/login");
        return;
      }

      // Build query params
      const params = new URLSearchParams();
      if (bgFilter) params.append("bloodGroup", bgFilter);
      if (cityFilter) params.append("city", cityFilter);

      const response = await fetch(
        `http://localhost:5000/api/auth/donors?${params.toString()}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${activeToken}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to fetch donors");
        return;
      }

      setDonors(data.donors || []);
    } catch (error) {
      console.error("Fetch donors error:", error);
      setMessage("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchDonors(bloodGroup, city);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "30px",
        background: "#f8fafc",
        fontFamily: "'Inter', sans-serif"
      }}
    >
      {/* ==================================================
          HEADER
      ================================================== */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px"
        }}
      >
        <div>
          <h1 style={{ margin: "0 0 5px", fontSize: "28px", color: "#111827" }}>
            Find Compatible Donors
          </h1>
          <p style={{ margin: 0, color: "#4b5563" }}>
            Search for available, compatible blood donors in your city
          </p>
        </div>

        <button
          onClick={() => navigate("/dashboard")}
          style={{
            padding: "10px 18px",
            background: "#ffffff",
            color: "#374151",
            border: "1px solid #d1d5db",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "600",
            transition: "all 0.2s"
          }}
        >
          ← Dashboard
        </button>
      </div>

      {/* ==================================================
          FILTER CARD
      ================================================== */}

      <form
        onSubmit={handleSearch}
        style={{
          background: "white",
          padding: "20px 25px",
          borderRadius: "14px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
          display: "flex",
          flexWrap: "wrap",
          gap: "20px",
          alignItems: "flex-end",
          marginBottom: "30px"
        }}
      >
        <div style={{ flex: "1 1 200px" }}>
          <label
            style={{
              display: "block",
              fontWeight: "600",
              color: "#374151",
              marginBottom: "8px",
              fontSize: "14px"
            }}
          >
            Required Blood Group
          </label>
          <select
            value={bloodGroup}
            onChange={(e) => setBloodGroup(e.target.value)}
            style={{
              width: "100%",
              padding: "11px",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              outline: "none",
              fontSize: "14px"
            }}
          >
            <option value="">All Blood Groups</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </select>
        </div>

        <div style={{ flex: "1 1 200px" }}>
          <label
            style={{
              display: "block",
              fontWeight: "600",
              color: "#374151",
              marginBottom: "8px",
              fontSize: "14px"
            }}
          >
            City
          </label>
          <input
            type="text"
            placeholder="Search by city..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "11px",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              outline: "none",
              fontSize: "14px"
            }}
          />
        </div>

        <button
          type="submit"
          style={{
            padding: "11px 25px",
            background: "#dc2626",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "600",
            fontSize: "14px",
            minWidth: "120px"
          }}
        >
          🔍 Search
        </button>
      </form>

      {/* ==================================================
          ERROR MESSAGE
      ================================================== */}

      {message && (
        <div
          style={{
            padding: "12px",
            background: "#fee2e2",
            color: "#991b1b",
            borderRadius: "8px",
            marginBottom: "20px",
            fontWeight: "500"
          }}
        >
          {message}
        </div>
      )}

      {/* ==================================================
          LOADING
      ================================================== */}

      {loading && (
        <div style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>
          Searching for compatible donors...
        </div>
      )}

      {/* ==================================================
          NO DONORS FOUND
      ================================================== */}

      {!loading && donors.length === 0 && (
        <div
          style={{
            background: "white",
            padding: "50px",
            borderRadius: "14px",
            textAlign: "center",
            boxShadow: "0 2px 10px rgba(0,0,0,0.05)"
          }}
        >
          <div style={{ fontSize: "50px", marginBottom: "15px" }}>👥</div>
          <h2 style={{ color: "#374151" }}>No Compatible Donors</h2>
          <p style={{ color: "#6b7280", margin: "10px 0 0" }}>
            Try adjusting your search criteria or checking back later.
          </p>
        </div>
      )}

      {/* ==================================================
          DONORS LIST
      ================================================== */}

      {!loading && donors.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "20px"
          }}
        >
          {donors.map((donor) => (
            <div
              key={donor._id}
              style={{
                background: "white",
                padding: "20px",
                borderRadius: "14px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between"
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start"
                  }}
                >
                  <h3 style={{ margin: "0 0 5px", color: "#111827" }}>
                    {donor.name}
                  </h3>
                  <span
                    style={{
                      background: "#fee2e2",
                      color: "#dc2626",
                      padding: "4px 10px",
                      borderRadius: "20px",
                      fontSize: "12px",
                      fontWeight: "700"
                    }}
                  >
                    🩸 {donor.bloodGroup}
                  </span>
                </div>

                <p style={{ margin: "5px 0", color: "#4b5563", fontSize: "14px" }}>
                  📍 {donor.currentCity || donor.city}
                </p>

                <div
                  style={{
                    marginTop: "15px",
                    padding: "10px",
                    background: "#f9fafb",
                    borderRadius: "8px",
                    fontSize: "13px"
                  }}
                >
                  <div style={{ display: "flex", gap: "5px", marginBottom: "5px" }}>
                    <strong style={{ color: "#374151" }}>📞 Mobile:</strong>
                    <span style={{ color: "#4b5563" }}>{donor.mobile}</span>
                  </div>
                  <div style={{ display: "flex", gap: "5px" }}>
                    <strong style={{ color: "#374151" }}>✉ Email:</strong>
                    <span style={{ color: "#4b5563" }}>{donor.email}</span>
                  </div>
                </div>
              </div>

              <span
                style={{
                  display: "inline-block",
                  marginTop: "15px",
                  fontSize: "12px",
                  color: "#16a34a",
                  fontWeight: "600"
                }}
              >
                ● Available to Donate
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FindDonors;

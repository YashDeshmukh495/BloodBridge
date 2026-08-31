import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function AvailableRequests() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // ======================================================
  // FETCH AVAILABLE REQUESTS
  // ======================================================

  const fetchAvailableRequests = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(
        "https://bloodbridge-938f.onrender.com/api/blood-requests",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message || "Failed to fetch blood requests"
        );
        return;
      }

      setRequests(data.availableRequests || []);

    } catch (error) {
      console.error(
        "Fetch available requests error:",
        error
      );

      setMessage("Unable to connect to server");

    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // LOAD REQUESTS
  // ======================================================

  useEffect(() => {
    fetchAvailableRequests();
  }, []);

  // ======================================================
  // PAGE
  // ======================================================

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "30px",
        background: "#f8fafc"
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
          <h1>
            Available Blood Requests
          </h1>

          <p>
            Blood requests that you can help with
          </p>
        </div>

        <button
          onClick={() =>
            navigate("/dashboard")
          }
        >
          ← Dashboard
        </button>

      </div>


      {/* ==================================================
          MESSAGE
      ================================================== */}

      {message && (
        <div
          style={{
            padding: "12px",
            marginBottom: "20px",
            background: "#fee2e2",
            color: "#991b1b",
            borderRadius: "8px"
          }}
        >
          {message}
        </div>
      )}


      {/* ==================================================
          LOADING
      ================================================== */}

      {loading && (
        <div>
          Finding compatible blood requests...
        </div>
      )}


      {/* ==================================================
          NO REQUESTS
      ================================================== */}

      {!loading &&
        requests.length === 0 && (

          <div
            style={{
              background: "white",
              padding: "50px",
              borderRadius: "14px",
              textAlign: "center",
              boxShadow:
                "0 2px 10px rgba(0,0,0,0.08)"
            }}
          >

            <div
              style={{
                fontSize: "50px",
                marginBottom: "15px"
              }}
            >
              🩸
            </div>

            <h2>
              No Available Requests
            </h2>

            <p>
              Currently there are no compatible
              blood requests in your current city.
            </p>

          </div>
        )}


      {/* ==================================================
          REQUEST LIST
      ================================================== */}

      {!loading &&
        requests.length > 0 && (

          <div
            style={{
              display: "grid",
              gap: "20px"
            }}
          >

            {requests.map((request) => (

              <div
                key={request._id}
                style={{
                  background: "white",
                  padding: "25px",
                  borderRadius: "14px",
                  boxShadow:
                    "0 2px 10px rgba(0,0,0,0.08)"
                }}
              >

                {/* ==================================================
                    HEADER
                ================================================== */}

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >

                  <div>

                    <h2>
                      {request.patientName}
                    </h2>

                    <p>
                      🏥 {request.hospital}
                    </p>

                  </div>


                  <span
                    style={{
                      padding: "7px 12px",
                      borderRadius: "20px",
                      background: "#fee2e2",
                      color: "#dc2626",
                      fontWeight: "600"
                    }}
                  >
                    {request.urgency}
                  </span>

                </div>


                <hr />


                {/* ==================================================
                    REQUEST DETAILS
                ================================================== */}

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(150px, 1fr))",
                    gap: "20px",
                    margin: "20px 0"
                  }}
                >

                  <div>

                    <small>
                      Blood Group Required
                    </small>

                    <h3>
                      🩸 {request.bloodGroup}
                    </h3>

                  </div>


                  <div>

                    <small>
                      Units Required
                    </small>

                    <h3>
                      {request.unitsRequired}
                    </h3>

                  </div>


                  <div>

                    <small>
                      City
                    </small>

                    <h3>
                      📍 {request.city}
                    </h3>

                  </div>


                  <div>

                    <small>
                      Status
                    </small>

                    <h3>
                      {request.status}
                    </h3>

                  </div>

                </div>


                {/* ==================================================
                    DESCRIPTION
                ================================================== */}

                {request.description && (

                  <div
                    style={{
                      marginBottom: "20px"
                    }}
                  >

                    <strong>
                      Description
                    </strong>

                    <p>
                      {request.description}
                    </p>

                  </div>

                )}


                {/* ==================================================
                    RESPOND BUTTON
                ================================================== */}

                <button
                  onClick={() =>
                    navigate(
                      `/blood-request/${request._id}/respond`
                    )
                  }
                  style={{
                    background: "#dc2626",
                    color: "white",
                    border: "none",
                    padding: "12px 20px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "600"
                  }}
                >
                  🩸 Respond / Donate
                </button>

              </div>

            ))}

          </div>
        )}

    </div>
  );
}

export default AvailableRequests;
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function DonorResponses() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  // ======================================================
  // FETCH DONOR RESPONSES
  // ======================================================

  useEffect(() => {
    fetchDonorResponses();
  }, [id]);

  const fetchDonorResponses = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/blood-requests/${id}/responses`,
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
          data.message || "Failed to fetch donor responses"
        );
        return;
      }

      setResponses(data.responses || []);

    } catch (error) {
      console.error(
        "Fetch donor responses error:",
        error
      );

      setMessage(
        "Unable to connect to server"
      );
    } finally {
      setLoading(false);
    }
  };


  // ======================================================
  // ACCEPT / REJECT DONOR
  // ======================================================

  const updateDonorStatus = async (
    responseId,
    status
  ) => {

    const token =
      localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    const confirmAction = window.confirm(
      `Are you sure you want to ${status.toLowerCase()} this donor?`
    );

    if (!confirmAction) {
      return;
    }

    setActionLoading(responseId);
    setMessage("");

    try {

      const response = await fetch(
        `http://localhost:5000/api/donor-responses/response/${responseId}`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },

          body: JSON.stringify({
            status
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message ||
          `Unable to ${status.toLowerCase()} donor`
        );

        return;
      }

      // Update UI immediately
      setResponses((prevResponses) =>
        prevResponses.map((item) =>
          item._id === responseId
            ? {
                ...item,
                status: status
              }
            : item
        )
      );

      setMessage(
        `Donor ${status.toLowerCase()} successfully`
      );

    } catch (error) {

      console.error(
        "Update donor status error:",
        error
      );

      setMessage(
        "Unable to connect to server"
      );

    } finally {
      setActionLoading(null);
    }
  };


  // ======================================================
  // FORMAT MEMBER SINCE
  // ======================================================

  const formatDate = (date) => {

    if (!date) {
      return "Not available";
    }

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }
    );
  };


  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <div
        style={{
          padding: "40px",
          textAlign: "center"
        }}
      >
        <h2>Loading donor responses...</h2>
      </div>
    );
  }


  // ======================================================
  // PAGE
  // ======================================================

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f6f8fb",
        padding: "40px"
      }}
    >

      {/* ================= HEADER ================= */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px"
        }}
      >

        <div>
          <h1
            style={{
              margin: 0,
              fontSize: "38px"
            }}
          >
            Donor Responses
          </h1>

          <p
            style={{
              color: "#666",
              fontSize: "17px"
            }}
          >
            People willing to donate blood
            for your request
          </p>
        </div>


        <button
          onClick={() =>
            navigate("/my-requests")
          }
          style={{
            padding: "12px 20px",
            border: "1px solid #ccc",
            borderRadius: "8px",
            background: "white",
            cursor: "pointer",
            fontSize: "16px"
          }}
        >
          ← My Requests
        </button>

      </div>


      {/* ================= MESSAGE ================= */}

      {message && (
        <div
          style={{
            padding: "12px 16px",
            marginBottom: "20px",
            background: "#fff3f3",
            color: "#d71920",
            borderRadius: "8px"
          }}
        >
          {message}
        </div>
      )}


      {/* ================= NO DONORS ================= */}

      {responses.length === 0 && (
        <div
          style={{
            background: "white",
            padding: "40px",
            borderRadius: "15px",
            textAlign: "center"
          }}
        >
          <h2>No donors yet</h2>

          <p>
            No one has responded to this
            blood request yet.
          </p>
        </div>
      )}


      {/* ================= DONOR CARDS ================= */}

      {responses.map((response) => {

        const donor = response.donor;

        const stats =
          response.donorStats || {};

        return (
          <div
            key={response._id}
            style={{
              background: "white",
              borderRadius: "16px",
              padding: "28px",
              marginBottom: "25px",
              boxShadow:
                "0 5px 20px rgba(0,0,0,0.06)"
            }}
          >

            {/* ================= TOP ================= */}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start"
              }}
            >

              <div>

                <h2
                  style={{
                    margin: 0,
                    fontSize: "27px"
                  }}
                >
                  {donor?.name || "Unknown Donor"}
                </h2>

                <p
                  style={{
                    marginTop: "8px",
                    color: "#777"
                  }}
                >
                  🩸 {donor?.bloodGroup || "N/A"}
                </p>

              </div>


              {/* STATUS */}

              <span
                style={{
                  padding: "8px 18px",
                  borderRadius: "20px",
                  fontWeight: "bold",

                  background:
                    response.status === "Accepted"
                      ? "#d4edda"
                      : response.status === "Rejected"
                      ? "#f8d7da"
                      : "#fff3cd",

                  color:
                    response.status === "Accepted"
                      ? "#155724"
                      : response.status === "Rejected"
                      ? "#721c24"
                      : "#856404"
                }}
              >
                {response.status}
              </span>

            </div>


            <hr
              style={{
                margin: "25px 0",
                border: "none",
                borderTop: "1px solid #eee"
              }}
            />


            {/* ================= DONOR INFORMATION ================= */}

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(3, 1fr)",
                gap: "25px"
              }}
            >

              <div>
                <p
                  style={{
                    color: "#777",
                    marginBottom: "6px"
                  }}
                >
                  📧 Email
                </p>

                <strong>
                  {donor?.email || "N/A"}
                </strong>
              </div>


              <div>
                <p
                  style={{
                    color: "#777",
                    marginBottom: "6px"
                  }}
                >
                  📱 Mobile
                </p>

                <strong>
                  {response.status === "Accepted"
                    ? donor?.mobile || "N/A"
                    : "Available after acceptance"}
                </strong>
              </div>


              <div>
                <p
                  style={{
                    color: "#777",
                    marginBottom: "6px"
                  }}
                >
                  📍 Current City
                </p>

                <strong>
                  {donor?.currentCity ||
                    donor?.city ||
                    "N/A"}
                </strong>
              </div>

            </div>


            {/* ================= DONOR STATS ================= */}

            <h3
              style={{
                marginTop: "30px",
                marginBottom: "15px"
              }}
            >
              Donor Activity
            </h3>


            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(4, 1fr)",
                gap: "15px"
              }}
            >

              {/* BLOOD DONATIONS */}

              <div
                style={{
                  background: "#fff5f5",
                  padding: "18px",
                  borderRadius: "10px"
                }}
              >
                <strong
                  style={{
                    fontSize: "25px"
                  }}
                >
                  {stats.bloodDonations || 0}
                </strong>

                <p
                  style={{
                    margin: "5px 0 0",
                    color: "#666"
                  }}
                >
                  🩸 Blood Donations
                </p>
              </div>


              {/* PEOPLE HELPED */}

              <div
                style={{
                  background: "#f5f8ff",
                  padding: "18px",
                  borderRadius: "10px"
                }}
              >
                <strong
                  style={{
                    fontSize: "25px"
                  }}
                >
                  {stats.peopleHelped || 0}
                </strong>

                <p
                  style={{
                    margin: "5px 0 0",
                    color: "#666"
                  }}
                >
                  ❤️ People Helped
                </p>
              </div>


              {/* REQUESTS CREATED */}

              <div
                style={{
                  background: "#fffaf0",
                  padding: "18px",
                  borderRadius: "10px"
                }}
              >
                <strong
                  style={{
                    fontSize: "25px"
                  }}
                >
                  {stats.requestsCreated || 0}
                </strong>

                <p
                  style={{
                    margin: "5px 0 0",
                    color: "#666"
                  }}
                >
                  📋 Requests Created
                </p>
              </div>


              {/* MEMBER SINCE */}

              <div
                style={{
                  background: "#f5fff8",
                  padding: "18px",
                  borderRadius: "10px"
                }}
              >
                <strong
                  style={{
                    fontSize: "18px"
                  }}
                >
                  {formatDate(
                    stats.memberSince
                  )}
                </strong>

                <p
                  style={{
                    margin: "5px 0 0",
                    color: "#666"
                  }}
                >
                  📅 Member Since
                </p>
              </div>

            </div>


            {/* ================= ACTION BUTTONS ================= */}

            {response.status === "Pending" && (

              <div
                style={{
                  display: "flex",
                  gap: "15px",
                  marginTop: "30px"
                }}
              >

                <button
                  onClick={() =>
                    updateDonorStatus(
                      response._id,
                      "Accepted"
                    )
                  }
                  disabled={
                    actionLoading ===
                    response._id
                  }
                  style={{
                    padding: "13px 25px",
                    background: "#16a34a",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "16px",
                    fontWeight: "bold"
                  }}
                >
                  {actionLoading === response._id
                    ? "Updating..."
                    : "✓ Accept Donor"}
                </button>


                <button
                  onClick={() =>
                    updateDonorStatus(
                      response._id,
                      "Rejected"
                    )
                  }
                  disabled={
                    actionLoading ===
                    response._id
                  }
                  style={{
                    padding: "13px 25px",
                    background: "#dc2626",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "16px",
                    fontWeight: "bold"
                  }}
                >
                  {actionLoading === response._id
                    ? "Updating..."
                    : "✕ Reject Donor"}
                </button>

              </div>

            )}


            {/* ================= ACCEPTED ================= */}

            {response.status === "Accepted" && (
              <div
                style={{
                  marginTop: "25px",
                  padding: "15px",
                  background: "#ecfdf5",
                  color: "#166534",
                  borderRadius: "8px"
                }}
              >
                ✓ Donor accepted. You can now
                contact the donor.
              </div>
            )}


            {/* ================= REJECTED ================= */}

            {response.status === "Rejected" && (
              <div
                style={{
                  marginTop: "25px",
                  padding: "15px",
                  background: "#fef2f2",
                  color: "#991b1b",
                  borderRadius: "8px"
                }}
              >
                ✕ Donor has been rejected.
              </div>
            )}

          </div>
        );
      })}

    </div>
  );
}

export default DonorResponses;
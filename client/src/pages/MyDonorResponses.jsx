import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function MyDonorResponses() {
  const navigate = useNavigate();

  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // ======================================================
  // FETCH MY DONOR RESPONSES
  // ======================================================

  const fetchMyResponses = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(
        "https://bloodbridge-938f.onrender.com/api/blood-requests/my-responses",
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
          data.message ||
            "Failed to fetch your donation responses"
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
  // LOAD
  // ======================================================

  useEffect(() => {
    fetchMyResponses();
  }, []);

  // ======================================================
  // STATUS STYLE
  // ======================================================

  const getStatusStyle = (status) => {
    if (status === "Accepted") {
      return {
        background: "#dcfce7",
        color: "#166534"
      };
    }

    if (status === "Rejected") {
      return {
        background: "#fee2e2",
        color: "#991b1b"
      };
    }

    if (status === "Completed") {
      return {
        background: "#dbeafe",
        color: "#1e40af"
      };
    }

    return {
      background: "#fef3c7",
      color: "#92400e"
    };
  };

  // ======================================================
  // PAGE
  // ======================================================

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        padding: "30px"
      }}
    >

      {/* ==================================================
          HEADER
      ================================================== */}

      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto 30px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "20px",
          flexWrap: "wrap"
        }}
      >

        <div>

          <h1>
            My Donation Responses
          </h1>

          <p>
            Track the blood requests you responded to.
          </p>

        </div>


        <button
          onClick={() =>
            navigate("/dashboard")
          }
          style={{
            padding: "10px 16px",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer"
          }}
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
            maxWidth: "1000px",
            margin: "0 auto 20px",
            padding: "14px",
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
        <div
          style={{
            maxWidth: "1000px",
            margin: "0 auto",
            background: "white",
            padding: "40px",
            borderRadius: "14px",
            textAlign: "center"
          }}
        >
          Loading your donation responses...
        </div>
      )}


      {/* ==================================================
          EMPTY
      ================================================== */}

      {!loading &&
        responses.length === 0 && (

          <div
            style={{
              maxWidth: "1000px",
              margin: "0 auto",
              background: "white",
              padding: "50px",
              borderRadius: "14px",
              textAlign: "center",
              boxShadow:
                "0 2px 10px rgba(0,0,0,0.06)"
            }}
          >

            <div
              style={{
                fontSize: "50px"
              }}
            >
              🩸
            </div>

            <h2>
              No Donation Responses
            </h2>

            <p
              style={{
                color: "#6b7280"
              }}
            >
              You haven't responded to any blood
              requests yet.
            </p>

            <button
              onClick={() =>
                navigate("/blood-requests")
              }
              style={{
                marginTop: "15px",
                padding: "12px 20px",
                background: "#dc2626",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600"
              }}
            >
              Find Blood Requests
            </button>

          </div>

        )}


      {/* ==================================================
          RESPONSE LIST
      ================================================== */}

      {!loading &&
        responses.length > 0 && (

          <div
            style={{
              maxWidth: "1000px",
              margin: "0 auto",
              display: "grid",
              gap: "20px"
            }}
          >

            {responses.map((response) => {

              const request =
                response.bloodRequest;

              const statusStyle =
                getStatusStyle(
                  response.status
                );

              return (

                <div
                  key={response._id}
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
                      justifyContent:
                        "space-between",
                      alignItems: "center",
                      gap: "15px",
                      flexWrap: "wrap"
                    }}
                  >

                    <div>

                      <h2
                        style={{
                          margin: "0 0 6px"
                        }}
                      >
                        {request?.patientName ||
                          "Blood Request"}
                      </h2>

                      <p
                        style={{
                          margin: 0,
                          color: "#6b7280"
                        }}
                      >
                        🏥{" "}
                        {request?.hospital ||
                          "Hospital not available"}
                      </p>

                    </div>


                    <span
                      style={{
                        padding: "7px 14px",
                        borderRadius: "20px",
                        fontWeight: "700",
                        fontSize: "14px",
                        ...statusStyle
                      }}
                    >
                      {response.status}
                    </span>

                  </div>


                  <hr
                    style={{
                      margin: "20px 0",
                      border: "none",
                      borderTop:
                        "1px solid #e5e7eb"
                    }}
                  />


                  {/* ==================================================
                      REQUEST DETAILS
                  ================================================== */}

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(150px, 1fr))",
                      gap: "18px"
                    }}
                  >

                    <div>
                      <small>
                        Blood Group
                      </small>

                      <h3>
                        🩸{" "}
                        {request?.bloodGroup ||
                          "N/A"}
                      </h3>
                    </div>


                    <div>
                      <small>
                        Units Required
                      </small>

                      <h3>
                        {request?.unitsRequired ||
                          "N/A"}
                      </h3>
                    </div>


                    <div>
                      <small>
                        Urgency
                      </small>

                      <h3>
                        {request?.urgency ||
                          "N/A"}
                      </h3>
                    </div>


                    <div>
                      <small>
                        City
                      </small>

                      <h3>
                        📍{" "}
                        {request?.city ||
                          "N/A"}
                      </h3>
                    </div>

                  </div>


                  {/* ==================================================
                      DONOR MESSAGE
                  ================================================== */}

                  {response.message && (

                    <div
                      style={{
                        marginTop: "20px",
                        padding: "14px",
                        background: "#f8fafc",
                        borderRadius: "8px"
                      }}
                    >

                      <strong>
                        Your Message:
                      </strong>

                      <p
                        style={{
                          marginBottom: 0
                        }}
                      >
                        {response.message}
                      </p>

                    </div>

                  )}


                  {/* ==================================================
                      ACCEPTED
                  ================================================== */}

                  {response.status ===
                    "Accepted" && (

                    <div
                      style={{
                        marginTop: "20px",
                        padding: "18px",
                        background: "#ecfdf5",
                        borderRadius: "10px",
                        border:
                          "1px solid #bbf7d0"
                      }}
                    >

                      <h3
                        style={{
                          marginTop: 0,
                          color: "#166534"
                        }}
                      >
                        ✅ Your response was accepted
                      </h3>

                      {!response.eligibilityConfirmed ? (

                        <>

                          <p
                            style={{
                              color: "#374151"
                            }}
                          >
                            The request owner accepted
                            your donation response.
                            Please complete the health
                            eligibility form before
                            donating blood.
                          </p>

                          <button
                            onClick={() =>
                              navigate(
                                `/donor-eligibility/${response._id}`
                              )
                            }
                            style={{
                              padding:
                                "12px 20px",
                              background:
                                "#dc2626",
                              color: "white",
                              border: "none",
                              borderRadius:
                                "8px",
                              cursor:
                                "pointer",
                              fontWeight:
                                "600"
                            }}
                          >
                            🩸 Check Eligibility
                          </button>

                        </>

                      ) : response.isEligible ? (

                        <div>

                          <p
                            style={{
                              color:
                                "#166534",
                              fontWeight:
                                "600"
                            }}
                          >
                            ✅ You are eligible
                            for blood donation.
                          </p>

                          <p
                            style={{
                              color:
                                "#374151"
                            }}
                          >
                            The request owner can
                            now contact you for the
                            blood donation.
                          </p>

                        </div>

                      ) : (

                        <p
                          style={{
                            color: "#991b1b",
                            fontWeight: "600"
                          }}
                        >
                          ❌ You are not eligible
                          for this donation.
                        </p>

                      )}

                    </div>

                  )}


                  {/* ==================================================
                      COMPLETED
                  ================================================== */}

                  {response.status ===
                    "Completed" && (

                    <div
                      style={{
                        marginTop: "20px",
                        padding: "18px",
                        background: "#eff6ff",
                        borderRadius: "10px",
                        color: "#1e40af"
                      }}
                    >

                      <h3
                        style={{
                          marginTop: 0
                        }}
                      >
                        🎉 Donation Completed
                      </h3>

                      <p>
                        Thank you for donating
                        blood and helping save a life.
                      </p>

                      {response.donationDate && (

                        <p
                          style={{
                            marginBottom: 0
                          }}
                        >
                          <strong>
                            Donation Date:
                          </strong>{" "}
                          {new Date(
                            response.donationDate
                          ).toLocaleDateString()}
                        </p>

                      )}

                    </div>

                  )}


                  {/* ==================================================
                      REJECTED
                  ================================================== */}

                  {response.status ===
                    "Rejected" && (

                    <div
                      style={{
                        marginTop: "20px",
                        padding: "15px",
                        background: "#fef2f2",
                        borderRadius: "8px",
                        color: "#991b1b"
                      }}
                    >
                      ❌ Your donation response
                      was rejected for this request.
                    </div>

                  )}


                  {/* ==================================================
                      PENDING
                  ================================================== */}

                  {response.status ===
                    "Pending" && (

                    <div
                      style={{
                        marginTop: "20px",
                        padding: "15px",
                        background: "#fffbeb",
                        borderRadius: "8px",
                        color: "#92400e"
                      }}
                    >
                      ⏳ Waiting for the request
                      owner to accept your response.
                    </div>

                  )}

                </div>

              );
            })}

          </div>

        )}

    </div>
  );
}

export default MyDonorResponses;
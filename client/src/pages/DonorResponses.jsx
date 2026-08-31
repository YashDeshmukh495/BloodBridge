import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function DonorResponses() {
  const navigate = useNavigate();
  const { id: requestId } = useParams();

  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // ======================================================
  // FETCH DONOR RESPONSES
  // ======================================================

  const fetchResponses = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(
        `http://localhost:5000/api/blood-requests/${requestId}/responses`,
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
      console.error("Fetch responses error:", error);
      setMessage("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResponses();
  }, [requestId]);

  // ======================================================
  // ACCEPT / REJECT DONOR
  // ======================================================

  const updateDonorStatus = async (
    responseId,
    action
  ) => {
    try {
      setMessage("");

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(
        `http://localhost:5000/api/blood-requests/response/${responseId}/${action}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message ||
            `Failed to ${action} donor`
        );
        return;
      }

      setMessage(
        action === "accept"
          ? "Donor accepted successfully."
          : "Donor rejected successfully."
      );

      await fetchResponses();

    } catch (error) {
      console.error(
        `${action} donor error:`,
        error
      );

      setMessage("Unable to connect to server");
    }
  };

  // ======================================================
  // COMPLETE DONATION
  // ======================================================

  const completeDonation = async (
    responseId
  ) => {
    const confirmDonation =
      window.confirm(
        "Has the donor successfully donated blood?"
      );

    if (!confirmDonation) {
      return;
    }

    try {
      setMessage("");

      const token =
        localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(
        `http://localhost:5000/api/blood-requests/response/${responseId}/complete`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message ||
            "Failed to complete donation"
        );
        return;
      }

      setMessage(
        "Blood donation completed successfully."
      );

      await fetchResponses();

    } catch (error) {
      console.error(
        "Complete donation error:",
        error
      );

      setMessage(
        "Unable to connect to server"
      );
    }
  };

  // ======================================================
  // HELPERS
  // ======================================================

  const getDonorName = (response) => {
    return (
      response.donor?.name ||
      response.donor?.fullName ||
      "Donor"
    );
  };

  const getDonorMobile = (response) => {
    return (
      response.donor?.mobile ||
      response.donor?.phone ||
      response.donor?.phoneNumber ||
      "Not available"
    );
  };

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
            Donor Responses
          </h1>

          <p>
            People who responded to your blood request
          </p>
        </div>

        <button
          onClick={() =>
            navigate("/my-requests")
          }
          style={{
            padding: "10px 16px",
            cursor: "pointer"
          }}
        >
          ← My Requests
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
            background: "#fef2f2",
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
          Loading donor responses...
        </div>
      )}


      {/* ==================================================
          NO RESPONSES
      ================================================== */}

      {!loading &&
        responses.length === 0 && (
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
                fontSize: "50px"
              }}
            >
              🩸
            </div>

            <h2>
              No Donor Responses Yet
            </h2>

            <p>
              Donors who respond to your request
              will appear here.
            </p>
          </div>
        )}


      {/* ==================================================
          RESPONSES
      ================================================== */}

      {!loading &&
        responses.length > 0 && (

          <div
            style={{
              display: "grid",
              gap: "20px"
            }}
          >

            {responses.map((response) => {

              const status =
                response.status || "Pending";

              const donorName =
                getDonorName(response);

              const mobile =
                getDonorMobile(response);

              const eligible =
                response.isEligible === true;

              const eligibilitySubmitted =
                response.eligibilityConfirmed === true;

              const completed =
                status === "Completed";

              const accepted =
                status === "Accepted";

              const pending =
                status === "Pending";

              const rejected =
                status === "Rejected";

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

                  {/* ========================================
                      DONOR HEADER
                  ======================================== */}

                  <div
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      alignItems: "center"
                    }}
                  >

                    <div>
                      <h2>
                        {donorName}
                      </h2>

                      <p>
                        🩸{" "}
                        {response.donor?.bloodGroup ||
                          "Blood group unavailable"}
                      </p>

                      <p>
                        📍{" "}
                        {response.donor?.city ||
                          response.donor?.currentCity ||
                          "City unavailable"}
                      </p>
                    </div>


                    <span
                      style={{
                        padding: "7px 14px",
                        borderRadius: "20px",
                        fontWeight: "600",
                        background:
                          completed
                            ? "#dcfce7"
                            : accepted
                            ? "#dbeafe"
                            : rejected
                            ? "#fee2e2"
                            : "#fef3c7",
                        color:
                          completed
                            ? "#166534"
                            : accepted
                            ? "#1d4ed8"
                            : rejected
                            ? "#991b1b"
                            : "#92400e"
                      }}
                    >
                      {status}
                    </span>

                  </div>


                  <hr
                    style={{
                      margin: "20px 0"
                    }}
                  />


                  {/* ========================================
                      DONOR MESSAGE
                  ======================================== */}

                  {response.message && (
                    <div
                      style={{
                        marginBottom: "20px"
                      }}
                    >
                      <strong>
                        Donor Message
                      </strong>

                      <p>
                        {response.message}
                      </p>
                    </div>
                  )}


                  {/* ========================================
                      ACCEPTED
                  ======================================== */}

                  {accepted && (
                    <div
                      style={{
                        padding: "15px",
                        marginBottom: "20px",
                        background:
                          "#eff6ff",
                        borderRadius: "10px"
                      }}
                    >

                      <strong>
                        Donor Accepted
                      </strong>

                      {!eligibilitySubmitted && (
                        <p>
                          Waiting for donor to
                          complete the eligibility
                          form.
                        </p>
                      )}

                    </div>
                  )}


                  {/* ========================================
                      ELIGIBILITY RESULT
                  ======================================== */}

                  {eligibilitySubmitted && (
                    <div
                      style={{
                        padding: "18px",
                        marginBottom: "20px",
                        borderRadius: "10px",
                        background: eligible
                          ? "#dcfce7"
                          : "#fee2e2",
                        color: eligible
                          ? "#166534"
                          : "#991b1b"
                      }}
                    >

                      <h3
                        style={{
                          marginTop: 0
                        }}
                      >
                        {eligible
                          ? "✅ Donor is Eligible"
                          : "❌ Donor is Not Eligible"}
                      </h3>

                      {eligible ? (
                        <>
                          <p>
                            {donorName} is eligible
                            for blood donation.
                          </p>

                          <p>
                            <strong>
                              📞 Mobile:
                            </strong>{" "}
                            {mobile}
                          </p>

                          <p>
                            You can now contact the
                            donor and arrange the
                            blood donation.
                          </p>
                        </>
                      ) : (
                        <p>
                          This donor cannot donate
                          blood at this time.
                        </p>
                      )}

                    </div>
                  )}


                  {/* ========================================
                      COMPLETED DONATION
                  ======================================== */}

                  {completed && (
                    <div
                      style={{
                        padding: "18px",
                        marginBottom: "20px",
                        background: "#dcfce7",
                        color: "#166534",
                        borderRadius: "10px"
                      }}
                    >

                      <h3>
                        🩸 Blood Donation Completed
                      </h3>

                      <p>
                        Donation was successfully
                        completed.
                      </p>

                      {response.donationDate && (
                        <p>
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


                  {/* ========================================
                      ACTIONS
                  ======================================== */}

                  {pending && (
                    <div
                      style={{
                        display: "flex",
                        gap: "12px",
                        marginTop: "20px"
                      }}
                    >

                      <button
                        onClick={() =>
                          updateDonorStatus(
                            response._id,
                            "accept"
                          )
                        }
                        style={{
                          background: "#16a34a",
                          color: "white",
                          border: "none",
                          padding:
                            "11px 18px",
                          borderRadius: "8px",
                          cursor: "pointer",
                          fontWeight: "600"
                        }}
                      >
                        ✅ Accept
                      </button>


                      <button
                        onClick={() =>
                          updateDonorStatus(
                            response._id,
                            "reject"
                          )
                        }
                        style={{
                          background: "#dc2626",
                          color: "white",
                          border: "none",
                          padding:
                            "11px 18px",
                          borderRadius: "8px",
                          cursor: "pointer",
                          fontWeight: "600"
                        }}
                      >
                        ❌ Reject
                      </button>

                    </div>
                  )}


                  {/* ========================================
                      COMPLETE DONATION
                  ======================================== */}

                  {accepted &&
                    eligibilitySubmitted &&
                    eligible && (
                      <button
                        onClick={() =>
                          completeDonation(
                            response._id
                          )
                        }
                        style={{
                          width: "100%",
                          background: "#7c3aed",
                          color: "white",
                          border: "none",
                          padding: "13px 20px",
                          borderRadius: "8px",
                          cursor: "pointer",
                          fontWeight: "600",
                          fontSize: "15px"
                        }}
                      >
                        🩸 Complete Donation
                      </button>
                    )}


                  {/* ========================================
                      REJECTED
                  ======================================== */}

                  {rejected && (
                    <div
                      style={{
                        color: "#991b1b",
                        fontWeight: "600"
                      }}
                    >
                      This donor was rejected.
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

export default DonorResponses;
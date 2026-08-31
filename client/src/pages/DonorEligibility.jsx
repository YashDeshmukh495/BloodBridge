import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function DonorEligibility() {
  const navigate = useNavigate();
  const { responseId } = useParams();

  const [healthConfirmed, setHealthConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [eligible, setEligible] = useState(false);

  // ======================================================
  // SUBMIT DONOR ELIGIBILITY
  // ======================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setSuccess(false);

    // ----------------------------------------------------
    // HEALTH CHECK
    // ----------------------------------------------------

    if (!healthConfirmed) {
      setMessage(
        "Please confirm that you are currently healthy and able to donate blood."
      );
      return;
    }

    // ----------------------------------------------------
    // RESPONSE ID CHECK
    // ----------------------------------------------------

    if (!responseId) {
      setMessage(
        "Invalid donor response. Please try again."
      );
      return;
    }

    try {
      setLoading(true);

      const token =
        localStorage.getItem("token");

      // --------------------------------------------------
      // TOKEN CHECK
      // --------------------------------------------------

      if (!token) {
        navigate("/login");
        return;
      }

      // --------------------------------------------------
      // SUBMIT TO BACKEND
      // --------------------------------------------------

      const response = await fetch(
        `https://bloodbridge-938f.onrender.com/api/blood-requests/response/${responseId}/eligibility`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },

          body: JSON.stringify({
            healthConfirmed: true
          })
        }
      );

      const data = await response.json();

      // --------------------------------------------------
      // ERROR
      // --------------------------------------------------

      if (!response.ok) {
        setMessage(
          data.message ||
            "Unable to submit eligibility"
        );

        return;
      }

      // --------------------------------------------------
      // SUCCESS
      // --------------------------------------------------

      setEligible(
        data.isEligible === true
      );

      setSuccess(true);

      if (data.isEligible === true) {
        setMessage(
          "You are eligible for blood donation."
        );
      } else {
        setMessage(
          data.message ||
            "You are currently not eligible for blood donation."
        );
      }

    } catch (error) {
      console.error(
        "Eligibility submit error:",
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
  // PAGE
  // ======================================================

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        padding: "40px"
      }}
    >

      {/* ==================================================
          HEADER
      ================================================== */}

      <div
        style={{
          maxWidth: "650px",
          margin: "0 auto 30px"
        }}
      >

        <button
          onClick={() => navigate(-1)}
          style={{
            marginBottom: "20px",
            padding: "10px 16px",
            cursor: "pointer",
            border: "none",
            borderRadius: "8px",
            background: "#e5e7eb"
          }}
        >
          ← Back
        </button>

        <h1>
          Blood Donation Eligibility
        </h1>

        <p>
          Please confirm your health information
          before proceeding with blood donation.
        </p>

      </div>


      {/* ==================================================
          FORM CARD
      ================================================== */}

      <div
        style={{
          maxWidth: "650px",
          margin: "0 auto",
          background: "white",
          padding: "30px",
          borderRadius: "14px",
          boxShadow:
            "0 2px 10px rgba(0,0,0,0.08)"
        }}
      >

        {!success ? (

          <form onSubmit={handleSubmit}>

            <h2>
              Health Confirmation
            </h2>

            <p
              style={{
                color: "#555",
                lineHeight: "1.6"
              }}
            >
              Before donating blood, you must
              confirm that you are currently healthy
              and able to donate.
            </p>


            {/* ==================================================
                HEALTH CHECKBOX
            ================================================== */}

            <label
              style={{
                display: "flex",
                gap: "12px",
                alignItems: "flex-start",
                marginTop: "25px",
                cursor: "pointer"
              }}
            >

              <input
                type="checkbox"
                checked={healthConfirmed}
                onChange={(e) =>
                  setHealthConfirmed(
                    e.target.checked
                  )
                }
                style={{
                  marginTop: "5px"
                }}
              />

              <span>
                I confirm that I am currently healthy
                and do not have any condition that
                would prevent me from donating blood.
              </span>

            </label>


            {/* ==================================================
                ERROR MESSAGE
            ================================================== */}

            {message && (
              <div
                style={{
                  marginTop: "20px",
                  padding: "12px",
                  background: "#fee2e2",
                  color: "#991b1b",
                  borderRadius: "8px"
                }}
              >
                {message}
              </div>
            )}


            {/* ==================================================
                SUBMIT BUTTON
            ================================================== */}

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: "25px",
                width: "100%",
                padding: "13px",
                background: loading
                  ? "#9ca3af"
                  : "#dc2626",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: loading
                  ? "not-allowed"
                  : "pointer",
                fontWeight: "600",
                fontSize: "16px"
              }}
            >

              {loading
                ? "Checking Eligibility..."
                : "Submit Eligibility"}

            </button>

          </form>

        ) : (

          /* ==================================================
             ELIGIBILITY RESULT
          ================================================== */

          <div
            style={{
              textAlign: "center"
            }}
          >

            {/* ICON */}

            <div
              style={{
                fontSize: "60px",
                marginBottom: "15px"
              }}
            >
              {eligible
                ? "🩸"
                : "⚠️"}
            </div>


            {/* TITLE */}

            <h2>
              {eligible
                ? "You Are Eligible"
                : "Not Eligible"}
            </h2>


            {/* MESSAGE */}

            <p
              style={{
                fontSize: "16px",
                lineHeight: "1.6",
                color: "#555"
              }}
            >
              {message}
            </p>


            {/* ==================================================
                ELIGIBLE
            ================================================== */}

            {eligible && (

              <div
                style={{
                  marginTop: "20px",
                  padding: "15px",
                  background: "#dcfce7",
                  color: "#166534",
                  borderRadius: "8px"
                }}
              >

                <strong>
                  You are eligible to donate blood.
                </strong>

                <p
                  style={{
                    marginBottom: 0
                  }}
                >
                  Your eligibility has been submitted.
                  The blood request owner can now
                  contact you regarding the donation.
                </p>

              </div>

            )}


            {/* ==================================================
                NOT ELIGIBLE
            ================================================== */}

            {!eligible && (

              <div
                style={{
                  marginTop: "20px",
                  padding: "15px",
                  background: "#fee2e2",
                  color: "#991b1b",
                  borderRadius: "8px"
                }}
              >

                <strong>
                  You cannot donate at this time.
                </strong>

                <p
                  style={{
                    marginBottom: 0
                  }}
                >
                  Your eligibility result has been
                  recorded for this response.
                </p>

              </div>

            )}


            {/* ==================================================
                ELIGIBLE NEXT STEP
            ================================================== */}

            {eligible && (

              <button
                onClick={() =>
                  navigate("/dashboard")
                }
                style={{
                  marginTop: "25px",
                  padding: "12px 20px",
                  background: "#16a34a",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "600"
                }}
              >
                Continue to Dashboard
              </button>

            )}


            {/* ==================================================
                NOT ELIGIBLE NEXT STEP
            ================================================== */}

            {!eligible && (

              <button
                onClick={() =>
                  navigate("/dashboard")
                }
                style={{
                  marginTop: "25px",
                  padding: "12px 20px",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer"
                }}
              >
                ← Go to Dashboard
              </button>

            )}

          </div>

        )}

      </div>

    </div>
  );
}

export default DonorEligibility;
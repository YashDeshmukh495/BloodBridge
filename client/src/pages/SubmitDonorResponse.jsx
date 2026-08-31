import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function SubmitDonorResponse() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [message, setMessage] = useState("");
  const [lastDonationConfirmed, setLastDonationConfirmed] = useState(false);
  const [healthConfirmed, setHealthConfirmed] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    if (!lastDonationConfirmed || !healthConfirmed) {
      setError("Please confirm both statements before continuing.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch(
        `https://bloodbridge-938f.onrender.com/api/blood-requests/${id}/respond`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            message,
            lastDonationConfirmed,
            healthConfirmed
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Failed to submit donor response"
        );
        return;
      }

      navigate("/blood-requests");

    } catch (error) {
      console.error("Submit donor response error:", error);

      setError("Unable to connect to server");

    } finally {
      setSubmitting(false);
    }
  };

  const bothConfirmed =
    lastDonationConfirmed && healthConfirmed;

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        padding: "50px 20px"
      }}
    >
      <section
        style={{
          maxWidth: "680px",
          margin: "0 auto",
          background: "#ffffff",
          borderRadius: "18px",
          padding: "35px",
          boxShadow: "0 8px 30px rgba(0,0,0,0.08)"
        }}
      >

        {/* HEADER */}

        <div style={{ marginBottom: "30px" }}>

          <div
            style={{
              width: "55px",
              height: "55px",
              borderRadius: "14px",
              background: "#fee2e2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "28px",
              marginBottom: "18px"
            }}
          >
            🩸
          </div>

          <h1
            style={{
              margin: "0 0 8px",
              fontSize: "30px",
              color: "#111827"
            }}
          >
            Respond to Blood Request
          </h1>

          <p
            style={{
              margin: 0,
              color: "#6b7280",
              fontSize: "15px"
            }}
          >
            Confirm your eligibility before offering
            to donate blood.
          </p>

        </div>


        {/* ERROR */}

        {error && (
          <div
            style={{
              background: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#b91c1c",
              padding: "13px 15px",
              borderRadius: "10px",
              marginBottom: "22px",
              fontSize: "14px"
            }}
          >
            ⚠️ {error}
          </div>
        )}


        <form onSubmit={handleSubmit}>

          {/* MESSAGE */}

          <div style={{ marginBottom: "28px" }}>

            <label
              htmlFor="message"
              style={{
                display: "block",
                fontWeight: "600",
                color: "#374151",
                marginBottom: "8px"
              }}
            >
              Message{" "}
              <span
                style={{
                  color: "#9ca3af",
                  fontWeight: "400"
                }}
              >
                (optional)
              </span>
            </label>

            <textarea
              id="message"
              value={message}
              onChange={(event) =>
                setMessage(event.target.value)
              }
              rows="4"
              placeholder="Example: I can donate blood. Please contact me."
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "13px",
                border: "1px solid #d1d5db",
                borderRadius: "10px",
                resize: "vertical",
                fontSize: "14px",
                outline: "none"
              }}
            />

          </div>


          {/* ELIGIBILITY */}

          <div
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: "14px",
              padding: "22px",
              background: "#f9fafb",
              marginBottom: "28px"
            }}
          >

            <h2
              style={{
                margin: "0 0 6px",
                fontSize: "19px",
                color: "#111827"
              }}
            >
              Donor Eligibility
            </h2>

            <p
              style={{
                margin: "0 0 20px",
                color: "#6b7280",
                fontSize: "13px"
              }}
            >
              Please confirm both statements to continue.
            </p>


            {/* 60 DAYS */}

            <label
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "13px",
                padding: "15px",
                background: "#ffffff",
                border: lastDonationConfirmed
                  ? "1px solid #22c55e"
                  : "1px solid #e5e7eb",
                borderRadius: "10px",
                marginBottom: "12px",
                cursor: "pointer"
              }}
            >

              <input
                type="checkbox"
                checked={lastDonationConfirmed}
                onChange={(event) =>
                  setLastDonationConfirmed(
                    event.target.checked
                  )
                }
                style={{
                  width: "18px",
                  height: "18px",
                  marginTop: "2px",
                  accentColor: "#16a34a"
                }}
              />

              <div>

                <strong
                  style={{
                    display: "block",
                    color: "#111827",
                    marginBottom: "4px"
                  }}
                >
                  Donation interval
                </strong>

                <span
                  style={{
                    color: "#4b5563",
                    fontSize: "14px",
                    lineHeight: "1.5"
                  }}
                >
                  I confirm that my last blood donation
                  was at least 60 days ago.
                </span>

              </div>

            </label>


            {/* HEALTH */}

            <label
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "13px",
                padding: "15px",
                background: "#ffffff",
                border: healthConfirmed
                  ? "1px solid #22c55e"
                  : "1px solid #e5e7eb",
                borderRadius: "10px",
                cursor: "pointer"
              }}
            >

              <input
                type="checkbox"
                checked={healthConfirmed}
                onChange={(event) =>
                  setHealthConfirmed(
                    event.target.checked
                  )
                }
                style={{
                  width: "18px",
                  height: "18px",
                  marginTop: "2px",
                  accentColor: "#16a34a"
                }}
              />

              <div>

                <strong
                  style={{
                    display: "block",
                    color: "#111827",
                    marginBottom: "4px"
                  }}
                >
                  Health confirmation
                </strong>

                <span
                  style={{
                    color: "#4b5563",
                    fontSize: "14px",
                    lineHeight: "1.5"
                  }}
                >
                  I confirm that I am currently free from
                  any illness or health condition that would
                  prevent me from donating blood.
                </span>

              </div>

            </label>

          </div>


          {/* STATUS */}

          <div
            style={{
              textAlign: "center",
              marginBottom: "22px",
              color: bothConfirmed
                ? "#15803d"
                : "#6b7280",
              fontSize: "14px",
              fontWeight: "600"
            }}
          >
            {bothConfirmed
              ? "✓ You are ready to submit your response"
              : "Please confirm both eligibility statements"}
          </div>


          {/* BUTTONS */}

          <div
            style={{
              display: "flex",
              gap: "12px"
            }}
          >

            <button
              type="button"
              onClick={() =>
                navigate("/blood-requests")
              }
              disabled={submitting}
              style={{
                flex: 1,
                padding: "13px",
                background: "#ffffff",
                color: "#374151",
                border: "1px solid #d1d5db",
                borderRadius: "10px",
                cursor: submitting
                  ? "not-allowed"
                  : "pointer",
                fontWeight: "600"
              }}
            >
              Cancel
            </button>


            <button
              type="submit"
              disabled={
                submitting || !bothConfirmed
              }
              style={{
                flex: 1,
                padding: "13px",
                background: bothConfirmed
                  ? "#16a34a"
                  : "#d1d5db",
                color: "#ffffff",
                border: "none",
                borderRadius: "10px",
                cursor:
                  submitting || !bothConfirmed
                    ? "not-allowed"
                    : "pointer",
                fontWeight: "600"
              }}
            >
              {submitting
                ? "Submitting..."
                : "✓ Submit Response"}
            </button>

          </div>

        </form>

      </section>
    </main>
  );
}

export default SubmitDonorResponse;
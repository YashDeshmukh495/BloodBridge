import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function MyRequests() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // ======================================================
  // FETCH MY REQUESTS
  // ======================================================

  const fetchMyRequests = async () => {
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
          data.message || "Failed to fetch requests"
        );
        return;
      }

      setRequests(data.myRequests || []);

    } catch (error) {
      console.error(
        "Fetch my requests error:",
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
  // LOAD REQUESTS
  // ======================================================

  useEffect(() => {
    fetchMyRequests();
  }, []);


  // ======================================================
  // DELETE REQUEST
  // ======================================================

  const handleDelete = async (requestId) => {

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this blood request?"
    );

    if (!confirmDelete) {
      return;
    }

    try {

      const token =
        localStorage.getItem("token");

      const response = await fetch(
        `https://bloodbridge-938f.onrender.com/api/blood-requests/${requestId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        setMessage(
          data.message ||
          "Failed to delete request"
        );

        return;
      }


      // Remove deleted request
      setRequests((previousRequests) =>
        previousRequests.filter(
          (request) =>
            request._id !== requestId
        )
      );

      setMessage(
        "Blood request deleted successfully"
      );

    } catch (error) {

      console.error(
        "Delete request error:",
        error
      );

      setMessage(
        "Unable to connect to server"
      );
    }
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
            My Blood Requests
          </h1>

          <p>
            Blood requests created by you
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
          Loading your requests...
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
              padding: "40px",
              borderRadius: "12px",
              textAlign: "center"
            }}
          >

            <h2>
              No Blood Requests
            </h2>

            <p>
              You haven't created any blood
              requests yet.
            </p>

            <button
              onClick={() =>
                navigate("/blood-request")
              }
            >
              Create Blood Request
            </button>

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

                {/* HEADER */}

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
                      {request.patientName}
                    </h2>

                    <p>
                      🏥 {request.hospital}
                    </p>

                  </div>


                  <strong>
                    {request.status}
                  </strong>

                </div>


                <hr />


                {/* DETAILS */}

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(150px, 1fr))",
                    gap: "15px",
                    margin: "20px 0"
                  }}
                >

                  <div>
                    <small>
                      Blood Group
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
                      Urgency
                    </small>

                    <h3>
                      {request.urgency}
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

                </div>


                {/* DESCRIPTION */}

                {request.description && (
                  <p>
                    <strong>
                      Description:
                    </strong>{" "}
                    {request.description}
                  </p>
                )}


                {/* ==================================================
                    ACTION BUTTONS
                ================================================== */}

                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    marginTop: "20px"
                  }}
                >

                  <button
                    onClick={() =>
                      navigate(
                        `/blood-request/${request._id}/responses`
                      )
                    }
                  >
                    👥 View Donors
                  </button>


                  <button
                    onClick={() =>
                      handleDelete(
                        request._id
                      )
                    }
                    style={{
                      background: "#dc2626",
                      color: "white",
                      border: "none",
                      padding:
                        "10px 16px",
                      borderRadius: "8px",
                      cursor: "pointer"
                    }}
                  >
                    🗑️ Delete
                  </button>

                </div>

              </div>

            ))}

          </div>
        )}

    </div>
  );
}

export default MyRequests;
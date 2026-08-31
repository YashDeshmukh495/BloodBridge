import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CreateBloodRequest.css";

function CreateBloodRequest() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  const [formData, setFormData] = useState({
    patientName: "",
    bloodGroup: "",
    hospital: "",
    unitsRequired: "",
    urgency: "Medium",
    contactNumber: "",
    description: ""
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

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

    const parsedUser = JSON.parse(savedUser);

    setUser(parsedUser);

    setFormData((prev) => ({
      ...prev,
      bloodGroup: parsedUser.bloodGroup || "",
      contactNumber: parsedUser.mobile || ""
    }));
  }, [navigate]);

  // ======================================================
  // HANDLE CHANGE
  // ======================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "contactNumber") {
      const numericValue = value.replace(/\D/g, "");
      if (numericValue.length > 10) return;
      setFormData((prev) => ({
        ...prev,
        [name]: numericValue
      }));
      return;
    }

    if (name === "unitsRequired") {
      const numericValue = value.replace(/\D/g, "");
      setFormData((prev) => ({
        ...prev,
        [name]: numericValue
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // ======================================================
  // SUBMIT
  // ======================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    // ====================================================
    // VALIDATION
    // ====================================================

    if (!/^\d{10}$/.test(formData.contactNumber)) {
      setMessage("Contact number must contain exactly 10 digits.");
      return;
    }

    const units = Number(formData.unitsRequired);
    if (!Number.isInteger(units) || units < 1 || units > 6) {
      setMessage("Units required must be an integer between 1 and 6.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        "https://bloodbridge-938f.onrender.com/api/blood-requests",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            ...formData,
            unitsRequired: units
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message || "Failed to create blood request"
        );
        return;
      }

      setMessage("Blood request created successfully!");

      setFormData({
        patientName: "",
        bloodGroup: user?.bloodGroup || "",
        hospital: "",
        unitsRequired: "",
        urgency: "Medium",
        contactNumber: user?.mobile || "",
        description: ""
      });
    } catch (error) {
      console.error("Blood request error:", error);

      setMessage("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // LOADING
  // ======================================================

  if (!user) {
    return (
      <div className="create-request-loading">
        Loading...
      </div>
    );
  }

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="create-request-page">

      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="create-request-header">

        <button
          type="button"
          className="back-button"
          onClick={() => navigate("/dashboard")}
        >
          ← Dashboard
        </button>

        <div>
          <h1>Create Blood Request</h1>

          <p>
            Request blood and help save a life.
          </p>
        </div>

      </div>

      {/* ==================================================
          MAIN CONTAINER
      ================================================== */}

      <div className="create-request-container">

        {/* ==================================================
            LOCATION CARD
        ================================================== */}

        <section className="location-card">

          <div className="location-icon">
            📍
          </div>

          <div className="location-content">

            <h2>
              Request Location
            </h2>

            <p className="location-city">
              {user.currentCity || user.city}
            </p>

            <p className="location-pin">
              PIN:{" "}
              {user.currentPinCode || user.pinCode}
            </p>

          </div>

          <button
            type="button"
            className="edit-location-button"
            onClick={() => navigate("/profile")}
          >
            Edit Location
          </button>

        </section>

        {/* ==================================================
            FORM CARD
        ================================================== */}

        <section className="form-card">

          <div className="form-header">

            <h2>
              Blood Request Details
            </h2>

            <p>
              Please provide the details of the patient
              and required blood.
            </p>

          </div>


          <form onSubmit={handleSubmit}>

            {/* ==============================================
                ROW 1
            ============================================== */}

            <div className="form-grid">

              {/* Patient Name */}

              <div className="form-group">

                <label htmlFor="patientName">
                  Patient Name
                  <span>*</span>
                </label>

                <input
                  id="patientName"
                  type="text"
                  name="patientName"
                  placeholder="Enter patient name"
                  value={formData.patientName}
                  onChange={handleChange}
                  required
                />

              </div>


              {/* Blood Group */}

              <div className="form-group">

                <label htmlFor="bloodGroup">
                  Blood Group
                  <span>*</span>
                </label>

                <select
                  id="bloodGroup"
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  required
                >
                  <option value="">
                    Select blood group
                  </option>

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

            </div>


            {/* ==============================================
                HOSPITAL
            ============================================== */}

            <div className="form-group">

              <label htmlFor="hospital">
                Hospital
                <span>*</span>
              </label>

              <input
                id="hospital"
                type="text"
                name="hospital"
                placeholder="Enter hospital name"
                value={formData.hospital}
                onChange={handleChange}
                required
              />

            </div>


            {/* ==============================================
                ROW 2
            ============================================== */}

            <div className="form-grid">

              {/* Units */}

              <div className="form-group">

                <label htmlFor="unitsRequired">
                  Units Required
                  <span>*</span>
                </label>

                <input
                  id="unitsRequired"
                  type="number"
                  name="unitsRequired"
                  placeholder="Enter number of units"
                  min="1"
                  max="6"
                  step="1"
                  value={formData.unitsRequired}
                  onChange={handleChange}
                  required
                />

              </div>


              {/* Urgency */}

              <div className="form-group">

                <label htmlFor="urgency">
                  Urgency
                  <span>*</span>
                </label>

                <select
                  id="urgency"
                  name="urgency"
                  value={formData.urgency}
                  onChange={handleChange}
                >
                  <option value="Low">
                    Low
                  </option>

                  <option value="Medium">
                    Medium
                  </option>

                  <option value="High">
                    High
                  </option>

                  <option value="Emergency">
                    Emergency
                  </option>
                </select>

              </div>

            </div>


            {/* ==============================================
                CONTACT
            ============================================== */}

            <div className="form-group">

              <label htmlFor="contactNumber">
                Contact Number
                <span>*</span>
              </label>

              <input
                id="contactNumber"
                type="tel"
                name="contactNumber"
                placeholder="Enter contact number"
                value={formData.contactNumber}
                onChange={handleChange}
                required
              />

            </div>


            {/* ==============================================
                DESCRIPTION
            ============================================== */}

            <div className="form-group">

              <label htmlFor="description">
                Description
                <small>(Optional)</small>
              </label>

              <textarea
                id="description"
                name="description"
                placeholder="Add any additional information..."
                value={formData.description}
                onChange={handleChange}
                rows="5"
              />

            </div>


            {/* ==============================================
                MESSAGE
            ============================================== */}

            {message && (
              <div
                className={
                  message.includes("successfully")
                    ? "form-message success"
                    : "form-message error"
                }
              >
                {message}
              </div>
            )}


            {/* ==============================================
                ACTIONS
            ============================================== */}

            <div className="form-actions">

              <button
                type="button"
                className="cancel-button"
                onClick={() => navigate("/dashboard")}
                disabled={loading}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="submit-button"
                disabled={loading}
              >
                {loading
                  ? "Creating..."
                  : "🩸 Create Blood Request"}
              </button>

            </div>

          </form>

        </section>

      </div>

    </div>
  );
}

export default CreateBloodRequest;
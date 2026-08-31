import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    mobile: "",
    bloodGroup: "",
    dateOfBirth: "",
    weight: "",
    hasDonatedBefore: false,
    lastDonationDate: "",
    city: "",
    pinCode: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [captcha, setCaptcha] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ======================================================
  // GENERATE CAPTCHA
  // ======================================================

  const generateCaptcha = () => {
    const characters =
      "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    let result = "";

    for (let i = 0; i < 6; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }

    setCaptcha(result);
    setCaptchaInput("");
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  // ======================================================
  // HANDLE CHANGE
  // ======================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name === "mobile") {
      const numericValue = value.replace(/\D/g, "");
      if (numericValue.length > 10) return;
      setFormData((prev) => ({
        ...prev,
        [name]: numericValue
      }));
      setError("");
      setMessage("");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    setError("");
    setMessage("");
  };

  // ======================================================
  // DONATION YES / NO
  // ======================================================

  const handleDonationChange = (event) => {
    const hasDonated =
      event.target.value === "yes";

    setFormData((prev) => ({
      ...prev,
      hasDonatedBefore: hasDonated,
      lastDonationDate: hasDonated
        ? prev.lastDonationDate
        : ""
    }));

    setError("");
  };

  // ======================================================
  // CALCULATE AGE
  // ======================================================

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) {
      return null;
    }

    const birthDate =
      new Date(dateOfBirth);

    const today = new Date();

    let age =
      today.getFullYear() -
      birthDate.getFullYear();

    const monthDifference =
      today.getMonth() -
      birthDate.getMonth();

    if (
      monthDifference < 0 ||
      (
        monthDifference === 0 &&
        today.getDate() < birthDate.getDate()
      )
    ) {
      age--;
    }

    return age;
  };

  // ======================================================
  // SUBMIT
  // ======================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    // ====================================================
    // MOBILE NUMBER VALIDATION
    // ====================================================

    if (!/^\d{10}$/.test(formData.mobile)) {
      setError("Mobile number must contain exactly 10 digits.");
      return;
    }

    // ====================================================
    // BASIC VALIDATION
    // ====================================================

    const age =
      calculateAge(formData.dateOfBirth);

    if (age === null) {
      setError("Please enter your date of birth.");
      return;
    }

    if (age < 18) {
      setError(
        "You must be at least 18 years old to register as a donor."
      );
      return;
    }

    if (age > 100) {
      setError(
        "Please enter a valid date of birth."
      );
      return;
    }

    // ====================================================
    // WEIGHT VALIDATION
    // ====================================================

    const weight =
      Number(formData.weight);

    if (!weight || weight < 60) {
      setError(
        "You must weigh at least 60 kg to register as a donor."
      );
      return;
    }

    // ====================================================
    // DONATION DATE VALIDATION
    // ====================================================

    if (formData.hasDonatedBefore) {
      if (!formData.lastDonationDate) {
        setError(
          "Please enter your last blood donation date."
        );
        return;
      }

      const donationDate =
        new Date(formData.lastDonationDate);

      const today = new Date();

      today.setHours(23, 59, 59, 999);

      if (donationDate > today) {
        setError(
          "Last donation date cannot be in the future."
        );
        return;
      }
    }

    // ====================================================
    // CAPTCHA
    // ====================================================

    if (
      captchaInput.trim().toUpperCase() !==
      captcha.toUpperCase()
    ) {
      setError("Invalid CAPTCHA. Please try again.");
      generateCaptcha();
      return;
    }

    // ====================================================
    // PASSWORD
    // ====================================================

    if (
      formData.password !==
      formData.confirmPassword
    ) {
      setError(
        "Password and Confirm Password do not match."
      );
      return;
    }

    // ====================================================
    // MOBILE
    // ====================================================

    if (
      !/^[6-9]\d{9}$/.test(
        formData.mobile
      )
    ) {
      setError(
        "Please enter a valid 10-digit mobile number."
      );
      return;
    }

    // ====================================================
    // PIN CODE
    // ====================================================

    if (
      !/^\d{6}$/.test(
        formData.pinCode
      )
    ) {
      setError(
        "Please enter a valid 6-digit PIN code."
      );
      return;
    }

    // ====================================================
    // SUBMIT TO BACKEND
    // ====================================================

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/register",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            confirmPassword:
              formData.confirmPassword,

            mobile: formData.mobile,

            bloodGroup:
              formData.bloodGroup,

            dateOfBirth:
              formData.dateOfBirth,

            weight: weight,

            hasDonatedBefore:
              formData.hasDonatedBefore,

            lastDonationDate:
              formData.hasDonatedBefore
                ? formData.lastDonationDate
                : null,

            city: formData.city,
            pinCode: formData.pinCode
          })
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        setError(
          data.message ||
          "Registration failed."
        );
        return;
      }

      setMessage(
        "Account created successfully! Redirecting to login..."
      );

      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (registrationError) {
      console.error(
        "Registration error:",
        registrationError
      );

      setError(
        "Unable to connect to server."
      );

    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="register-page">

      <div className="register-card">

        {/* ================= HEADER ================= */}

        <div className="register-header">

          <div
            className="register-logo"
            onClick={() =>
              navigate("/")
            }
          >
            🩸 BloodBridge
          </div>

          <p>
            Connect. Donate. Save Lives.
          </p>

        </div>

        {/* ================= CONTENT ================= */}

        <div className="register-content">

          <h1>
            Create Account
          </h1>

          <p className="register-subtitle">
            Join BloodBridge and help save lives.
          </p>

          {/* ================= ERROR ================= */}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* ================= SUCCESS ================= */}

          {message && (
            <div className="success-message">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            {/* ================= NAME ================= */}

            <div className="form-group">

              <label>
                Full Name
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />

            </div>

            {/* ================= EMAIL ================= */}

            <div className="form-group">

              <label>
                Email
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />

            </div>

            {/* ================= MOBILE ================= */}

            <div className="form-group">

              <label>
                Mobile Number
              </label>

              <input
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="10-digit mobile number"
                maxLength="10"
                required
              />

            </div>

            {/* ================= BLOOD GROUP ================= */}

            <div className="form-group">

              <label>
                Blood Group
              </label>

              <select
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleChange}
                required
              >

                <option value="">
                  Select Blood Group
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

            {/* ================= DOB ================= */}

            <div className="form-group">

              <label>
                Date of Birth
              </label>

              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                max={
                  new Date(
                    new Date().setFullYear(
                      new Date().getFullYear() - 18
                    )
                  )
                    .toISOString()
                    .split("T")[0]
                }
                required
              />

              <small>
                You must be 18+ to donate blood.
              </small>

            </div>

            {/* ================= WEIGHT ================= */}

            <div className="form-group">

              <label>
                Weight (kg)
              </label>

              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                placeholder="Enter your weight"
                min="60"
                step="0.1"
                required
              />

              <small>
                Minimum required weight: 60 kg.
              </small>

            </div>

            {/* ================= PREVIOUS DONATION ================= */}

            <div className="form-group">

              <label>
                Have you donated blood before?
              </label>

              <select
                value={
                  formData.hasDonatedBefore
                    ? "yes"
                    : "no"
                }
                onChange={
                  handleDonationChange
                }
                required
              >

                <option value="no">
                  No, this will be my first donation
                </option>

                <option value="yes">
                  Yes, I have donated before
                </option>

              </select>

            </div>

            {/* ================= LAST DONATION ================= */}

            {formData.hasDonatedBefore && (
              <div className="form-group">

                <label>
                  When did you last donate blood?
                </label>

                <input
                  type="date"
                  name="lastDonationDate"
                  value={
                    formData.lastDonationDate
                  }
                  onChange={handleChange}
                  max={
                    new Date()
                      .toISOString()
                      .split("T")[0]
                  }
                  required
                />

                <small>
                  Your eligibility will be calculated
                  from this donation date.
                </small>

              </div>
            )}

            {/* ================= CITY ================= */}

            <div className="form-group">

              <label>
                City
              </label>

              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Enter your city"
                required
              />

            </div>

            {/* ================= PIN ================= */}

            <div className="form-group">

              <label>
                PIN Code
              </label>

              <input
                type="text"
                name="pinCode"
                value={formData.pinCode}
                onChange={handleChange}
                placeholder="6-digit PIN code"
                maxLength="6"
                required
              />

            </div>

            {/* ================= PASSWORD ================= */}

            <div className="form-group">

              <label>
                Password
              </label>

              <div className="password-wrapper">

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create password"
                  required
                />

                <button
                  type="button"
                  className="eye-button"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                >
                  {showPassword
                    ? "🙈"
                    : "👁️"}
                </button>

              </div>

            </div>

            {/* ================= CONFIRM PASSWORD ================= */}

            <div className="form-group">

              <label>
                Confirm Password
              </label>

              <div className="password-wrapper">

                <input
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  name="confirmPassword"
                  value={
                    formData.confirmPassword
                  }
                  onChange={handleChange}
                  placeholder="Confirm password"
                  required
                />

                <button
                  type="button"
                  className="eye-button"
                  onClick={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                >
                  {showConfirmPassword
                    ? "🙈"
                    : "👁️"}
                </button>

              </div>

            </div>

            {/* ================= CAPTCHA ================= */}

            <div className="captcha-section">

              <label className="captcha-title">
                Security Verification
              </label>

              <div className="captcha-container">

                <div className="captcha-code">
                  {captcha}
                </div>

                <button
                  type="button"
                  className="captcha-refresh"
                  onClick={
                    generateCaptcha
                  }
                  title="Refresh CAPTCHA"
                >
                  ↻
                </button>

              </div>

              <input
                type="text"
                className="captcha-input"
                value={captchaInput}
                onChange={(event) =>
                  setCaptchaInput(
                    event.target.value
                  )
                }
                placeholder="Enter CAPTCHA"
                required
              />

            </div>

            {/* ================= CREATE ACCOUNT ================= */}

            <button
              type="submit"
              className="create-account-button"
              disabled={loading}
            >
              {loading
                ? "Creating Account..."
                : "Create Account"}
            </button>

          </form>

          {/* ================= LOGIN ================= */}

          <div className="login-text">

            Already have an account?

            <button
              type="button"
              onClick={() =>
                navigate("/login")
              }
            >
              Login
            </button>

          </div>

          {/* ================= HOME ================= */}

          <button
            type="button"
            className="back-home"
            onClick={() =>
              navigate("/")
            }
          >
            ← Back to Home
          </button>

        </div>

      </div>

    </div>
  );
}

export default Register;
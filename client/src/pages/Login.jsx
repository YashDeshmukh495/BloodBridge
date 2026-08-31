import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);

  // ================= HANDLE CHANGE =================

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

    setMessage("");
  };

  // ================= LOGIN =================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setMessageType("");

    try {
      const response = await fetch(
        "https://bloodbridge-938f.onrender.com/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(formData)
        }
      );

      const data = await response.json();

      // ================= ERROR =================

      if (!response.ok) {
        setMessage(data.message || "Invalid email or password");
        setMessageType("error");
        return;
      }

      // ================= SAVE LOGIN DATA =================

      localStorage.setItem("token", data.token);

      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      // ================= SUCCESS =================

      setMessage("Login successful!");
      setMessageType("success");

      // Dashboard par redirect
      setTimeout(() => {
        navigate("/dashboard");
      }, 700);

    } catch (error) {

      console.error("Login error:", error);

      setMessage("Unable to connect to server");
      setMessageType("error");

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      <div className="login-card">

        {/* ================= HEADER ================= */}

        <div className="login-header">

          <div
            className="login-logo"
            onClick={() => navigate("/")}
          >
            🩸 <span>BloodBridge</span>
          </div>

          <p>
            Welcome back. Let's save lives together.
          </p>

        </div>


        {/* ================= CONTENT ================= */}

        <div className="login-content">

          <h1>Welcome Back</h1>

          <p className="login-subtitle">
            Login to your BloodBridge account
          </p>


          {/* ================= FORM ================= */}

          <form onSubmit={handleSubmit}>

            {/* EMAIL */}

            <div className="form-group">

              <label>Email</label>

              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                required
              />

            </div>


            {/* PASSWORD */}

            <div className="form-group">

              <label>Password</label>

              <div className="password-wrapper">

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className="eye-button"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>

              </div>

            </div>


            {/* LOGIN BUTTON */}

            <button
              type="submit"
              className="login-submit"
              disabled={loading}
            >
              {loading
                ? "Logging in..."
                : "Login"}
            </button>

          </form>


          {/* ================= MESSAGE ================= */}

          {message && (
            <p
              className={
                messageType === "success"
                  ? "success-message"
                  : "error-message"
              }
            >
              {message}
            </p>
          )}


          {/* ================= REGISTER ================= */}

          <p className="register-text">

            Don't have an account?

            <button
              onClick={() => navigate("/register")}
            >
              Create Account
            </button>

          </p>


          {/* ================= HOME ================= */}

          <button
            className="back-home"
            onClick={() => navigate("/")}
          >
            ← Back to Home
          </button>

        </div>

      </div>

    </div>
  );
}

export default Login;
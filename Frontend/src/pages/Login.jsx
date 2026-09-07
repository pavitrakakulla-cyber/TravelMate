import { useState, useRef } from "react";
import { Mail, Lock, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Prevent multiple login requests
  const submittingRef = useRef(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent duplicate submit
    if (submittingRef.current) {
      console.log("LOGIN ALREADY IN PROGRESS");
      return;
    }

    submittingRef.current = true;
    setLoading(true);
    setMessage("");

    try {
      const form = new URLSearchParams();

      form.append("email", formData.email);
      form.append("password", formData.password);

      console.log("========== LOGIN REQUEST START ==========");

      const response = await fetch(
        "http://localhost:5000/login",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/x-www-form-urlencoded",
          },
          credentials: "include",
          body: form,
        }
      );

      const data = await response.json();

      console.log("LOGIN RESPONSE:", data);

      if (!response.ok) {
        setMessage(
          data.message || "Invalid email or password."
        );
        return;
      }

      // Verify session
      const meResponse = await fetch(
        "http://localhost:5000/api/auth/me",
        {
          method: "GET",
          credentials: "include",
        }
      );

      const meData = await meResponse.json();

      console.log("AUTH ME RESPONSE:", meData);

      if (!meResponse.ok || !meData.logged_in) {
        setMessage(
          "Login successful, but session was not created."
        );
        return;
      }

      console.log("========== LOGIN COMPLETED ==========");

      

      // Direct navigation
      //navigate("/user-home");
      console.log("REDIRECTING TO USER HOME");
      setMessage("Login successful!");
      window.location.href = "/user-home";

    } catch (error) {
      console.error("Login Error:", error);

      setMessage(
        "Unable to connect to backend."
      );
    } finally {
      submittingRef.current = false;
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      <div className="auth-card">

        <div className="auth-icon">
          <LogIn size={28} />
        </div>

        <h1>Welcome Back</h1>

        <p className="auth-subtitle">
          Login to continue your TravelMate journey.
        </p>

        <form onSubmit={handleSubmit}>

          {/* EMAIL */}
          <div className="form-group">

            <label htmlFor="login-email">
              Email
            </label>

            <div className="input-box">

              <Mail size={19} />

              <input
                id="login-email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                autoComplete="email"
                required
              />

            </div>

          </div>

          {/* PASSWORD */}
          <div className="form-group">

            <label htmlFor="login-password">
              Password
            </label>

            <div className="input-box">

              <Lock size={19} />

              <input
                id="login-password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />

            </div>

          </div>

          {/* LOGIN BUTTON */}
          <button
            type="submit"
            className="auth-btn"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        {/* MESSAGE */}
        {message && (
          <p className="auth-message">
            {message}
          </p>
        )}

        {/* REGISTER */}
        <p className="auth-footer">
          Don't have an account?
          <a href="/register"> Register</a>
        </p>

        {/* ADMIN LOGIN */}
        <p className="auth-footer">
          Are you an admin?
          <a href="/admin-login"> Admin Login</a>
        </p>

      </div>

    </div>
  );
}

export default Login;
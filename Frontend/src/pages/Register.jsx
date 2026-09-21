import { useState } from "react";
import { UserPlus, Mail, Lock, User, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const form = new URLSearchParams();

      form.append("full_name", formData.full_name);
      form.append("phone", formData.phone);
      form.append("email", formData.email);
      form.append("password", formData.password);

      const response = await fetch(
        "/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          credentials: "include",
          body: form,
        }
      );

      const data = await response.json();

      if (response.ok) {
        // Registration successful
        // Go to OTP verification page
        navigate("/verify-otp", {
          state: {
            email: formData.email,
          },
        });
      } else {
        setMessage(
          data.message || "Registration failed. Please try again."
        );
      }
    } catch (error) {
      console.error("Registration Error:", error);
      setMessage("Unable to connect to backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      <div className="auth-card">

        {/* Icon */}
        <div className="auth-icon">
          <UserPlus size={28} />
        </div>

        {/* Heading */}
        <h1>Create Account</h1>

        <p className="auth-subtitle">
          Join TravelMate and start your journey.
        </p>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="auth-form">

          {/* Full Name */}
          <div className="form-group">
            <label>Full Name</label>

            <div className="input-box">
              <User size={19} />

              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />
            </div>
          </div>

          {/* Phone Number */}
          <div className="form-group">
            <label>Phone Number</label>

            <div className="input-box">
              <Phone size={19} />

              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="form-group">
            <label>Email</label>

            <div className="input-box">
              <Mail size={19} />

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label>Password</label>

            <div className="input-box">
              <Lock size={19} />

              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="auth-btn"
            disabled={loading}
          >
            {loading
              ? "Creating Account..."
              : "Create Account"}
          </button>

          {/* Error Message */}
          {message && (
            <p className="auth-message">
              {message}
            </p>
          )}

        </form>

        {/* Login Link */}
        <p className="auth-footer">
          Already have an account?
          <a href="/login"> Login</a>
        </p>

      </div>

    </div>
  );
}

export default Register;
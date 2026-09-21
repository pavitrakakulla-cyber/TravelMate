import { useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(
        "/admin/login",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },

          credentials: "include",

          body: new URLSearchParams({
            email,
            password,
          }),
        }
      );

      if (response.ok) {
        setMessage("Admin login successful!");

        setTimeout(() => {
          navigate("/admin-dashboard");
        }, 500);

        return;
      }

      setMessage("Invalid admin email or password.");

    } catch (error) {
      console.error("Admin Login Error:", error);

      setMessage("Unable to connect to backend.");

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">

      <div className="admin-login-card">

        <div className="admin-login-icon">
          🔐
        </div>

        <h1>Admin Login</h1>

        <p>
          Welcome back to TravelMate Administration
        </p>

        <form onSubmit={handleSubmit}>

          {/* Email */}

          <div className="form-group">

            <label htmlFor="admin-email">
              Email
            </label>

            <input
              id="admin-email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@travelmate.com"
              required
            />

          </div>

          {/* Password */}

          <div className="form-group">

            <label htmlFor="admin-password">
              Password
            </label>

            <input
              id="admin-password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />

          </div>

          {/* Message */}

          {message && (
            <p className="login-message">
              {message}
            </p>
          )}

          {/* Button */}

          <button
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

        </form>

      </div>

    </div>
  );
}

export default AdminLogin;

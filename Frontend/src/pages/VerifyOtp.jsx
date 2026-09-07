import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function VerifyOTP() {
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email || "";

  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();

    if (otp.length !== 6) {
      setMessage("Please enter the 6-digit OTP.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/verify-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            email: email,
            otp: otp,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage(
          data.message || "Email verified successfully!"
        );

        setTimeout(() => {
          navigate("/login");
        }, 1500);
      } else {
        setMessage(
          data.message || "Invalid OTP. Please try again."
        );
      }
    } catch (error) {
      console.error("OTP Verification Error:", error);
      setMessage("Unable to connect to backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      <div className="auth-card">

        <div className="auth-icon">
          🔐
        </div>

        <h1>Verify Your Email</h1>

        <p className="auth-subtitle">
          We have sent a 6-digit OTP to
          <br />
          <strong>{email}</strong>
        </p>

        <form onSubmit={handleVerify} className="auth-form">

          <div className="form-group">
            <label>Enter OTP</label>

            <div className="input-box">
              <input
                type="text"
                inputMode="numeric"
                maxLength="6"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, ""))
                }
                placeholder="Enter 6-digit OTP"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="auth-btn"
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>

          {message && (
            <p className="auth-message">
              {message}
            </p>
          )}

        </form>

        <p className="auth-footer">
          Didn't receive the OTP?
          <button
            type="button"
            onClick={() => navigate("/register")}
            style={{
              border: "none",
              background: "none",
              color: "inherit",
              cursor: "pointer",
              marginLeft: "5px",
            }}
          >
            Register Again
          </button>
        </p>

      </div>

    </div>
  );
}

export default VerifyOTP;
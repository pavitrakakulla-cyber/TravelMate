import { MapPin, User } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const [loggedIn, setLoggedIn] = useState(false);

  // ==============================
  // CHECK LOGIN SESSION
  // ==============================
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(
          "/api/auth/me",
          {
            method: "GET",
            credentials: "include",
          }
        );

        const data = await response.json();

        console.log("NAVBAR AUTH:", data);

        setLoggedIn(data.logged_in === true);
      } catch (error) {
        console.error("Navbar Auth Error:", error);
        setLoggedIn(false);
      }
    };

    checkAuth();
  }, []);

  // ==============================
  // LOGOUT
  // ==============================
  const handleLogout = async () => {
    try {
      const response = await fetch(
        "/api/auth/logout",
        {
          method: "POST",
          credentials: "include",
        }
      );

      const data = await response.json();

      console.log("LOGOUT RESPONSE:", data);

      if (!response.ok) {
        throw new Error(
          data.message || "Logout failed"
        );
      }

      setLoggedIn(false);

      navigate("/login");

    } catch (error) {
      console.error("Logout Error:", error);
      alert("Unable to logout");
    }
  };

  return (
    <nav className="navbar">

      <div className="navbar-container">

        {/* LOGO */}
        <div className="logo">
          <MapPin size={28} />
          <span>TravelMate</span>
        </div>

        {/* NAV LINKS */}
        <div className="nav-links">

          <Link to="/">
            Home
          </Link>

          {/* Packages only after login */}
          {loggedIn && (
            <Link to="/packages">
              Packages
            </Link>
          )}

          {!loggedIn && (
            <Link to="/register">
              Register
            </Link>
          )}

        </div>

        {/* NAV ACTIONS */}
        <div className="nav-actions">

          {!loggedIn ? (
            <Link
              to="/login"
              className="login-btn"
            >
              <User size={18} />
              Login
            </Link>
          ) : (
            <button
              className="logout-btn"
              onClick={handleLogout}
            >
              🚪 Logout
            </button>
          )}

        </div>

      </div>

    </nav>
  );
}

export default Navbar;
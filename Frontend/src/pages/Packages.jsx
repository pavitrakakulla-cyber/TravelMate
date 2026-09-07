import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Packages() {
  const navigate = useNavigate();

  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      const authResponse = await fetch(
        "http://localhost:5000/api/auth/me",
        {
          method: "GET",
          credentials: "include",
        }
      );

      const authData = await authResponse.json();

      console.log("PACKAGES AUTH:", authData);

      /*
        Allow Packages page only when:
        User is logged in OR Admin is logged in
      */

      if (
        !authData.logged_in &&
        !authData.user_id &&
        !authData.admin_id
      ) {
        navigate("/login");
        return;
      }

      // Authentication successful
      fetchPackages();

    } catch (err) {
      console.error("Authentication Error:", err);
      navigate("/login");
    }
  };

  const fetchPackages = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://localhost:5000/api/packages",
        {
          method: "GET",
          credentials: "include",
        }
      );
      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }
      const data = await response.json();

     console.log("PACKAGES RESPONSE:", data);

    // Login 
     if (response.status === 401) {
  alert("Please login first to view travel packages.");
  navigate("/login");
  return;
}

if (!response.ok) {
  throw new Error(
    data.message || "Failed to load packages"
  );
}

setPackages(data.packages || []);

     

    } catch (err) {
      console.error("Packages Error:", err);
      setError("Unable to load packages.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="packages-page">
        <div className="packages-loading">
          <h2>Loading packages...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="packages-page">
        <div className="packages-error">
          <h2>{error}</h2>

          <p>
            Please try again later.
          </p>

          <button onClick={fetchPackages}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="packages-page">

      {/* ================= HERO ================= */}

      <section className="packages-hero">

        <p className="hero-label">
          EXPLORE TRAVELMATE
        </p>

        <h1>
          Find Your Perfect Trip
        </h1>

        <p>
          Discover amazing destinations and create
          unforgettable memories.
        </p>

      </section>


      {/* ================= PACKAGES ================= */}

      <section className="packages-section">

        <div className="packages-header">

          <h2>
            Popular Travel Packages
          </h2>

          <span>
            {packages.length} packages available
          </span>

        </div>


        {packages.length === 0 ? (

          <div className="no-packages">

            <h2>
              No Packages Found
            </h2>

            <p>
              Travel packages will appear here soon.
            </p>

          </div>

        ) : (

          <div className="packages-grid">

            {packages.map((pkg) => (

              <article
                className="package-card"
                key={pkg.package_id}
              >

                {/* IMAGE */}

                <div className="package-image">

                  <img
                    src={pkg.image_url}
                    alt={pkg.title}
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />

                  <span className="destination-badge">
                    📍 {pkg.destination}
                  </span>

                </div>


                {/* CONTENT */}

                <div className="package-content">

                  <h2>
                    {pkg.title}
                  </h2>

                  <p className="package-description">
                    {pkg.description}
                  </p>


                  <div className="package-duration">

                    <span>
                      🗓️ {pkg.duration_days} Days
                    </span>

                    <span>
                      🌙 {pkg.duration_nights} Nights
                    </span>

                  </div>


                  <div className="package-bottom">

                    <div className="package-price">

                      <small>
                        Starting from
                      </small>

                      <strong>
                        ₹
                        {Number(
                          pkg.base_price
                        ).toLocaleString("en-IN")}
                      </strong>

                    </div>


                    <Link
                      to={`/packages/${pkg.package_id}`}
                      className="details-button"
                    >
                      View Details →
                    </Link>

                  </div>

                </div>

              </article>

            ))}

          </div>

        )}

      </section>

    </main>
  );
}

export default Packages;
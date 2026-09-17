import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "./PackageDetails.css";

function PackageDetails() {
  const { packageId } = useParams();
  const navigate = useNavigate();

  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPackage = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/packages/${packageId}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load package");
        }

        setPkg(data.package);
      } catch (err) {
        console.error("Package Details Error:", err);
        setError("Unable to load package details.");
      } finally {
        setLoading(false);
      }
    };

    fetchPackage();
  }, [packageId]);

  const handleBookNow = () => {
    navigate(`/booking/${packageId}`);
  };

  if (loading) {
    return (
      <main className="package-details-page">
        <div className="details-container">
          <div className="details-loading">
            <div className="loading-spinner"></div>
            <h2>Loading your adventure...</h2>
            <p>Preparing package details for you</p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !pkg) {
    return (
      <main className="package-details-page">
        <div className="details-container">
          <div className="details-error">
            <div className="error-icon">😕</div>
            <h2>{error || "Package not found."}</h2>
            <p>We couldn't find the travel package you're looking for.</p>

            <Link to="/packages" className="error-back-button">
              ← Back to Packages
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="package-details-page">

      <div className="details-container">

        {/* Back Navigation */}
        <Link to="/packages" className="back-link">
          <span>←</span> Back to Packages
        </Link>

        {/* Main Hero Card */}
        <section className="package-details-card">

          {/* Image Section */}
          <div className="details-image">

            <img
              src={pkg.image_url}
              alt={pkg.title}
            />

            <div className="image-overlay"></div>

            <div className="destination-badge">
              <span>📍</span>
              {pkg.destination}
            </div>

            <div className="experience-badge">
              ✨ TravelMate Experience
            </div>

          </div>

          {/* Content Section */}
          <div className="details-content">

            <p className="details-label">
              EXPLORE • EXPERIENCE • ENJOY
            </p>

            <h1>{pkg.title}</h1>

            <p className="details-description">
              {pkg.description}
            </p>

            {/* Package Information */}
            <div className="details-info">

              <div className="info-box">
                <div className="info-icon">🗓️</div>

                <div>
                  <small>Duration</small>
                  <strong>
                    {pkg.duration_days} Days
                  </strong>
                </div>
              </div>

              <div className="info-box">
                <div className="info-icon">🌙</div>

                <div>
                  <small>Stay</small>
                  <strong>
                    {pkg.duration_nights} Nights
                  </strong>
                </div>
              </div>

              <div className="info-box">
                <div className="info-icon">📍</div>

                <div>
                  <small>Destination</small>
                  <strong>
                    {pkg.destination}
                  </strong>
                </div>
              </div>

            </div>

            {/* Price Area */}
            <div className="details-price">

              <div className="price-main">
                <span>Starting from</span>

                <strong>
                  ₹{Number(pkg.base_price).toLocaleString("en-IN")}
                </strong>
              </div>

              <span className="price-note">
                per package
              </span>

            </div>

            {/* Actions */}
            <div className="details-actions">

              <button
                type="button"
                className="book-button"
                onClick={handleBookNow}
              >
                <span>🧳</span>
                Book Now
                <span className="button-arrow">→</span>
              </button>

              <button
                type="button"
                className="wishlist-button"
                onClick={() =>
                  alert("Wishlist feature coming soon!")
                }
              >
                <span>♡</span>
                Wishlist
              </button>

            </div>

            {/* Trust Text */}
            <div className="booking-trust">
              <div className="trust-item">
                <span>🔒</span>
                <div>
                  <strong>Secure Booking</strong>
                  <small>Your information is protected</small>
                </div>
              </div>

              <div className="trust-item">
                <span>✓</span>
                <div>
                  <strong>Easy Booking</strong>
                  <small>Quick & simple reservation</small>
                </div>
              </div>
            </div>

          </div>

        </section>

        {/* Bottom Highlights */}
        <section className="travel-highlights">

          <div className="highlight-card">
            <div className="highlight-icon">🏝️</div>
            <div>
              <h3>Beautiful Destinations</h3>
              <p>Discover amazing places with TravelMate.</p>
            </div>
          </div>

          <div className="highlight-card">
            <div className="highlight-icon">⭐</div>
            <div>
              <h3>Memorable Experiences</h3>
              <p>Create unforgettable travel memories.</p>
            </div>
          </div>

          <div className="highlight-card">
            <div className="highlight-icon">💳</div>
            <div>
              <h3>Easy & Secure Payment</h3>
              <p>Book your trip with a simple checkout.</p>
            </div>
          </div>

        </section>

      </div>

    </main>
  );
}

export default PackageDetails;



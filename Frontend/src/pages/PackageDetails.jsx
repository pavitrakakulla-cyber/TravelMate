import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

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
          throw new Error(
            data.message || "Failed to load package"
          );
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
        <div className="details-loading">
          <h2>Loading package...</h2>
        </div>
      </main>
    );
  }

  if (error || !pkg) {
    return (
      <main className="package-details-page">
        <div className="details-error">
          <h2>{error || "Package not found."}</h2>

          <Link to="/packages">
            ← Back to Packages
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="package-details-page">

      {/* Back */}
      <div className="details-container">

        <Link
          to="/packages"
          className="back-link"
        >
          ← Back to Packages
        </Link>

        {/* Main Details */}
        <section className="package-details-card">

          {/* Image */}
          <div className="details-image">

            <img
              src={pkg.image_url}
              alt={pkg.title}
            />

            <span className="details-destination">
              📍 {pkg.destination}
            </span>

          </div>

          {/* Content */}
          <div className="details-content">

            <p className="details-label">
              TRAVELMATE EXPERIENCE
            </p>

            <h1>{pkg.title}</h1>

            <p className="details-description">
              {pkg.description}
            </p>

            {/* Duration */}
            <div className="details-info">

              <div className="info-box">
                <span>🗓️</span>

                <div>
                  <small>Duration</small>

                  <strong>
                    {pkg.duration_days} Days
                  </strong>
                </div>
              </div>

              <div className="info-box">
                <span>🌙</span>

                <div>
                  <small>Nights</small>

                  <strong>
                    {pkg.duration_nights} Nights
                  </strong>
                </div>
              </div>

              <div className="info-box">
                <span>📍</span>

                <div>
                  <small>Destination</small>

                  <strong>
                    {pkg.destination}
                  </strong>
                </div>
              </div>

            </div>

            {/* Price */}
            <div className="details-price">

              <div>
                <small>Starting from</small>

                <strong>
                  ₹
                  {Number(pkg.base_price).toLocaleString(
                    "en-IN"
                  )}
                </strong>
              </div>

              <span>
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
                🧳 Book Now
              </button>

              <button
                type="button"
                className="wishlist-button"
                onClick={() =>
                  alert("Wishlist feature coming soon!")
                }
              >
                ❤️ Wishlist
              </button>

            </div>

          </div>

        </section>

      </div>

    </main>
  );
}

export default PackageDetails;
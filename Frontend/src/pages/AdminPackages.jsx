
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
const API_BASE = "http://localhost:5000";

function AdminPackages() {
  const navigate = useNavigate();

  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==============================
  // LOAD PACKAGES
  // ==============================
  const fetchPackages = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE}/api/admin/packages`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load packages"
        );
      }

      setPackages(data.packages || []);
    } catch (err) {
      console.error("Admin Packages Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // INITIAL LOAD
  // ==============================
  useEffect(() => {
    fetchPackages();
  }, []);

  // ==============================
  // ACTIVATE / DEACTIVATE
  // ==============================
  const togglePackage = async (packageId) => {
    try {
      const response = await fetch(
        `${API_BASE}/api/admin/packages/toggle/${packageId}`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to update package status"
        );
      }

      // Refresh package list
      fetchPackages();

    } catch (err) {
      console.error("Toggle Package Error:", err);
      alert(err.message);
    }
  };

  // ==============================
  // ADD PACKAGE
  // ==============================
  const handleAddPackage = () => {
    navigate("/admin/packages/add");
  };

  // ==============================
  // EDIT PACKAGE
  // ==============================
  const handleEditPackage = (packageId) => {
    navigate(`/admin/packages/edit/${packageId}`);
  };

  // ==============================
  // LOADING
  // ==============================
  if (loading) {
    return (
      <div className="admin-packages-page">
        <div className="admin-packages-card">
          <h2>Loading Packages...</h2>
          <p>Please wait.</p>
        </div>
      </div>
    );
  }

  // ==============================
  // ERROR
  // ==============================
  if (error) {
    return (
      <div className="admin-packages-page">
        <div className="admin-packages-card error-card">
          <h2>Unable to Load Packages</h2>

          <p>{error}</p>

          <button onClick={fetchPackages}>
            🔄 Try Again
          </button>

          <button onClick={() => navigate("/admin/dashboard")}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ==============================
  // PAGE
  // ==============================
  return (
    <main className="admin-packages-page">

      <div className="admin-packages-header">

        <div>
          <h1>📦 Manage Packages</h1>

          <p>
            Add, edit and manage TravelMate travel packages.
          </p>
        </div>

        <div className="admin-packages-actions">

          <button
            className="refresh-button"
            onClick={fetchPackages}
          >
            🔄 Refresh
          </button>

          <button
            className="add-package-button"
            onClick={handleAddPackage}
          >
            ➕ Add Package
          </button>

        </div>

      </div>

      <div className="package-count">
        <strong>Total Packages:</strong>{" "}
        {packages.length}
      </div>

      {packages.length === 0 ? (

        <div className="empty-packages">
          <h2>No Packages Found</h2>

          <p>
            There are currently no travel packages.
          </p>

          <button onClick={handleAddPackage}>
            ➕ Add Your First Package
          </button>
        </div>

      ) : (

        <div className="packages-grid">

          {packages.map((pkg) => (

            <div
              className={`package-card ${
                pkg.is_active
                  ? "active-package"
                  : "inactive-package"
              }`}
              key={pkg.package_id}
            >

              {/* IMAGE */}
              <div className="package-image-container">

                {pkg.image_url ? (
                  <img
                    src={pkg.image_url}
                    alt={pkg.title}
                    className="package-image"
                  />
                ) : (
                  <div className="no-image">
                    📷 No Image
                  </div>
                )}

                <span
                  className={`package-status ${
                    pkg.is_active
                      ? "status-active"
                      : "status-inactive"
                  }`}
                >
                  {pkg.is_active
                    ? "Active"
                    : "Inactive"}
                </span>

              </div>

              {/* CONTENT */}
              <div className="package-content">

                <h2>{pkg.title}</h2>

                <p className="destination">
                  📍 {pkg.destination}
                </p>

                <p className="duration">
                  🕒 {pkg.duration_days} Days /{" "}
                  {pkg.duration_nights} Nights
                </p>

                <p className="price">
                  💰 ₹
                  {Number(
                    pkg.base_price
                  ).toLocaleString("en-IN")}
                </p>

                <p className="description">
                  {pkg.description}
                </p>

              </div>

              {/* ACTIONS */}
              <div className="package-actions">

                <button
                  className="edit-button"
                  onClick={() =>
                    handleEditPackage(
                      pkg.package_id
                    )
                  }
                >
                  ✏️ Edit
                </button>

                <button
                  className={
                    pkg.is_active
                      ? "deactivate-button"
                      : "activate-button"
                  }
                  onClick={() =>
                    togglePackage(
                      pkg.package_id
                    )
                  }
                >
                  {pkg.is_active
                    ? "Deactivate"
                    : "Activate"}
                </button>

              </div>

            </div>

          ))}

        </div>

      )}

    </main>
  );
}

export default AdminPackages;


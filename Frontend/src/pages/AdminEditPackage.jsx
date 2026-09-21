import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
const API_BASE = "";

function AdminEditPackage() {
  const { packageId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    destination: "",
    description: "",
    duration_days: "",
    duration_nights: "",
    base_price: "",
    image_url: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPackage();
  }, [packageId]);

  const fetchPackage = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE}/api/admin/packages/${packageId}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load package"
        );
      }

      const pkg = data.package;

      setFormData({
        title: pkg.title || "",
        destination: pkg.destination || "",
        description: pkg.description || "",
        duration_days: pkg.duration_days || "",
        duration_nights: pkg.duration_nights || "",
        base_price: pkg.base_price || "",
        image_url: pkg.image_url || "",
      });

    } catch (err) {
      console.error("Load Package Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    try {
      setSaving(true);

      const response = await fetch(
        `${API_BASE}/api/admin/packages/${packageId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            title: formData.title.trim(),
            destination: formData.destination.trim(),
            description: formData.description.trim(),
            duration_days: Number(
              formData.duration_days
            ),
            duration_nights: Number(
              formData.duration_nights
            ),
            base_price: Number(
              formData.base_price
            ),
            image_url: formData.image_url.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update package"
        );
      }

      alert("✅ Package updated successfully!");

      navigate("/admin/packages");

    } catch (err) {
      console.error("Update Package Error:", err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-edit-package-page">
        <div className="admin-edit-package-card">
          <h2>Loading Package...</h2>
          <p>Please wait.</p>
        </div>
      </div>
    );
  }

  if (error && !formData.title) {
    return (
      <div className="admin-edit-package-page">
        <div className="admin-edit-package-card">
          <h2>Unable to Load Package</h2>

          <p className="form-error">
            ❌ {error}
          </p>

          <button
            onClick={() =>
              navigate("/admin/packages")
            }
          >
            Back to Packages
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="admin-edit-package-page">

      <div className="admin-edit-package-card">

        <div className="form-header">
          <h1>✏️ Edit Package</h1>

          <p>
            Update TravelMate package details.
          </p>
        </div>

        {error && (
          <div className="form-error">
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label htmlFor="title">
              Package Title *
            </label>

            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="destination">
              Destination *
            </label>

            <input
              id="destination"
              name="destination"
              type="text"
              value={formData.destination}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">
              Description *
            </label>

            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="5"
              required
            />
          </div>

          <div className="form-row">

            <div className="form-group">
              <label htmlFor="duration_days">
                Duration Days *
              </label>

              <input
                id="duration_days"
                name="duration_days"
                type="number"
                min="1"
                value={formData.duration_days}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="duration_nights">
                Duration Nights *
              </label>

              <input
                id="duration_nights"
                name="duration_nights"
                type="number"
                min="0"
                value={formData.duration_nights}
                onChange={handleChange}
                required
              />
            </div>

          </div>

          <div className="form-group">
            <label htmlFor="base_price">
              Base Price (₹) *
            </label>

            <input
              id="base_price"
              name="base_price"
              type="number"
              min="0"
              step="0.01"
              value={formData.base_price}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="image_url">
              Image URL
            </label>

            <input
              id="image_url"
              name="image_url"
              type="url"
              value={formData.image_url}
              onChange={handleChange}
            />
          </div>

          <div className="form-actions">

            <button
              type="button"
              className="cancel-button"
              onClick={() =>
                navigate("/admin/packages")
              }
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="save-button"
              disabled={saving}
            >
              {saving
                ? "Updating..."
                : "💾 Update Package"}
            </button>

          </div>

        </form>

      </div>

    </main>
  );
}

export default AdminEditPackage;


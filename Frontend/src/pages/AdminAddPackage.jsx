import { useState } from "react";
import { useNavigate } from "react-router-dom";
const API_BASE = "";

function AdminAddPackage() {
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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

    if (
      !formData.title.trim() ||
      !formData.destination.trim() ||
      !formData.description.trim()
    ) {
      setError("Please fill all required fields.");
      return;
    }

    if (
      !formData.duration_days ||
      !formData.duration_nights ||
      !formData.base_price
    ) {
      setError("Please enter duration and price.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_BASE}/api/admin/packages/add`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            title: formData.title.trim(),
            destination: formData.destination.trim(),
            description: formData.description.trim(),
            duration_days: Number(formData.duration_days),
            duration_nights: Number(formData.duration_nights),
            base_price: Number(formData.base_price),
            image_url: formData.image_url.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to add package"
        );
      }

      alert("✅ Package added successfully!");

      navigate("/admin/packages");

    } catch (err) {
      console.error("Add Package Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="admin-add-package-page">

      <div className="admin-add-package-card">

        <div className="form-header">
          <h1>➕ Add New Package</h1>

          <p>
            Create a new TravelMate travel package.
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
              placeholder="Example: Hyderabad City Tour"
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
              placeholder="Example: Hyderabad"
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
              placeholder="Describe the travel package..."
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
              placeholder="15000"
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
              placeholder="https://images.unsplash.com/..."
            />
          </div>

          <div className="form-actions">

            <button
              type="button"
              className="cancel-button"
              onClick={() =>
                navigate("/admin/packages")
              }
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="save-button"
              disabled={loading}
            >
              {loading
                ? "Saving..."
                : "💾 Save Package"}
            </button>

          </div>

        </form>

      </div>

    </main>
  );
}

export default AdminAddPackage;



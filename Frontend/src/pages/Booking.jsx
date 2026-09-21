import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function Booking() {
  const { packageId } = useParams();
  const navigate = useNavigate();

  const [pkg, setPkg] = useState(null);

  const [travelDate, setTravelDate] = useState("");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [roomType, setRoomType] = useState("standard");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPackage = async () => {
      try {
        const response = await fetch(
          `/api/packages/${packageId}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to load package"
          );
        }

        setPkg(data.package);
      } catch (err) {
        console.error(err);
        setError("Unable to load package.");
      } finally {
        setLoading(false);
      }
    };

    loadPackage();
  }, [packageId]);

  const price = pkg ? Number(pkg.base_price) : 0;

  const adultAmount = price * Number(adults);

  const childAmount =
    price * 0.5 * Number(children);

  const baseAmount = adultAmount + childAmount;

  let additionalCharges = 0;

  if (roomType === "deluxe") {
    additionalCharges = 2000;
  } else if (roomType === "premium") {
    additionalCharges = 5000;
  }

  const discountAmount =
    Number(adults) >= 4
      ? baseAmount * 0.10
      : 0;

  const totalAmount =
    baseAmount +
    additionalCharges -
    discountAmount;

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSubmitting(true);

    try {
      const response = await fetch(
        "/api/booking",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          credentials: "include",

          body: JSON.stringify({
            package_id: Number(packageId),
            travel_date: travelDate,
            adults: Number(adults),
            children: Number(children),
            room_type: roomType,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Booking failed"
        );
      }

      navigate(
        `/booking-success/${data.booking_id}`
      );

    } catch (err) {
      console.error("Booking Error:", err);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="booking-page">
        <div className="booking-loading">
          <div className="booking-spinner"></div>
          <h2>Preparing your trip...</h2>
          <p>Please wait while we load your package.</p>
        </div>
      </main>
    );
  }

  if (error && !pkg) {
    return (
      <main className="booking-page">
        <div className="booking-error-page">
          <div>😕</div>
          <h2>{error}</h2>
          <button onClick={() => navigate("/packages")}>
            ← Back to Packages
          </button>
        </div>
      </main>
    );
  }

  if (!pkg) {
    return (
      <main className="booking-page">
        <div className="booking-error-page">
          <div>😕</div>
          <h2>Package not found.</h2>
          <button onClick={() => navigate("/packages")}>
            ← Back to Packages
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="booking-page">

      <div className="booking-container">

        {/* Header */}
        <div className="booking-header">

          <div className="booking-brand">
            <span className="brand-icon">✈</span>
            <span>TRAVELMATE</span>
          </div>

          <p className="booking-eyebrow">
            YOUR JOURNEY STARTS HERE
          </p>

          <h1>Complete Your Booking</h1>

          <p className="booking-subtitle">
            Plan your perfect trip and create unforgettable memories.
          </p>

        </div>

        {/* Main Grid */}
        <div className="booking-grid">

          {/* LEFT - Package Preview */}
          <section className="booking-package">

            <div className="package-image-wrapper">

              <img
                src={"/images/" + pkg.image_url}
                alt={pkg.title}
              />

              <div className="package-image-overlay"></div>

              <span className="package-location">
                📍 {pkg.destination}
              </span>

              <span className="package-tag">
                ✨ Popular Choice
              </span>

            </div>

            <div className="package-preview-content">

              <p className="package-mini-label">
                TRAVELMATE EXPERIENCE
              </p>

              <h2>{pkg.title}</h2>

              <div className="package-duration">
                <span>🗓️</span>
                <span>
                  {pkg.duration_days} Days
                </span>

                <i>•</i>

                <span>🌙</span>
                <span>
                  {pkg.duration_nights} Nights
                </span>
              </div>

              <div className="package-price">

                <div>
                  <small>Starting from</small>

                  <strong>
                    ₹{price.toLocaleString("en-IN")}
                  </strong>
                </div>

                <span>per package</span>

              </div>

              <div className="package-benefits">

                <div>
                  <span>✓</span>
                  Easy booking process
                </div>

                <div>
                  <span>✓</span>
                  Secure payment
                </div>

                <div>
                  <span>✓</span>
                  Memorable travel experience
                </div>

              </div>

            </div>

          </section>

          {/* RIGHT - Booking Form */}
          <section className="booking-form-card">

            <div className="form-card-header">

              <div className="form-title-icon">
                🧳
              </div>

              <div>
                <h2>Booking Details</h2>
                <p>Tell us about your trip</p>
              </div>

            </div>

            <form onSubmit={handleSubmit}>

              {/* Travel Date */}
              <div className="form-group">

                <label>
                  <span>📅</span>
                  Travel Date
                </label>

                <input
                  type="date"
                  value={travelDate}
                  min={
                    new Date()
                      .toISOString()
                      .split("T")[0]
                  }
                  onChange={(e) =>
                    setTravelDate(e.target.value)
                  }
                  required
                />

              </div>

              {/* Guests */}
              <div className="guest-row">

                <div className="form-group">

                  <label>
                    <span>👨</span>
                    Adults
                  </label>

                  <div className="number-input">

                    <button
                      type="button"
                      onClick={() =>
                        setAdults(
                          Math.max(1, Number(adults) - 1)
                        )
                      }
                    >
                      −
                    </button>

                    <input
                      type="number"
                      min="1"
                      value={adults}
                      onChange={(e) =>
                        setAdults(
                          Math.max(
                            1,
                            Number(e.target.value)
                          )
                        )
                      }
                      required
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setAdults(Number(adults) + 1)
                      }
                    >
                      +
                    </button>

                  </div>

                </div>

                <div className="form-group">

                  <label>
                    <span>👧</span>
                    Children
                  </label>

                  <div className="number-input">

                    <button
                      type="button"
                      onClick={() =>
                        setChildren(
                          Math.max(
                            0,
                            Number(children) - 1
                          )
                        )
                      }
                    >
                      −
                    </button>

                    <input
                      type="number"
                      min="0"
                      value={children}
                      onChange={(e) =>
                        setChildren(
                          Math.max(
                            0,
                            Number(e.target.value)
                          )
                        )
                      }
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setChildren(Number(children) + 1)
                      }
                    >
                      +
                    </button>

                  </div>

                </div>

              </div>

              <p className="children-note">
                💡 Children are charged at 50% of the adult price.
              </p>

              {/* Room Type */}
              <div className="form-group">

                <label>
                  <span>🛏️</span>
                  Choose Room Type
                </label>

                <div className="room-options">

                  <label
                    className={`room-option ${
                      roomType === "standard"
                        ? "selected"
                        : ""
                    }`}
                  >

                    <input
                      type="radio"
                      name="room"
                      value="standard"
                      checked={roomType === "standard"}
                      onChange={(e) =>
                        setRoomType(e.target.value)
                      }
                    />

                    <div className="room-option-content">
                      <strong>Standard</strong>
                      <small>Included</small>
                    </div>

                    <span className="room-check">✓</span>

                  </label>

                  <label
                    className={`room-option ${
                      roomType === "deluxe"
                        ? "selected"
                        : ""
                    }`}
                  >

                    <input
                      type="radio"
                      name="room"
                      value="deluxe"
                      checked={roomType === "deluxe"}
                      onChange={(e) =>
                        setRoomType(e.target.value)
                      }
                    />

                    <div className="room-option-content">
                      <strong>Deluxe</strong>
                      <small>+ ₹2,000</small>
                    </div>

                    <span className="room-check">✓</span>

                  </label>

                  <label
                    className={`room-option ${
                      roomType === "premium"
                        ? "selected"
                        : ""
                    }`}
                  >

                    <input
                      type="radio"
                      name="room"
                      value="premium"
                      checked={roomType === "premium"}
                      onChange={(e) =>
                        setRoomType(e.target.value)
                      }
                    />

                    <div className="room-option-content">
                      <strong>Premium</strong>
                      <small>+ ₹5,000</small>
                    </div>

                    <span className="room-check">✓</span>

                  </label>

                </div>

              </div>

              {/* Error */}
              {error && (
                <div className="booking-error">
                  ⚠️ {error}
                </div>
              )}

              {/* Price Summary */}
              <div className="price-summary">

                <div className="summary-header">
                  <div>
                    <span className="summary-icon">💰</span>
                    <h3>Price Summary</h3>
                  </div>
                </div>

                <div className="summary-row">
                  <span>
                    Adult Amount
                    <small>
                      {adults} adult{adults > 1 ? "s" : ""}
                    </small>
                  </span>

                  <strong>
                    ₹{adultAmount.toLocaleString("en-IN")}
                  </strong>
                </div>

                <div className="summary-row">
                  <span>
                    Children Amount
                    <small>
                      {children} child{children !== 1 ? "ren" : ""}
                    </small>
                  </span>

                  <strong>
                    ₹{childAmount.toLocaleString("en-IN")}
                  </strong>
                </div>

                <div className="summary-row">
                  <span>
                    Room Charges
                    <small>
                      {roomType.charAt(0).toUpperCase() +
                        roomType.slice(1)}
                    </small>
                  </span>

                  <strong>
                    ₹{additionalCharges.toLocaleString("en-IN")}
                  </strong>
                </div>

                {discountAmount > 0 && (
                  <div className="summary-row discount-row">
                    <span>
                      🎉 Group Discount
                      <small>10% discount</small>
                    </span>

                    <strong>
                      - ₹{discountAmount.toLocaleString("en-IN")}
                    </strong>
                  </div>
                )}

                <div className="summary-divider"></div>

                <div className="total-row">

                  <div>
                    <span>Total Amount</span>
                    <small>Final booking amount</small>
                  </div>

                  <strong>
                    ₹{totalAmount.toLocaleString("en-IN")}
                  </strong>

                </div>

              </div>

              {/* Confirm Button */}
              <button
                type="submit"
                disabled={submitting}
                className="confirm-booking-button"
              >

                {submitting ? (
                  <>
                    <span className="button-spinner"></span>
                    Creating Booking...
                  </>
                ) : (
                  <>
                    <span>✓</span>
                    Confirm Booking
                    <span className="confirm-arrow">→</span>
                  </>
                )}

              </button>

              <div className="secure-booking">

                <span>🔒</span>

                <div>
                  <strong>Safe & Secure Booking</strong>
                  <small>
                    Your booking information is protected.
                  </small>
                </div>

              </div>

            </form>

          </section>

        </div>

      </div>

    </main>
  );
}

export default Booking;

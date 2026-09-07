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
          `http://localhost:5000/api/packages/${packageId}`
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
        "http://localhost:5000/api/booking",
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
      <div className="booking-page">
        <h2>Loading booking...</h2>
      </div>
    );
  }

  if (error && !pkg) {
    return (
      <div className="booking-page">
        <h2>{error}</h2>
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="booking-page">
        <h2>Package not found.</h2>
      </div>
    );
  }

  return (
    <main className="booking-page">

      <div className="booking-container">

        <div className="booking-header">
          <p>TRAVELMATE</p>

          <h1>Complete Your Booking</h1>

          <span>
            Plan your perfect trip with us.
          </span>
        </div>

        <div className="booking-grid">

          {/* Package Summary */}
          <section className="booking-package">

            <img
              src={pkg.image_url}
              alt={pkg.title}
            />

            <div>
              <span>📍 {pkg.destination}</span>

              <h2>{pkg.title}</h2>

              <p>
                {pkg.duration_days} Days •{" "}
                {pkg.duration_nights} Nights
              </p>

              <strong>
                ₹
                {price.toLocaleString("en-IN")}
              </strong>
            </div>

          </section>

          {/* Booking Form */}
          <section className="booking-form-card">

            <h2>Booking Details</h2>

            <form onSubmit={handleSubmit}>

              {/* Travel Date */}
              <div className="form-group">

                <label>
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

              {/* Adults */}
              <div className="form-group">

                <label>
                  Adults
                </label>

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

              </div>

              {/* Children */}
              <div className="form-group">

                <label>
                  Children
                </label>

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

                <small>
                  Children are charged at 50% of
                  adult price.
                </small>

              </div>

              {/* Room */}
              <div className="form-group">

                <label>
                  Room Type
                </label>

                <select
                  value={roomType}
                  onChange={(e) =>
                    setRoomType(e.target.value)
                  }
                >
                  <option value="standard">
                    Standard — ₹0
                  </option>

                  <option value="deluxe">
                    Deluxe — ₹2,000
                  </option>

                  <option value="premium">
                    Premium — ₹5,000
                  </option>
                </select>

              </div>

              {/* Error */}
              {error && (
                <p className="booking-error">
                  {error}
                </p>
              )}

              {/* Price Summary */}
              <div className="price-summary">

                <h3>Price Summary</h3>

                <div>
                  <span>
                    Adult Amount
                  </span>

                  <strong>
                    ₹
                    {adultAmount.toLocaleString(
                      "en-IN"
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Children Amount
                  </span>

                  <strong>
                    ₹
                    {childAmount.toLocaleString(
                      "en-IN"
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Room Charges
                  </span>

                  <strong>
                    ₹
                    {additionalCharges.toLocaleString(
                      "en-IN"
                    )}
                  </strong>
                </div>

                {discountAmount > 0 && (
                  <div>
                    <span>
                      Discount
                    </span>

                    <strong>
                      - ₹
                      {discountAmount.toLocaleString(
                        "en-IN"
                      )}
                    </strong>
                  </div>
                )}

                <hr />

                <div className="total-row">

                  <span>
                    Total Amount
                  </span>

                  <strong>
                    ₹
                    {totalAmount.toLocaleString(
                      "en-IN"
                    )}
                  </strong>

                </div>

              </div>

              <button
                type="submit"
                disabled={submitting}
                className="confirm-booking-button"
              >
                {submitting
                  ? "Creating Booking..."
                  : "Confirm Booking"}
              </button>

            </form>

          </section>

        </div>

      </div>

    </main>
  );
}

export default Booking;
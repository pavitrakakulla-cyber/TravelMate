
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function BookingSuccess() {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadBooking = async () => {
      try {
        const response = await fetch(
          `/api/booking/${bookingId}`,
          {
            credentials: "include",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load booking");
        }

        setBooking(data.booking);
      } catch (err) {
        console.error("Booking Success Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadBooking();
  }, [bookingId]);

  if (loading) {
    return (
      <main className="booking-success-page">
        <div className="success-loading-card">
          <div className="loading-spinner"></div>
          <h2>Loading your booking...</h2>
          <p>Please wait while we fetch your booking details.</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="booking-success-page">
        <div className="success-error-card">
          <div className="error-icon">!</div>
          <h2>Unable to load booking</h2>
          <p>{error}</p>

          <button
            onClick={() => navigate("/user-home")}
            className="back-button"
          >
            ← Back to Home
          </button>
        </div>
      </main>
    );
  }

  if (!booking) {
    return (
      <main className="booking-success-page">
        <div className="success-error-card">
          <div className="error-icon">?</div>
          <h2>Booking Not Found</h2>
          <p>We couldn't find the booking you're looking for.</p>

          <button
            onClick={() => navigate("/user-home")}
            className="back-button"
          >
            ← Back to Home
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="booking-success-page">
      <div className="success-wrapper">

        {/* Success Header */}
        <div className="success-header">
          <div className="success-icon">
            <span>✓</span>
          </div>

          <div className="success-label">
            BOOKING CONFIRMED
          </div>

          <h1>Booking Created Successfully!</h1>

          <p>
            Your TravelMate booking has been created successfully.
            Get ready for your next adventure!
          </p>
        </div>

        {/* Main Card */}
        <div className="success-card">

          {/* Booking ID Bar */}
          <div className="booking-id-bar">
            <div>
              <span>BOOKING ID</span>
              <strong>#{booking.booking_id}</strong>
            </div>

            <div className="confirmed-badge">
              ✓ CONFIRMED
            </div>
          </div>

          {/* Package Banner */}
          <div className="package-banner">
            <div className="package-banner-icon">
              ✈️
            </div>

            <div className="package-banner-content">
              <span>TRAVEL PACKAGE</span>
              <h2>{booking.package_title}</h2>
              <p>📍 {booking.destination}</p>
            </div>
          </div>

          {/* Booking Details */}
          <div className="details-section">
            <div className="details-heading">
              <div className="details-heading-icon">📋</div>
              <div>
                <h3>Booking Details</h3>
                <p>Your trip information</p>
              </div>
            </div>

            <div className="booking-details">

              <div className="detail-item">
                <div className="detail-icon">📅</div>
                <div>
                  <span>Travel Date</span>
                  <strong>{booking.travel_date}</strong>
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-icon">👨‍👩‍👧</div>
                <div>
                  <span>Guests</span>
                  <strong>
                    {booking.adults} Adult
                    {booking.adults !== 1 ? "s" : ""}
                    {booking.children > 0 &&
                      ` • ${booking.children} Child${
                        booking.children !== 1 ? "ren" : ""
                      }`}
                  </strong>
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-icon">🛏️</div>
                <div>
                  <span>Room Type</span>
                  <strong>
                    {booking.room_type
                      ? booking.room_type.charAt(0).toUpperCase() +
                        booking.room_type.slice(1)
                      : "Standard"}
                  </strong>
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-icon">📍</div>
                <div>
                  <span>Destination</span>
                  <strong>{booking.destination}</strong>
                </div>
              </div>

            </div>
          </div>

          {/* Total */}
          <div className="total-section">
            <div>
              <span>Total Booking Amount</span>
              <small>Inclusive of selected options</small>
            </div>

            <strong>
              ₹{Number(booking.total_amount).toLocaleString("en-IN")}
            </strong>
          </div>

          {/* Payment */}
          <div className="payment-section">
            {booking.payment_status === "paid" ? (
              <div className="payment-completed">
                <span className="payment-check">✓</span>
                <div>
                  <strong>Payment Completed</strong>
                  <p>Your payment has been successfully received.</p>
                </div>
              </div>
            ) : (
              <button
                onClick={() =>
                  navigate(`/payment/${booking.booking_id}`)
                }
                className="pay-now-button"
              >
                <span>💳</span>
                Pay Now
                <span className="button-arrow">→</span>
              </button>
            )}
          </div>

          {/* Home */}
          <button
            onClick={() => navigate("/user-home")}
            className="back-button"
          >
            ← Back to Home
          </button>

          {/* Security Note */}
          <div className="secure-note">
            🔒 Your booking information is secure with TravelMate
          </div>

        </div>

      </div>
    </main>
  );
}

export default BookingSuccess;


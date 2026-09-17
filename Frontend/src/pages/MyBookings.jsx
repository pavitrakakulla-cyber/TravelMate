
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function MyBookings() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://localhost:5000/api/bookings",
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await response.json();

      console.log("MY BOOKINGS RESPONSE:", data);

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load bookings"
        );
      }

      setBookings(data.bookings || []);
    } catch (err) {
      console.error("Bookings Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // CANCEL BOOKING
  // =====================================================

  const handleCancelBooking = async (bookingId) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this booking?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setCancellingId(bookingId);

      const response = await fetch(
        `http://localhost:5000/api/booking/${bookingId}/cancel`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      console.log("CANCEL BOOKING RESPONSE:", data);

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to cancel booking"
        );
      }

      alert(
        data.message || "Booking cancelled successfully."
      );

      await fetchBookings();
    } catch (err) {
      console.error("Cancel Booking Error:", err);

      alert(
        err.message || "Unable to cancel booking."
      );
    } finally {
      setCancellingId(null);
    }
  };

  // =====================================================
  // DATE FORMAT
  // =====================================================

  const formatDate = (date) => {
    if (!date) return "Not available";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <main className="my-bookings-page">
        <div className="bookings-loading">

          <div className="loading-plane">
            ✈️
          </div>

          <h2>Loading your journeys...</h2>

          <p>
            Please wait while we fetch your bookings.
          </p>

          <div className="loading-bar">
            <span></span>
          </div>

        </div>
      </main>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <main className="my-bookings-page">

        <div className="booking-error">

          <div className="error-icon">
            ⚠️
          </div>

          <h2>Unable to load bookings</h2>

          <p>{error}</p>

          <button onClick={fetchBookings}>
            Try Again
          </button>

        </div>

      </main>
    );
  }

  // =====================================================
  // MAIN UI
  // =====================================================

  return (
    <main className="my-bookings-page">

      <div className="bookings-container">

        {/* PAGE HEADER */}
        <div className="bookings-header">

          <div className="bookings-title-section">

            <div className="bookings-title-icon">
              ✈️
            </div>

            <div>
              <span className="bookings-eyebrow">
                YOUR TRAVEL JOURNEY
              </span>

              <h1>My Bookings</h1>

              <p>
                View and manage all your TravelMate journeys.
              </p>
            </div>

          </div>

          <button
            className="home-button"
            onClick={() => navigate("/user-home")}
          >
            <span>←</span>
            Back to Home
          </button>

        </div>


        {/* BOOKING SUMMARY */}
        {bookings.length > 0 && (

          <div className="booking-summary">

            <div className="summary-box">

              <div className="summary-icon">
                🧳
              </div>

              <div>
                <span>Total Bookings</span>
                <strong>{bookings.length}</strong>
              </div>

            </div>


            <div className="summary-box">

              <div className="summary-icon">
                ✅
              </div>

              <div>
                <span>Confirmed</span>

                <strong>
                  {
                    bookings.filter(
                      (b) =>
                        b.booking_status === "confirmed"
                    ).length
                  }
                </strong>
              </div>

            </div>


            <div className="summary-box">

              <div className="summary-icon">
                ⏳
              </div>

              <div>
                <span>Pending</span>

                <strong>
                  {
                    bookings.filter(
                      (b) =>
                        b.booking_status === "pending"
                    ).length
                  }
                </strong>
              </div>

            </div>


            <div className="summary-box">

              <div className="summary-icon">
                ❌
              </div>

              <div>
                <span>Cancelled</span>

                <strong>
                  {
                    bookings.filter(
                      (b) =>
                        b.booking_status === "cancelled"
                    ).length
                  }
                </strong>
              </div>

            </div>

          </div>

        )}


        {/* NO BOOKINGS */}
        {bookings.length === 0 ? (

          <div className="no-bookings">

            <div className="empty-illustration">
              ✈️
            </div>

            <span className="empty-label">
              START YOUR JOURNEY
            </span>

            <h2>No bookings yet</h2>

            <p>
              You haven't made any travel bookings yet.
              Discover your next adventure with TravelMate.
            </p>

            <button
              onClick={() => navigate("/packages")}
            >
              Explore Packages
              <span>→</span>
            </button>

          </div>

        ) : (

          /* BOOKING LIST */
          <div className="booking-list">

            {bookings.map((booking) => (

              <div
                className={`booking-card ${
                  booking.booking_status === "cancelled"
                    ? "booking-cancelled"
                    : ""
                }`}
                key={booking.booking_id}
              >

                {/* CARD TOP */}
                <div className="booking-card-header">

                  <div className="booking-main-info">

                    <div className="destination-icon">
                      🌍
                    </div>

                    <div>

                      <h2>
                        {booking.title}
                      </h2>

                      <span className="booking-id">
                        Booking ID #{booking.booking_id}
                      </span>

                    </div>

                  </div>


                  <span
                    className={`booking-status ${booking.booking_status}`}
                  >
                    <span className="status-dot"></span>
                    {booking.booking_status}
                  </span>

                </div>


                {/* TRAVEL DETAILS */}
                <div className="booking-details">

                  <div className="detail-item">

                    <span className="detail-icon">
                      📅
                    </span>

                    <div>
                      <span>Travel Date</span>

                      <strong>
                        {formatDate(booking.travel_date)}
                      </strong>
                    </div>

                  </div>


                  <div className="detail-item">

                    <span className="detail-icon">
                      👨‍👩‍👧
                    </span>

                    <div>
                      <span>Guests</span>

                      <strong>
                        {booking.adults} Adults
                        {Number(booking.children) > 0 &&
                          ` • ${booking.children} Children`}
                      </strong>
                    </div>

                  </div>


                  <div className="detail-item">

                    <span className="detail-icon">
                      🛏️
                    </span>

                    <div>
                      <span>Room Type</span>

                      <strong>
                        {booking.room_type}
                      </strong>
                    </div>

                  </div>

                </div>


                {/* PAYMENT SECTION */}
                <div className="booking-payment">

                  <div className="amount-section">

                    <span>Total Amount</span>

                    <strong>
                      ₹
                      {Number(
                        booking.total_amount
                      ).toLocaleString("en-IN")}
                    </strong>

                  </div>


                  <div className="payment-info">

                    <span>Payment</span>

                    <strong
                      className={
                        booking.payment_status === "paid"
                          ? "payment-paid"
                          : booking.payment_status === "refunded"
                          ? "payment-refunded"
                          : "payment-pending"
                      }
                    >
                      {booking.payment_status || "Pending"}
                    </strong>

                  </div>


                  <div className="payment-info">

                    <span>Method</span>

                    <strong>
                      {booking.payment_method || "-"}
                    </strong>

                  </div>

                </div>


                {/* ACTIONS */}
                <div className="booking-actions">

                  <button
                    className="view-booking-btn"
                    onClick={() =>
                      navigate(
                        `/booking-success/${booking.booking_id}`
                      )
                    }
                  >
                    View Booking
                    <span>→</span>
                  </button>


                  {/* CANCEL BUTTON */}
                  {booking.booking_status !== "cancelled" && (

                    <button
                      className="cancel-booking-btn"
                      onClick={() =>
                        handleCancelBooking(
                          booking.booking_id
                        )
                      }
                      disabled={
                        cancellingId === booking.booking_id
                      }
                    >
                      {cancellingId === booking.booking_id
                        ? "Cancelling..."
                        : "Cancel Booking"}
                    </button>

                  )}

                </div>


                {/* REFUND MESSAGE */}
                {booking.payment_status === "refunded" && (

                  <div className="refund-message">
                    <span>💰</span>

                    <div>
                      <strong>Refund Processed</strong>
                      <p>
                        Your refund has been processed for
                        this booking.
                      </p>
                    </div>
                  </div>

                )}


                {/* CANCELLED MESSAGE */}
                {booking.booking_status === "cancelled" &&
                  booking.payment_status !== "refunded" && (

                    <div className="cancelled-message">

                      <span>❌</span>

                      <div>
                        <strong>Booking Cancelled</strong>
                        <p>
                          This booking has been cancelled.
                        </p>
                      </div>

                    </div>

                )}

              </div>

            ))}

          </div>

        )}

      </div>

    </main>
  );
}

export default MyBookings;


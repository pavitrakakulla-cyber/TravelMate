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
        <div className="bookings-container">
          <h1>My Bookings</h1>
          <p>Loading your bookings...</p>
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
        <div className="bookings-container">
          <h1>My Bookings</h1>

          <div className="booking-error">
            <h3>Unable to load bookings</h3>

            <p>{error}</p>

            <button onClick={fetchBookings}>
              Try Again
            </button>
          </div>
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

        {/* HEADER */}
        <div className="bookings-header">

          <div>
            <h1>My Bookings</h1>

            <p>
              View and manage your TravelMate bookings.
            </p>
          </div>

          <button
            className="home-button"
            onClick={() => navigate("/user-home")}
          >
            Back to Home
          </button>

        </div>


        {/* NO BOOKINGS */}
        {bookings.length === 0 ? (

          <div className="no-bookings">

            <div className="empty-icon">
              ✈️
            </div>

            <h2>No bookings yet</h2>

            <p>
              You haven't made any travel bookings yet.
            </p>

            <button
              onClick={() => navigate("/packages")}
            >
              Explore Packages
            </button>

          </div>

        ) : (

          /* BOOKING LIST */
          <div className="booking-list">

            {bookings.map((booking) => (

              <div
                className="booking-card"
                key={booking.booking_id}
              >

                {/* CARD HEADER */}
                <div className="booking-card-header">

                  <div>

                    <h2>
                      {booking.title}
                    </h2>

                    <span className="booking-id">
                      Booking ID #{booking.booking_id}
                    </span>

                  </div>

                  <span
                    className={`booking-status ${booking.booking_status}`}
                  >
                    {booking.booking_status}
                  </span>

                </div>


                {/* BOOKING DETAILS */}
                <div className="booking-details">

                  <div className="detail-item">
                    <span>Travel Date</span>

                    <strong>
                      {formatDate(booking.travel_date)}
                    </strong>
                  </div>


                  <div className="detail-item">
                    <span>Adults</span>

                    <strong>
                      {booking.adults}
                    </strong>
                  </div>


                  <div className="detail-item">
                    <span>Children</span>

                    <strong>
                      {booking.children}
                    </strong>
                  </div>


                  <div className="detail-item">
                    <span>Room Type</span>

                    <strong>
                      {booking.room_type}
                    </strong>
                  </div>

                </div>


                {/* PAYMENT DETAILS */}
                <div className="booking-payment">

                  <div>

                    <span>Total Amount</span>

                    <strong>
                      ₹
                      {Number(
                        booking.total_amount
                      ).toLocaleString("en-IN")}
                    </strong>

                  </div>


                  <div>

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


                  <div>

                    <span>Method</span>

                    <strong>
                      {booking.payment_method || "-"}
                    </strong>

                  </div>

                </div>


                {/* ACTIONS */}
                <div className="booking-actions">

                  <button
                    onClick={() =>
                      navigate(
                        `/booking-success/${booking.booking_id}`
                      )
                    }
                  >
                    View Booking
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
                    💰 Refund has been processed for this booking.
                  </div>

                )}


                {/* CANCELLED MESSAGE */}
                {booking.booking_status === "cancelled" &&
                  booking.payment_status !== "refunded" && (

                    <div className="cancelled-message">
                      ❌ This booking has been cancelled.
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

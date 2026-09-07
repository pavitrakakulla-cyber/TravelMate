import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function BookingDetails() {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadBooking = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/booking/${bookingId}`,
          {
            credentials: "include",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to load booking"
          );
        }

        setBooking(data.booking);
      } catch (err) {
        console.error("Booking Details Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadBooking();
  }, [bookingId]);

  const handleCancel = async () => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this booking?"
    );

    if (!confirmCancel) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/bookings/${bookingId}/cancel`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to cancel booking"
        );
      }

      alert(data.message || "Booking cancelled successfully.");

      // Reload booking details
      window.location.reload();

    } catch (err) {
      console.error("Cancel Error:", err);
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <main className="booking-details-page">
        <div className="booking-details-card">
          <h2>Loading booking...</h2>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="booking-details-page">
        <div className="booking-details-card">
          <h2>Unable to load booking</h2>
          <p>{error}</p>

          <button onClick={() => navigate("/my-bookings")}>
            Back to My Bookings
          </button>
        </div>
      </main>
    );
  }

  if (!booking) {
    return (
      <main className="booking-details-page">
        <div className="booking-details-card">
          <h2>Booking not found</h2>
        </div>
      </main>
    );
  }

  const isPaid = booking.payment_status === "paid";
  const isCancelled = booking.booking_status === "cancelled";

  return (
    <main className="booking-details-page">

      <div className="booking-details-card">

        <div className="details-header">

          <div>
            <span className="details-label">
              TRAVELMATE BOOKING
            </span>

            <h1>Booking Details</h1>

            <p>
              Booking ID #{booking.booking_id}
            </p>
          </div>

          <span
            className={`booking-status ${booking.booking_status}`}
          >
            {booking.booking_status}
          </span>

        </div>


        {/* Package */}

        <section className="details-section">

          <h2>Package Information</h2>

          <div className="details-grid">

            <div>
              <span>Package</span>
              <strong>
                {booking.package_title || booking.title}
              </strong>
            </div>

            <div>
              <span>Destination</span>
              <strong>
                {booking.destination}
              </strong>
            </div>

          </div>

        </section>


        {/* Travel */}

        <section className="details-section">

          <h2>Travel Information</h2>

          <div className="details-grid">

            <div>
              <span>Travel Date</span>
              <strong>
                {new Date(
                  booking.travel_date
                ).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </strong>
            </div>

            <div>
              <span>Adults</span>
              <strong>
                {booking.adults}
              </strong>
            </div>

            <div>
              <span>Children</span>
              <strong>
                {booking.children}
              </strong>
            </div>

            <div>
              <span>Room Type</span>
              <strong>
                {booking.room_type}
              </strong>
            </div>

          </div>

        </section>


        {/* Payment */}

        <section className="details-section">

          <h2>Payment Information</h2>

          <div className="details-grid">

            <div>
              <span>Total Amount</span>

              <strong className="details-total">
                ₹
                {Number(
                  booking.total_amount
                ).toLocaleString("en-IN")}
              </strong>
            </div>

            <div>
              <span>Payment Status</span>

              <strong
                className={
                  isPaid
                    ? "payment-paid"
                    : "payment-pending"
                }
              >
                {booking.payment_status || "Pending"}
              </strong>
            </div>

            <div>
              <span>Payment Method</span>

              <strong>
                {booking.payment_method || "-"}
              </strong>
            </div>

          </div>

        </section>


        {/* Actions */}

        <div className="details-actions">

          <button
            className="back-button"
            onClick={() => navigate("/my-bookings")}
          >
            ← Back to My Bookings
          </button>


          {/* Pay only if unpaid */}

          {!isPaid && !isCancelled && (
            <button
              className="pay-now-button"
              onClick={() =>
                navigate(
                  `/payment/${booking.booking_id}`
                )
              }
            >
              💳 Pay Now
            </button>
          )}


          {/* Cancel */}

          {!isCancelled && (
            <button
              className="cancel-booking-button"
              onClick={handleCancel}
            >
              ❌ Cancel Booking
            </button>
          )}

        </div>


        {/* Payment completed */}

        {isPaid && !isCancelled && (
          <div className="payment-completed">
            ✅ Payment Completed
          </div>
        )}


        {/* Cancelled */}

        {isCancelled && (
          <div className="booking-cancelled-message">
            ❌ This booking has been cancelled.
          </div>
        )}

      </div>

    </main>
  );
}

export default BookingDetails;
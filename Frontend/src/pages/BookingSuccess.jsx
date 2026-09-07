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
      <div className="booking-success-page">
        <h2>Loading booking...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="booking-success-page">
        <h2>Unable to load booking</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="booking-success-page">
        <h2>Booking not found</h2>
      </div>
    );
  }

  return (
    <main className="booking-success-page">
      <div className="success-card">

        <div className="success-icon">
          ✅
        </div>

        <h1>Booking Created Successfully!</h1>

        <p>
          Your TravelMate booking has been created.
        </p>

        <div className="booking-details">

          <div>
            <span>Booking ID</span>
            <strong>#{booking.booking_id}</strong>
          </div>

          <div>
            <span>Package</span>
            <strong>{booking.package_title}</strong>
          </div>

          <div>
            <span>Destination</span>
            <strong>{booking.destination}</strong>
          </div>

          <div>
            <span>Travel Date</span>
            <strong>{booking.travel_date}</strong>
          </div>

          <div>
            <span>Adults</span>
            <strong>{booking.adults}</strong>
          </div>

          <div>
            <span>Children</span>
            <strong>{booking.children}</strong>
          </div>

          <div>
            <span>Room Type</span>
            <strong>{booking.room_type}</strong>
          </div>

          <div className="total">
            <span>Total Amount</span>
            <strong>
              ₹{Number(booking.total_amount).toLocaleString("en-IN")}
            </strong>
          </div>

        </div>

        {booking.payment_status === "paid" ? (
            <div className="payment-completed">
              ✅ Payment Completed
            </div>
          ) : (
            <button
              onClick={() =>
                navigate(`/payment/${booking.booking_id}`)
              }
              className="pay-now-button"
            >
              💳 Pay Now
            </button>
        )}

        <button
          onClick={() => navigate("/user-home")}
          className="back-button"
        >
          Back to Home
        </button>

      </div>
    </main>
  );
}

export default BookingSuccess;
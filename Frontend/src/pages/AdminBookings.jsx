import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminBookings() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/admin/bookings",
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await response.json();

      console.log("ADMIN BOOKINGS RESPONSE:", data);

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load bookings"
        );
      }

      setBookings(data.bookings || []);
    } catch (err) {
      console.error("Admin Bookings Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount) => {
    return Number(amount || 0).toLocaleString("en-IN");
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-card">
          <h2>Loading Bookings...</h2>
          <p>Please wait.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page">
        <div className="admin-card">
          <h2>❌ Unable to Load Bookings</h2>

          <p>{error}</p>

          <button onClick={loadBookings}>
            Try Again
          </button>

          <button onClick={() => navigate("/admin/dashboard")}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="admin-page">

      <div className="admin-page-header">
        <div>
          <h1>🧳 Booking Management</h1>
          <p>
            View and manage all TravelMate customer bookings.
          </p>
        </div>

        <button
          className="back-button"
          onClick={() => navigate("/admin/dashboard")}
        >
          ← Dashboard
        </button>
      </div>

      <div className="booking-summary">
        <div className="summary-card">
          <span>Total Bookings</span>
          <strong>{bookings.length}</strong>
        </div>

        <div className="summary-card">
          <span>Confirmed</span>
          <strong>
            {
              bookings.filter(
                (b) => b.booking_status === "confirmed"
              ).length
            }
          </strong>
        </div>

        <div className="summary-card">
          <span>Pending</span>
          <strong>
            {
              bookings.filter(
                (b) => b.booking_status === "pending"
              ).length
            }
          </strong>
        </div>

        <div className="summary-card">
          <span>Cancelled</span>
          <strong>
            {
              bookings.filter(
                (b) => b.booking_status === "cancelled"
              ).length
            }
          </strong>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="admin-card">
          <h2>No bookings found</h2>
          <p>There are currently no customer bookings.</p>
        </div>
      ) : (
        <div className="bookings-table-container">

          <table className="bookings-table">

            <thead>
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Email</th>
                <th>Package</th>
                <th>Destination</th>
                <th>Travel Date</th>
                <th>Guests</th>
                <th>Room</th>
                <th>Total</th>
                <th>Booking</th>
                <th>Payment</th>
                <th>Method</th>
              </tr>
            </thead>

            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.booking_id}>

                  <td>
                    <strong>
                      #{booking.booking_id}
                    </strong>
                  </td>

                  <td>
                    {booking.user_name || "-"}
                  </td>

                  <td>
                    {booking.user_email || "-"}
                  </td>

                  <td>
                    <strong>
                      {booking.package_title || "-"}
                    </strong>
                  </td>

                  <td>
                    {booking.destination || "-"}
                  </td>

                  <td>
                    {booking.travel_date || "-"}
                  </td>

                  <td>
                    {Number(booking.adults || 0)}
                    {" + "}
                    {Number(booking.children || 0)}
                  </td>

                  <td>
                    {booking.room_type || "-"}
                  </td>

                  <td>
                    <strong>
                      ₹{formatAmount(booking.total_amount)}
                    </strong>
                  </td>

                  <td>
                    <span
                      className={`status-badge ${booking.booking_status}`}
                    >
                      {booking.booking_status}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`payment-badge ${
                        booking.payment_status
                          ? booking.payment_status.toLowerCase()
                          : ""
                      }`}
                    >
                      {booking.payment_status || "Not Paid"}
                    </span>
                  </td>

                  <td>
                    {booking.payment_method || "-"}
                  </td>

                </tr>
              ))}
            </tbody>

          </table>

        </div>
      )}

    </main>
  );
}

export default AdminBookings;


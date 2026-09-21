import { useEffect, useState } from "react";

function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/admin/payments",
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await response.json();

      console.log("ADMIN PAYMENTS RESPONSE:", data);

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load payments"
        );
      }

      setPayments(data.payments || []);

    } catch (err) {
      console.error("Admin Payments Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount) => {
    return Number(amount || 0).toLocaleString("en-IN");
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "paid":
        return "status-paid";

      case "created":
        return "status-created";

      case "failed":
        return "status-failed";

      case "refunded":
        return "status-refunded";

      default:
        return "status-created";
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-card">
          <h2>Loading Payments...</h2>
          <p>Please wait.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page">
        <div className="admin-card">
          <h2>Payment Error</h2>

          <p className="error-message">
            {error}
          </p>

          <button onClick={loadPayments}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">

      <div className="admin-page-header">

        <div>
          <h1>Payments</h1>

          <p>
            Monitor TravelMate payment transactions.
          </p>
        </div>

        <button
          className="refresh-button"
          onClick={loadPayments}
        >
          🔄 Refresh
        </button>

      </div>

      <div className="payment-summary">

        <div className="summary-card">
          <span>Total Payments</span>
          <strong>{payments.length}</strong>
        </div>

        <div className="summary-card">
          <span>Paid</span>
          <strong>
            {
              payments.filter(
                (payment) =>
                  payment.payment_status === "paid"
              ).length
            }
          </strong>
        </div>

        <div className="summary-card">
          <span>Pending</span>
          <strong>
            {
              payments.filter(
                (payment) =>
                  payment.payment_status === "created"
              ).length
            }
          </strong>
        </div>

        <div className="summary-card">
          <span>Refunded</span>
          <strong>
            {
              payments.filter(
                (payment) =>
                  payment.payment_status === "refunded"
              ).length
            }
          </strong>
        </div>

      </div>

      <div className="payments-table-container">

        {payments.length === 0 ? (

          <div className="empty-state">
            <div className="empty-icon">
              💳
            </div>

            <h2>No Payments Found</h2>

            <p>
              There are no payment transactions yet.
            </p>
          </div>

        ) : (

          <table className="payments-table">

            <thead>
              <tr>
                <th>Payment ID</th>
                <th>Booking</th>
                <th>User</th>
                <th>Package</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Method</th>
                <th>Razorpay Order</th>
                <th>Payment ID</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>

              {payments.map((payment) => (

                <tr key={payment.payment_id}>

                  <td>
                    #{payment.payment_id}
                  </td>

                  <td>
                    #{payment.booking_id}
                  </td>

                  <td>
                    <strong>
                      {payment.user_name}
                    </strong>

                    <small>
                      {payment.user_email}
                    </small>
                  </td>

                  <td>
                    {payment.package_title}
                  </td>

                  <td>
                    <strong>
                      ₹{formatAmount(payment.amount)}
                    </strong>
                  </td>

                  <td>
                    <span
                      className={`payment-status ${getStatusClass(
                        payment.payment_status
                      )}`}
                    >
                      {payment.payment_status}
                    </span>
                  </td>

                  <td>
                    {payment.payment_method || "-"}
                  </td>

                  <td>
                    <span className="razorpay-id">
                      {payment.razorpay_order_id || "-"}
                    </span>
                  </td>

                  <td>
                    <span className="razorpay-id">
                      {payment.razorpay_payment_id || "-"}
                    </span>
                  </td>

                  <td>
                    {payment.created_at
                      ? new Date(
                          payment.created_at
                        ).toLocaleString("en-IN")
                      : "-"}
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        )}

      </div>

    </div>
  );
}

export default AdminPayments;
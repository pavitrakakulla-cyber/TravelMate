import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function Payment() {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [error, setError] = useState("");

  // Prevent duplicate payment-create API calls
  const paymentRequestSent = useRef(false);

  useEffect(() => {
    if (!bookingId) {
      setError("Booking ID is missing");
      setLoading(false);
      return;
    }

    // React StrictMode can run useEffect twice in development
    if (paymentRequestSent.current) {
      return;
    }

    paymentRequestSent.current = true;

    createPaymentOrder();
  }, [bookingId]);

  const createPaymentOrder = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `http://localhost:5000/api/payment/create/${bookingId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      const data = await response.json();

      console.log("PAYMENT CREATE RESPONSE:", data);

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to create payment"
        );
      }

      setPaymentData(data);

    } catch (err) {
      console.error("Payment Error:", err);
      setError(err.message || "Unable to create payment");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = () => {
    if (!paymentData) {
      return;
    }

    // Razorpay SDK check
    if (!window.Razorpay) {
      setError("Razorpay SDK is not loaded.");
      return;
    }

    setProcessing(true);
    setError("");

    const options = {
      key: paymentData.razorpay_key_id,

      amount: paymentData.amount,

      currency: "INR",

      name: "TravelMate",

      description: paymentData.title,

      order_id: paymentData.razorpay_order_id,

      handler: async function (response) {
        console.log("========== RAZORPAY RESPONSE ==========");
        console.log("Razorpay Response:", response);

        try {
          const verifyResponse = await fetch(
            "http://localhost:5000/api/payment/verify",
            {
              method: "POST",

              headers: {
                "Content-Type": "application/json",
              },

              credentials: "include",

              body: JSON.stringify({
                razorpay_payment_id:
                  response.razorpay_payment_id,

                razorpay_order_id:
                  response.razorpay_order_id,

                razorpay_signature:
                  response.razorpay_signature,
              }),
            }
          );

          const data = await verifyResponse.json();

          console.log(
            "PAYMENT VERIFICATION RESPONSE:",
            data
          );

          if (!verifyResponse.ok) {
            throw new Error(
              data.message ||
                "Payment verification failed"
            );
          }

          if (data.status === "success") {
            console.log(
              "✅ PAYMENT VERIFIED SUCCESSFULLY"
            );

            navigate(
              `/booking-success/${data.booking_id}`
            );
          } else {
            throw new Error(
              data.message ||
                "Payment verification failed"
            );
          }

        } catch (err) {
          console.error(
            "❌ Verification Error:",
            err
          );

          setError(
            err.message ||
              "Payment verification failed"
          );

          setProcessing(false);
        }
      },

      prefill: {
        name: "",
        email: "",
        contact: "",
      },

      theme: {
        color: "#0d6efd",
      },

      modal: {
        ondismiss: function () {
          console.log("Razorpay payment window closed");
          setProcessing(false);
        },
      },
    };

    try {
      const razorpay = new window.Razorpay(options);

      razorpay.on(
        "payment.failed",
        function (response) {
          console.error(
            "❌ Razorpay Payment Failed:",
            response
          );

          setError(
            response.error?.description ||
              "Payment failed"
          );

          setProcessing(false);
        }
      );

      razorpay.open();

    } catch (err) {
      console.error(
        "❌ Razorpay Error:",
        err
      );

      setError(
        err.message ||
          "Unable to open Razorpay"
      );

      setProcessing(false);
    }
  };

  // Loading
  if (loading) {
    return (
      <div className="payment-page">
        <div className="payment-card">
          <h2>Preparing Payment...</h2>
          <p>Please wait while we prepare your payment.</p>
        </div>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="payment-page">
        <div className="payment-card">

          <div className="payment-icon">
            ❌
          </div>

          <h2>Payment Error</h2>

          <p className="payment-error">
            {error}
          </p>

          <button
            onClick={() => navigate("/user-home")}
          >
            Back to Home
          </button>

        </div>
      </div>
    );
  }

  // No payment data
  if (!paymentData) {
    return (
      <div className="payment-page">
        <div className="payment-card">
          <h2>Unable to load payment</h2>

          <button
            onClick={() => navigate("/user-home")}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="payment-page">

      <div className="payment-card">

        <div className="payment-icon">
          💳
        </div>

        <h1>Complete Payment</h1>

        <p>
          Secure your TravelMate booking.
        </p>

        <div className="payment-details">

          <div>
            <span>Booking ID</span>
            <strong>
              #{bookingId}
            </strong>
          </div>

          <div>
            <span>Package</span>

            <strong>
              {paymentData.title}
            </strong>
          </div>

          <div>
            <span>Amount</span>

            <strong>
              ₹
              {Number(
                paymentData.amount_rupees
              ).toLocaleString("en-IN")}
            </strong>
          </div>

        </div>

        <button
          className="pay-now-button"
          onClick={handlePayment}
          disabled={processing}
        >
          {processing
            ? "Processing..."
            : `Pay ₹${Number(
                paymentData.amount_rupees
              ).toLocaleString("en-IN")}`}
        </button>

      </div>

    </main>
  );
}

export default Payment;


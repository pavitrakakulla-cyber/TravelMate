
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
        `/api/payment/create/${bookingId}`,
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
            "/api/payment/verify",
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
        color: "#2563eb",
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

  // ================= LOADING =================

  if (loading) {
    return (
      <main className="payment-page">
        <div className="payment-loading-card">

          <div className="payment-loading-icon">
            💳
          </div>

          <div className="payment-spinner"></div>

          <h2>Preparing Your Payment</h2>

          <p>
            Please wait while we securely prepare
            your payment.
          </p>

        </div>
      </main>
    );
  }

  // ================= ERROR =================

  if (error) {
    return (
      <main className="payment-page">
        <div className="payment-error-card">

          <div className="payment-error-icon">
            !
          </div>

          <div className="payment-error-label">
            PAYMENT ISSUE
          </div>

          <h2>Payment Could Not Be Started</h2>

          <p className="payment-error">
            {error}
          </p>

          <button
            className="payment-back-button"
            onClick={() => navigate("/user-home")}
          >
            ← Back to Home
          </button>

        </div>
      </main>
    );
  }

  // ================= NO PAYMENT DATA =================

  if (!paymentData) {
    return (
      <main className="payment-page">
        <div className="payment-error-card">

          <div className="payment-error-icon">
            ?
          </div>

          <h2>Unable to Load Payment</h2>

          <p>
            We couldn't prepare the payment details
            for this booking.
          </p>

          <button
            className="payment-back-button"
            onClick={() => navigate("/user-home")}
          >
            ← Back to Home
          </button>

        </div>
      </main>
    );
  }

  // ================= MAIN PAYMENT PAGE =================

  const amount = Number(
    paymentData.amount_rupees
  ).toLocaleString("en-IN");

  return (
    <main className="payment-page">

      <div className="payment-wrapper">

        {/* Top Heading */}

        <div className="payment-heading">

          <div className="payment-heading-icon">
            💳
          </div>

          <div className="payment-label">
            SECURE CHECKOUT
          </div>

          <h1>Complete Your Payment</h1>

          <p>
            Secure your TravelMate booking and
            get ready for your next adventure.
          </p>

        </div>

        {/* Main Card */}

        <div className="payment-card">

          {/* Booking Header */}

          <div className="payment-booking-header">

            <div>
              <span>BOOKING ID</span>

              <strong>
                #{bookingId}
              </strong>
            </div>

            <div className="payment-secure-badge">
              🔒 SECURE
            </div>

          </div>

          {/* Package */}

          <div className="payment-package">

            <div className="payment-package-icon">
              ✈️
            </div>

            <div className="payment-package-info">

              <span>TRAVEL PACKAGE</span>

              <h2>
                {paymentData.title}
              </h2>

              <p>
                Your selected TravelMate package
              </p>

            </div>

          </div>

          {/* Amount */}

          <div className="payment-amount-box">

            <div>
              <span>AMOUNT TO PAY</span>

              <small>
                Secure payment via Razorpay
              </small>
            </div>

            <strong>
              ₹{amount}
            </strong>

          </div>

          {/* Payment Info */}

          <div className="payment-info-grid">

            <div className="payment-info-item">

              <div className="payment-info-icon">
                🔐
              </div>

              <div>
                <strong>Secure Payment</strong>
                <span>
                  Your transaction is protected
                </span>
              </div>

            </div>

            <div className="payment-info-item">

              <div className="payment-info-icon">
                ⚡
              </div>

              <div>
                <strong>Instant Confirmation</strong>
                <span>
                  Booking confirmed after payment
                </span>
              </div>

            </div>

          </div>

          {/* Pay Button */}

          <button
            className="payment-pay-button"
            onClick={handlePayment}
            disabled={processing}
          >
            {processing ? (
              <>
                <span className="button-spinner"></span>
                Processing Payment...
              </>
            ) : (
              <>
                <span>💳</span>
                Pay ₹{amount}
                <span className="payment-arrow">
                  →
                </span>
              </>
            )}
          </button>

          {/* Back */}

          <button
            className="payment-back-button"
            onClick={() => navigate("/user-home")}
            disabled={processing}
          >
            ← Back to Home
          </button>

          {/* Footer */}

          <div className="payment-footer">

            <span>🔒</span>

            <p>
              Payments are securely processed by
              Razorpay. TravelMate does not store
              your card details.
            </p>

          </div>

        </div>

      </div>

    </main>
  );
}

export default Payment;

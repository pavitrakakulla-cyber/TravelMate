from flask import Flask, render_template, request, redirect, session, jsonify, send_from_directory
from flask_cors import CORS
import os
from dotenv import load_dotenv
from werkzeug.security import generate_password_hash,check_password_hash
from decimal import Decimal
import mysql.connector
import razorpay
import random
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta
load_dotenv()

app = Flask(__name__)
FRONTEND_DIST = os.path.join(os.path.dirname(os.path.abspath(__file__)), "Frontend", "dist")

app.secret_key = "travelmate-secret-key"
app.config["SESSION_COOKIE_NAME"] = "travelmate_session"
app.config["SESSION_COOKIE_HTTPONLY"] = True
app.config["SESSION_COOKIE_SAMESITE"] = "Lax"
app.config["SESSION_COOKIE_SECURE"] = False

CORS(
    app,
    origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://travelmateproject.vercel.app",
        
    ],
    supports_credentials=True
)
# MySQL Connection

conn = mysql.connector.connect(
    host=os.getenv("MYSQL_HOST"),
    user=os.getenv("MYSQL_USER"),
    password=os.getenv("MYSQL_PASSWORD"),
    database=os.getenv("MYSQL_DATABASE"),
    autocommit=False
)
cursor = conn.cursor(dictionary=True)
RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET")


client = razorpay.Client(
    auth=(
        RAZORPAY_KEY_ID,
        RAZORPAY_KEY_SECRET
    )
)
otp_storage = {}
def send_otp_email(receiver_email, otp):
    sender_email = os.getenv("MAIL_USERNAME")
    sender_password = os.getenv("MAIL_PASSWORD")

    subject = "TravelMate - Email Verification OTP"

    body = f"""
Hello,

Welcome to TravelMate! 🌍

Your email verification OTP is:

{otp}

This OTP is valid for 5 minutes.

If you did not create a TravelMate account, please ignore this email.

Regards,
TravelMate Team
"""

    message = MIMEMultipart()
    message["From"] = sender_email
    message["To"] = receiver_email
    message["Subject"] = subject

    message.attach(MIMEText(body, "plain"))

    try:
        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.starttls()
            server.login(sender_email, sender_password)
            server.sendmail(
                sender_email,
                receiver_email,
                message.as_string()
            )

        print("✅ OTP email sent successfully")
        return True

    except Exception as e:
        print("❌ OTP email error:", e)
        return False
@app.route("/")
def home():
    return send_from_directory(FRONTEND_DIST, "index.html")
@app.route("/api/auth/me", methods=["GET"])
def auth_me():

    print("AUTH ME SESSION:", dict(session))

    user_logged_in = "user_id" in session
    admin_logged_in = "admin_id" in session

    if not user_logged_in and not admin_logged_in:
        return jsonify({
            "logged_in": False,
            "user_id": None,
            "user_name": None,
            "user_email": None,
            "admin_id": None,
            "admin_name": None
        }), 401

    return jsonify({
        "logged_in": True,

        "user_id": session.get("user_id"),
        "user_name": session.get("user_name"),
        "user_email": session.get("user_email"),

        "admin_id": session.get("admin_id"),
        "admin_name": session.get("admin_name")
    }), 200
@app.route("/api/auth/logout", methods=["POST"])
def user_logout():
    session.pop("user_id", None)
    session.pop("user_name", None)
    session.pop("user_email", None)
    print("========== LOGOUT CALLED ==========")
    print("BEFORE LOGOUT:", dict(session))

    session.clear()

    print("AFTER LOGOUT:", dict(session))


    return jsonify({
        "success": True,
        "message": "User logged out successfully"
    }), 200
@app.route("/api/auth/register", methods=["POST"])
def api_register():

    try:
        data = request.form

        full_name = data.get("full_name", "").strip()
        phone = data.get("phone", "").strip()
        email = data.get("email", "").strip().lower()
        password = data.get("password", "")

        if not full_name or not phone or not email or not password:
            return jsonify({
                "message": "Please fill all fields."
            }), 400

        # Check existing email
        cursor.execute(
            "SELECT * FROM users WHERE email=%s",
            (email,)
        )

        existing_user = cursor.fetchone()

        if existing_user:
            return jsonify({
                "message": "Email already exists."
            }), 409

        # Generate 6 digit OTP
        otp = str(random.randint(100000, 999999))

        # OTP expiry
        expiry = datetime.now() + timedelta(minutes=5)

        # Hash password
        password_hash = generate_password_hash(password)

        # Create user as NOT verified
        cursor.execute("""
            INSERT INTO users
            (
                full_name,
                email,
                password_hash,
                phone,
                email_verified
            )
            VALUES (%s, %s, %s, %s, %s)
        """, (
            full_name,
            email,
            password_hash,
            phone,
            0
        ))

        conn.commit()

        # Store OTP
        otp_storage[email] = {
            "otp": otp,
            "expires_at": expiry
        }

        # Send email
        email_sent = send_otp_email(email, otp)

        if not email_sent:

            # Remove user if email failed
            cursor.execute(
                "DELETE FROM users WHERE email=%s",
                (email,)
            )

            conn.commit()

            otp_storage.pop(email, None)

            return jsonify({
                "message": "Unable to send OTP email. Please try again."
            }), 500

        print("================================")
        print("REGISTER SUCCESS")
        print("EMAIL:", email)
        conn.ping(reconnect=True, attempts=3, delay=1)
        cursor = conn.cursor(dictionary=True)
        print("OTP:", otp)
        print("OTP EXPIRES:", expiry)
        print("================================")

        return jsonify({
            "success": True,
            "message": "Registration successful. OTP sent to your email.",
            "email": email
        }), 201

    except Exception as e:

        conn.rollback()

        print("❌ REGISTER API ERROR:", e)

        return jsonify({
            "message": "Registration failed."
        }), 500
@app.route("/api/auth/verify-otp", methods=["POST"])
def verify_otp():

    try:
        data = request.get_json()

        email = data.get("email", "").strip().lower()
        entered_otp = data.get("otp", "").strip()

        if not email or not entered_otp:
            return jsonify({
                "message": "Email and OTP are required."
            }), 400

        stored_data = otp_storage.get(email)

        if not stored_data:
            return jsonify({
                "message": "OTP not found. Please request a new OTP."
            }), 400

        # Check expiry
        if datetime.now() > stored_data["expires_at"]:

            otp_storage.pop(email, None)

            return jsonify({
                "message": "OTP expired. Please request a new OTP."
            }), 400

        # Check OTP
        if entered_otp != stored_data["otp"]:
            return jsonify({
                "message": "Invalid OTP."
            }), 400

        # Verify user
        cursor.execute("""
            UPDATE users
            SET email_verified = 1
            WHERE email = %s
        """, (email,))

        conn.commit()

        # Remove OTP
        otp_storage.pop(email, None)

        print("✅ EMAIL VERIFIED:", email)

        return jsonify({
            "success": True,
            "message": "Email verified successfully. Please login."
        }), 200

    except Exception as e:

        conn.rollback()

        print("❌ OTP VERIFY ERROR:", e)

        return jsonify({
            "message": "OTP verification failed."
        }), 500

@app.route("/register", methods=["GET", "POST"])
def register():

    if request.method == "POST":

        full_name = request.form["full_name"]
        email = request.form["email"]
        phone = request.form["phone"]
        password = request.form["password"]

        # Password Hashing
        password_hash = generate_password_hash(password)

        # Check Email Already Exists
        cursor.execute(
            "SELECT * FROM users WHERE email=%s",
            (email,)
        )

        user = cursor.fetchone()

        if user:
            return "Email already exists!"

        # Insert User
        sql = """
        INSERT INTO users(full_name,email,password_hash,phone)
        VALUES(%s,%s,%s,%s)
        """

        values = (full_name, email, password_hash, phone)

        cursor.execute(sql, values)
        conn.commit()

        return redirect("/")

    return send_from_directory(FRONTEND_DIST, "index.html")


@app.route("/login", methods=["GET", "POST"])
def login():

    if request.method == "POST":

        email = request.form["email"]
        password = request.form["password"]

        print("========== LOGIN ROUTE CALLED ==========")
        print("EMAIL:", email)
        conn.ping(reconnect=True, attempts=3, delay=1)
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            "SELECT * FROM users WHERE email=%s",
            (email,)
        )

        user = cursor.fetchone()

        print("USER FOUND:", bool(user))

        if user:

            if check_password_hash(
                user["password_hash"],
                password
            ):

                session.permanent = True

                session["user_id"] = user["user_id"]
                session["user_name"] = user["full_name"]
                session["user_email"] = user["email"]

                print("========== LOGIN SUCCESS ==========")
                print("USER ID:", session["user_id"])
                print("USER NAME:", session["user_name"])
                print("SESSION:", dict(session))

                return jsonify({
                    "message": "Login successful",
                    "user_id": user["user_id"],
                    "user_name": user["full_name"]
                }), 200

        return jsonify({
            "message": "Invalid Email or Password"
        }), 401

    return send_from_directory(FRONTEND_DIST, "index.html")

@app.route("/packages")
def packages():

    cursor.execute(
        "SELECT * FROM packages WHERE is_active=1"
    )

    packages = cursor.fetchall()

    return send_from_directory(FRONTEND_DIST, "index.html")


@app.route("/booking/<int:package_id>", methods=["GET", "POST"])
def booking(package_id):

    if "user_id" not in session:
        return redirect("/login")

    cursor.execute(
        "SELECT * FROM packages WHERE package_id=%s",
        (package_id,)
    )

    package = cursor.fetchone()

    if request.method == "POST":

        travel_date = request.form["travel_date"]
        adults = int(request.form["adults"])
        children = int(request.form["children"])
        room_type = request.form["room_type"]

        # Package Price
        price = float(package["base_price"])

        # Adult Charge
        adult_amount = price * adults

        # Child Charge (50%)
        child_amount = (price * 0.5) * children

        # Base Amount
        base_amount = adult_amount + child_amount

        # Room Charges
        if room_type == "standard":
            additional_charges = 0
        elif room_type == "deluxe":
            additional_charges = 2000
        else:
            additional_charges = 5000

        # Discount
        if adults >= 4:
            discount_amount = base_amount * 0.10
        else:
            discount_amount = 0

        # Final Amount
        total_amount = (
            base_amount
            + additional_charges
            - discount_amount
        )

        sql = """
        INSERT INTO bookings
        (
            user_id,
            package_id,
            travel_date,
            adults,
            children,
            room_type,
            base_amount,
            additional_charges,
            discount_amount,
            total_amount
        )
        VALUES
        (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        """

        values = (
            session["user_id"],
            package_id,
            travel_date,
            adults,
            children,
            room_type,
            base_amount,
            additional_charges,
            discount_amount,
            total_amount
        )

        cursor.execute(sql, values)
        conn.commit()

        booking_id = cursor.lastrowid

        return redirect(f"/booking-success/{booking_id}")

    return send_from_directory(FRONTEND_DIST, "index.html")
    

@app.route("/api/booking", methods=["POST"])
def api_create_booking():

    print("========== BOOKING API CALLED ==========")
    print("BOOKING SESSION:", dict(session))

    if "user_id" not in session:
        print("❌ USER ID NOT FOUND IN SESSION")

        return jsonify({
            "message": "Please login first"
        }), 401

    print("✅ USER ID:", session["user_id"])

    data = request.get_json()

    package_id = data.get("package_id")
    travel_date = data.get("travel_date")
    adults = int(data.get("adults", 1))
    children = int(data.get("children", 0))
    room_type = data.get("room_type", "standard")

    # ---- remaining code exactly as you already have ----
    if not package_id or not travel_date:
        return jsonify({
            "message": "Package and travel date are required"
        }), 400

    if adults < 1:
        return jsonify({
            "message": "At least one adult is required"
        }), 400

    cursor.execute(
        """
        SELECT *
        FROM packages
        WHERE package_id=%s
          AND is_active=1
        """,
        (package_id,)
    )

    package = cursor.fetchone()

    if not package:
        return jsonify({
            "message": "Package not found"
        }), 404

    # Package price
    price = float(package["base_price"])

    # Adult charge
    adult_amount = price * adults

    # Child charge - 50%
    child_amount = (price * 0.5) * children

    # Base amount
    base_amount = adult_amount + child_amount

    # Room charges
    if room_type == "standard":
        additional_charges = 0
    elif room_type == "deluxe":
        additional_charges = 2000
    elif room_type == "premium":
        additional_charges = 5000
    else:
        return jsonify({
            "message": "Invalid room type"
        }), 400

    # Discount
    if adults >= 4:
        discount_amount = base_amount * 0.10
    else:
        discount_amount = 0

    # Final amount
    total_amount = (
        base_amount
        + additional_charges
        - discount_amount
    )

    sql = """
        INSERT INTO bookings
        (
            user_id,
            package_id,
            travel_date,
            adults,
            children,
            room_type,
            base_amount,
            additional_charges,
            discount_amount,
            total_amount
        )
        VALUES
        (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
    """

    values = (
        session["user_id"],
        package_id,
        travel_date,
        adults,
        children,
        room_type,
        base_amount,
        additional_charges,
        discount_amount,
        total_amount
    )

    cursor.execute(sql, values)
    conn.commit()

    booking_id = cursor.lastrowid

    return jsonify({
        "message": "Booking created successfully",
        "booking_id": booking_id,
        "package_id": package_id,
        "base_amount": base_amount,
        "additional_charges": additional_charges,
        "discount_amount": discount_amount,
        "total_amount": total_amount
    }), 201
@app.route("/api/booking/<int:booking_id>", methods=["GET"])
def api_get_booking(booking_id):

    if "user_id" not in session:
        return jsonify({
            "message": "Please login first"
        }), 401

    cursor.execute("""
        SELECT
            b.booking_id,
            b.user_id,
            b.package_id,
            b.travel_date,
            b.adults,
            b.children,
            b.room_type,
            b.base_amount,
            b.additional_charges,
            b.discount_amount,
            b.total_amount,
            b.booking_status,

            p.title AS package_title,
            p.destination,

            pay.payment_status

        FROM bookings b

        JOIN packages p
            ON b.package_id = p.package_id

        LEFT JOIN payments pay
            ON b.booking_id = pay.booking_id

        WHERE b.booking_id = %s
          AND b.user_id = %s

        

    """, (
        booking_id,
        session["user_id"]
    ))

    booking = cursor.fetchone()

    if not booking:
        return jsonify({
            "message": "Booking not found"
        }), 404

    return jsonify({
        "booking": booking
    }), 200
@app.route("/booking-success/<int:booking_id>")
def booking_success(booking_id):

    if "user_id" not in session:
        return redirect("/login")

    cursor.execute("""
        SELECT
            b.booking_id,
            p.title,
            p.destination,
            b.travel_date,
            b.adults,
            b.children,
            b.room_type,
            b.total_amount
        FROM bookings b
        JOIN packages p
        ON b.package_id = p.package_id
        WHERE b.booking_id=%s
    """, (booking_id,))

    booking = cursor.fetchone()

    return render_template(
        "booking_success.html",
        booking=booking
    )

@app.route("/payment/<int:booking_id>")
def payment(booking_id):

    if "user_id" not in session:
        return redirect("/login")

    # Get booking
    cursor.execute("""
        SELECT
            b.booking_id,
            b.total_amount,
            b.booking_status,
            p.title
        FROM bookings b
        JOIN packages p
            ON b.package_id = p.package_id
        WHERE b.booking_id=%s
        AND b.user_id=%s
    """, (booking_id, session["user_id"]))

    booking = cursor.fetchone()

    if not booking:
        return "Booking not found", 404

    # If already confirmed, don't allow another payment
    if booking["booking_status"] == "confirmed":
        return redirect(f"/booking-success/{booking_id}")

    amount = Decimal(str(booking["total_amount"]))

    # Razorpay uses paise
    amount_in_paise = int(amount * Decimal("100"))

    # Check existing payment
    cursor.execute("""
        SELECT *
        FROM payments
        WHERE booking_id=%s
        ORDER BY payment_id DESC
        LIMIT 1
    """, (booking_id,))

    existing_payment = cursor.fetchone()

    if existing_payment:

        # Already paid
        if existing_payment["payment_status"] == "paid":
            return redirect(f"/booking-success/{booking_id}")

        # Existing unpaid payment
        razorpay_order_id = existing_payment["razorpay_order_id"]

    else:

        # Create new Razorpay order
        order = client.order.create({
            "amount": amount_in_paise,
            "currency": "INR",
            "payment_capture": 1
        })

        razorpay_order_id = order["id"]

        # Store payment
        cursor.execute("""
            INSERT INTO payments
            (
                booking_id,
                razorpay_order_id,
                amount,
                payment_status
            )
            VALUES (%s,%s,%s,%s)
        """, (
            booking_id,
            razorpay_order_id,
            amount,
            "created"
        ))

        conn.commit()

    return render_template(
        "payment.html",
        booking=booking,
        razorpay_order_id=razorpay_order_id,
        amount=amount_in_paise,
        razorpay_key_id=RAZORPAY_KEY_ID
    )
@app.route("/payment-success", methods=["GET","POST"])
def payment_success():
    if request.method == "GET":
        return "Payment Success Route is Working!"

    if "user_id" not in session:
        return {
            "status": "failed",
            "message": "Please login first"
        }, 401

    try:
        data = request.get_json()

        print("PAYMENT RESPONSE:", data)

        payment_id = data.get("razorpay_payment_id")
        order_id = data.get("razorpay_order_id")
        signature = data.get("razorpay_signature")

        print("Payment ID:", payment_id)
        print("Order ID:", order_id)
        print("Signature:", signature)

        if not payment_id or not order_id or not signature:
            return {
                "status": "failed",
                "message": "Payment details missing"
            }, 400

        # Verify Razorpay payment signature
        client.utility.verify_payment_signature({
            "razorpay_order_id": order_id,
            "razorpay_payment_id": payment_id,
            "razorpay_signature": signature
        })

        print("SIGNATURE VERIFIED")

        # Find payment record
        cursor.execute("""
            SELECT booking_id
            FROM payments
            WHERE razorpay_order_id=%s
        """, (order_id,))

        payment = cursor.fetchone()

        print("PAYMENT RECORD:", payment)

        if not payment:
            return {
                "status": "failed",
                "message": "Payment record not found"
            }, 404

        booking_id = payment["booking_id"]

        # Update payment
        cursor.execute("""
            UPDATE payments
            SET
                razorpay_payment_id=%s,
                payment_status='paid',
                payment_method='Razorpay'
            WHERE razorpay_order_id=%s
        """, (
            payment_id,
            order_id
        ))

        # Confirm booking
        cursor.execute("""
            UPDATE bookings
            SET booking_status='confirmed'
            WHERE booking_id=%s
        """, (booking_id,))

        conn.commit()

        print("PAYMENT UPDATED SUCCESSFULLY")

        return {
            "status": "success",
            "message": "Payment verified successfully",
            "booking_id": booking_id
        }

    except Exception as e:

        conn.rollback()

        print("PAYMENT ERROR:", str(e))

        return {
            "status": "failed",
            "message": str(e)
        }, 400
@app.route("/api/payment/verify", methods=["POST"])
def api_verify_payment():

    cursor = conn.cursor(dictionary=True)
    if "user_id" not in session:
        return jsonify({
            "status": "failed",
            "message": "Please login first"
        }), 401

    try:

        data = request.get_json()

        print("========== PAYMENT VERIFY ==========")
        print("PAYMENT DATA:", data)

        payment_id = data.get("razorpay_payment_id")
        order_id = data.get("razorpay_order_id")
        signature = data.get("razorpay_signature")

        if not payment_id or not order_id or not signature:
            return jsonify({
                "status": "failed",
                "message": "Payment details missing"
            }), 400

        # Verify Razorpay signature
        client.utility.verify_payment_signature({
            "razorpay_order_id": order_id,
            "razorpay_payment_id": payment_id,
            "razorpay_signature": signature
        })

        print("✅ SIGNATURE VERIFIED")

        # Get payment + booking
        cursor.execute("""
            SELECT
                pay.payment_id,
                pay.booking_id
            FROM payments pay
            JOIN bookings b
                ON pay.booking_id = b.booking_id
            WHERE pay.razorpay_order_id=%s
              AND b.user_id=%s
        """, (
            order_id,
            session["user_id"]
        ))

        payment = cursor.fetchone()

        if not payment:
            return jsonify({
                "status": "failed",
                "message": "Payment record not found"
            }), 404

        booking_id = payment["booking_id"]

        # Update payment
        cursor.execute("""
            UPDATE payments
            SET
                razorpay_payment_id=%s,
                payment_status='paid',
                payment_method='Razorpay'
            WHERE razorpay_order_id=%s
        """, (
            payment_id,
            order_id
        ))

        # Confirm booking
        cursor.execute("""
            UPDATE bookings
            SET booking_status='confirmed'
            WHERE booking_id=%s
        """, (booking_id,))

        conn.commit()

        print("✅ PAYMENT SUCCESS")
        print("BOOKING ID:", booking_id)

        return jsonify({
            "status": "success",
            "message": "Payment verified successfully",
            "booking_id": booking_id
        }), 200

    except Exception as e:

        conn.rollback()

        print("❌ PAYMENT ERROR:", str(e))

        return jsonify({
            "status": "failed",
            "message": str(e)
        }), 400
@app.route("/api/payment/create/<int:booking_id>", methods=["POST"])
def api_create_payment(booking_id):

    print("========== PAYMENT CREATE API CALLED ==========")
    print("PAYMENT SESSION:", dict(session))
    print("COOKIES:", request.cookies)

    if "user_id" not in session:
        print("❌ PAYMENT USER ID NOT FOUND")

        return jsonify({
            "status": "failed",
            "message": "Please login first"
        }), 401

    global conn, cursor

    try:
        # Check MySQL connection
        conn.ping(reconnect=True, attempts=3, delay=1)

        # Re-create cursor after reconnect
        cursor = conn.cursor(dictionary=True)

        print("✅ MYSQL CONNECTION READY")

        user_id = session["user_id"]

        cursor.execute("""
            SELECT
                b.booking_id,
                b.total_amount,
                b.booking_status,
                p.title
            FROM bookings b
            JOIN packages p
                ON b.package_id = p.package_id
            WHERE b.booking_id=%s
              AND b.user_id=%s
        """, (booking_id, user_id))

        booking = cursor.fetchone()

        print("BOOKING:", booking)

        if not booking:
            return jsonify({
                "status": "failed",
                "message": "Booking not found"
            }), 404

        if booking["booking_status"] == "confirmed":
            return jsonify({
                "status": "already_paid",
                "message": "Booking is already confirmed",
                "booking_id": booking_id
            }), 400

        amount = Decimal(str(booking["total_amount"]))

        amount_in_paise = int(
            amount * Decimal("100")
        )

        cursor.execute("""
            SELECT *
            FROM payments
            WHERE booking_id=%s
            ORDER BY payment_id DESC
            LIMIT 1
        """, (booking_id,))

        existing_payment = cursor.fetchone()

        print("EXISTING PAYMENT:", existing_payment)

        if existing_payment:

            if existing_payment["payment_status"] == "paid":
                return jsonify({
                    "status": "already_paid",
                    "message": "Payment already completed",
                    "booking_id": booking_id
                }), 400

            razorpay_order_id = existing_payment["razorpay_order_id"]
            print("CHECKING EXISTING RAZORPAY ORDER:", razorpay_order_id)

            existing_order = client.order.fetch(razorpay_order_id)
            print("RAZORPAY ORDER STATUS:", existing_order.get("status"))

            if existing_order.get("status") == "paid":
                return jsonify({
                    "status": "already_paid",
                    "message": "Payment already completed. Please refresh My Bookings.",
                    "booking_id": booking_id
                }), 400

            if existing_order.get("status") not in ["created", "attempted"]:
                print("OLD RAZORPAY ORDER NOT REUSABLE. CREATING NEW ORDER...")
                order = client.order.create({
                    "amount": amount_in_paise,
                    "currency": "INR",
                    "payment_capture": 1
                })
                razorpay_order_id = order["id"]

                cursor.execute("""
                    UPDATE payments
                    SET razorpay_order_id=%s,
                        razorpay_payment_id=NULL,
                        payment_status='created',
                        payment_method=NULL
                    WHERE payment_id=%s
                """, (razorpay_order_id, existing_payment["payment_id"]))
                conn.commit()
            else:
                print("USING EXISTING RAZORPAY ORDER:", razorpay_order_id)

        else:

            print("CREATING RAZORPAY ORDER...")
            order = client.order.create({
                "amount": amount_in_paise,
                "currency": "INR",
                "payment_capture": 1
            })

            print("RAZORPAY ORDER CREATED:", order)

            razorpay_order_id = order["id"]

            print("RAZORPAY ORDER:", razorpay_order_id)

            cursor.execute("""
                    INSERT INTO payments
                    (
                        booking_id,
                        razorpay_order_id,
                        amount,
                        payment_status
                    )
                    VALUES (%s,%s,%s,%s)
                """, (
                    booking_id,
                    razorpay_order_id,
                    amount,
                    "created"
                ))

            conn.commit()

            print("✅ PAYMENT RECORD CREATED")
                        
        return jsonify({
            "status": "success",
            "booking_id": booking_id,
            "title": booking["title"],
            "amount": amount_in_paise,
            "amount_rupees": float(amount),
            "razorpay_order_id": razorpay_order_id,
            "razorpay_key_id": RAZORPAY_KEY_ID
        }), 200

    except Exception as e:

        print("❌ CREATE PAYMENT ERROR:", str(e))

        try:
            conn.rollback()
        except Exception:
            pass

        return jsonify({
            "status": "failed",
            "message": str(e)
        }), 500
@app.route("/my-bookings")
def my_bookings():

    if "user_id" not in session:
        return redirect("/login")

    cursor.execute("""
        SELECT
            b.booking_id,
            p.title,
            p.destination,
            b.travel_date,
            b.adults,
            b.children,
            b.room_type,
            b.base_amount,
            b.additional_charges,
            b.discount_amount,
            b.total_amount,
            b.booking_status,

            COALESCE(
                (
                    SELECT pay.payment_status
                    FROM payments pay
                    WHERE pay.booking_id = b.booking_id
                    ORDER BY pay.payment_id DESC
                    LIMIT 1
                ),
                'Not Paid'
            ) AS payment_status

        FROM bookings b

        JOIN packages p
            ON b.package_id = p.package_id

        WHERE b.user_id=%s

        ORDER BY b.booking_id DESC
    """, (session["user_id"],))

    bookings = cursor.fetchall()

    return send_from_directory(FRONTEND_DIST, "index.html")
@app.route("/api/bookings", methods=["GET"])
def api_get_bookings():

    print("========== MY BOOKINGS API CALLED ==========")
    print("BOOKINGS SESSION:", dict(session))

    if "user_id" not in session:
        return jsonify({
            "status": "failed",
            "message": "Please login first"
        }), 401

    try:
        user_id = session["user_id"]

        # Make sure MySQL connection is alive
        if not conn.is_connected():
            conn.reconnect(attempts=3, delay=1)

        cursor.execute("""
            SELECT
                b.booking_id,
                b.package_id,
                p.title,
                b.travel_date,
                b.adults,
                b.children,
                b.room_type,
                b.base_amount,
                b.additional_charges,
                b.discount_amount,
                b.total_amount,
                b.booking_status,
                b.created_at,

                pay.payment_status,
                pay.payment_method,
                pay.razorpay_order_id,
                pay.razorpay_payment_id

            FROM bookings b

            JOIN packages p
                ON b.package_id = p.package_id

            LEFT JOIN payments pay
                ON b.booking_id = pay.booking_id

            WHERE b.user_id = %s

            ORDER BY b.booking_id DESC
        """, (user_id,))

        bookings = cursor.fetchall()

        result = []

        for booking in bookings:

            result.append({
                "booking_id": booking["booking_id"],
                "package_id": booking["package_id"],
                "title": booking["title"],

                "travel_date": (
                    booking["travel_date"].strftime("%Y-%m-%d")
                    if booking["travel_date"]
                    else None
                ),

                "adults": booking["adults"],
                "children": booking["children"],
                "room_type": booking["room_type"],

                "base_amount": float(booking["base_amount"]),
                "additional_charges": float(
                    booking["additional_charges"]
                ),
                "discount_amount": float(
                    booking["discount_amount"]
                ),
                "total_amount": float(
                    booking["total_amount"]
                ),

                "booking_status": booking["booking_status"],

                "payment_status": booking["payment_status"],
                "payment_method": booking["payment_method"],

                "razorpay_order_id": booking[
                    "razorpay_order_id"
                ],

                "razorpay_payment_id": booking[
                    "razorpay_payment_id"
                ],

                "created_at": (
                    booking["created_at"].isoformat()
                    if booking["created_at"]
                    else None
                )
            })

        print("TOTAL BOOKINGS:", len(result))

        return jsonify({
            "status": "success",
            "bookings": result
        }), 200

    except Exception as e:

        print("❌ MY BOOKINGS ERROR:", str(e))

        try:
            conn.rollback()
        except Exception:
            pass

        return jsonify({
            "status": "failed",
            "message": str(e)
        }), 500

@app.route("/booking-details/<int:booking_id>")
def booking_details(booking_id):

    if "user_id" not in session:
        return redirect("/login")

    cursor.execute("""
        SELECT
            b.booking_id,
            p.title,
            p.destination,
            b.travel_date,
            b.adults,
            b.children,
            b.room_type,
            b.base_amount,
            b.additional_charges,
            b.discount_amount,
            b.total_amount,
            b.booking_status,

            COALESCE(
                (
                    SELECT pay.payment_status
                    FROM payments pay
                    WHERE pay.booking_id = b.booking_id
                    ORDER BY pay.payment_id DESC
                    LIMIT 1
                ),
                'Not Paid'
            ) AS payment_status,

            (
                SELECT pay.razorpay_payment_id
                FROM payments pay
                WHERE pay.booking_id = b.booking_id
                ORDER BY pay.payment_id DESC
                LIMIT 1
            ) AS razorpay_payment_id

        FROM bookings b

        JOIN packages p
            ON b.package_id = p.package_id

        WHERE b.booking_id=%s
        AND b.user_id=%s
    """, (booking_id, session["user_id"]))

    booking = cursor.fetchone()

    if not booking:
        return "Booking not found", 404

    return render_template(
        "booking_details.html",
        booking=booking
    )
@app.route("/api/booking/<int:booking_id>/cancel", methods=["POST", "OPTIONS"])
def cancel_booking(booking_id):

    if request.method == "OPTIONS":
        return "", 200

    if "user_id" not in session:
        return jsonify({
            "message": "Please login first"
        }), 401

    cursor.execute("""
        SELECT
            b.booking_id,
            b.booking_status,
            b.user_id,
            pay.payment_id,
            pay.razorpay_payment_id,
            pay.payment_status
        FROM bookings b
        LEFT JOIN payments pay
            ON b.booking_id = pay.booking_id
        WHERE b.booking_id = %s
        AND b.user_id = %s
    """, (
        booking_id,
        session["user_id"]
    ))

    booking = cursor.fetchone()

    if not booking:
        return jsonify({
            "message": "Booking not found"
        }), 404

    if booking["booking_status"] == "cancelled":
        return jsonify({
            "message": "Booking already cancelled"
        }), 400

    # -------------------------------
    # PENDING + UNPAID
    # -------------------------------

    if (
        booking["booking_status"] == "pending"
        and booking["payment_status"] != "paid"
    ):

        cursor.execute("""
            UPDATE bookings
            SET booking_status = 'cancelled'
            WHERE booking_id = %s
            AND user_id = %s
        """, (
            booking_id,
            session["user_id"]
        ))

        conn.commit()

        return jsonify({
            "message": "Booking cancelled successfully."
        }), 200

    # -------------------------------
    # CONFIRMED + PAID
    # -------------------------------

    if (
        booking["booking_status"] == "confirmed"
        and booking["payment_status"] == "paid"
    ):

        payment_id = booking["razorpay_payment_id"]

        if not payment_id:
            return jsonify({
                "message": "Razorpay payment ID not found"
            }), 400

        try:

            refund = client.payment.refund(payment_id)

            print("REFUND RESPONSE:", refund)

            cursor.execute("""
                UPDATE payments
                SET payment_status = 'refunded'
                WHERE payment_id = %s
            """, (
                booking["payment_id"],
            ))

            cursor.execute("""
                UPDATE bookings
                SET booking_status = 'cancelled'
                WHERE booking_id = %s
                AND user_id = %s
            """, (
                booking_id,
                session["user_id"]
            ))

            conn.commit()

            return jsonify({
                "message": "Booking cancelled and refund processed successfully."
            }), 200

        except Exception as e:

            conn.rollback()

            print("REFUND ERROR:", str(e))

            return jsonify({
                "message": str(e)
            }), 400

    return jsonify({
        "message": "Invalid booking status"
    }), 400

@app.route("/admin/create", methods=["GET", "POST"])
def create_admin():

    if request.method == "POST":

        full_name = request.form["full_name"].strip()
        email = request.form["email"].strip()
        password = request.form["password"]

        password_hash = generate_password_hash(password)

        cursor.execute("""
            SELECT admin_id
            FROM admins
            WHERE email=%s
        """, (email,))

        existing_admin = cursor.fetchone()

        if existing_admin:
            return "Admin email already exists"

        cursor.execute("""
            INSERT INTO admins
            (
                full_name,
                email,
                password_hash
            )
            VALUES (%s,%s,%s)
        """, (
            full_name,
            email,
            password_hash
        ))

        conn.commit()

        return redirect("/admin/login")

    return render_template("admin_create.html")

@app.route("/admin/login", methods=["GET", "POST"])
def admin_login():

    if request.method == "POST":

        email = request.form["email"].strip()
        password = request.form["password"]

        cursor.execute("""
            SELECT *
            FROM admins
            WHERE email = %s
        """, (email,))

        admin = cursor.fetchone()

        if admin:

            if check_password_hash(
                admin["password_hash"],
                password
            ):

                session["admin_id"] = admin["admin_id"]
                session["admin_name"] = admin["full_name"]

                print("LOGIN SESSION:", dict(session))

                return jsonify({
                    "message": "Admin login successful",
                    "admin_id": admin["admin_id"],
                    "admin_name": admin["full_name"]
                }), 200

        return jsonify({
            "message": "Invalid Admin Email or Password"
        }), 401

    return render_template("admin_login.html")
@app.route("/admin/dashboard")
def admin_dashboard():
    print("API SESSION:", dict(session))


    if "admin_id" not in session:
        return redirect("/admin/login")

    # Total Users
    cursor.execute("""
        SELECT COUNT(*) AS total_users
        FROM users
    """)
    total_users = cursor.fetchone()["total_users"]

    # Total Packages
    cursor.execute("""
        SELECT COUNT(*) AS total_packages
        FROM packages
    """)
    total_packages = cursor.fetchone()["total_packages"]

    # Total Bookings
    cursor.execute("""
        SELECT COUNT(*) AS total_bookings
        FROM bookings
    """)
    total_bookings = cursor.fetchone()["total_bookings"]

    # Confirmed Bookings
    cursor.execute("""
        SELECT COUNT(*) AS confirmed_bookings
        FROM bookings
        WHERE booking_status='confirmed'
    """)
    confirmed_bookings = cursor.fetchone()["confirmed_bookings"]

    # Cancelled Bookings
    cursor.execute("""
        SELECT COUNT(*) AS cancelled_bookings
        FROM bookings
        WHERE booking_status='cancelled'
    """)
    cancelled_bookings = cursor.fetchone()["cancelled_bookings"]

    # Total Revenue
    cursor.execute("""
        SELECT
            COALESCE(SUM(amount), 0) AS total_revenue
        FROM payments
        WHERE payment_status='paid'
    """)
    total_revenue = cursor.fetchone()["total_revenue"]

    return render_template(
        "admin_dashboard.html",
        total_users=total_users,
        total_packages=total_packages,
        total_bookings=total_bookings,
        confirmed_bookings=confirmed_bookings,
        cancelled_bookings=cancelled_bookings,
        total_revenue=total_revenue
    )



@app.route("/api/admin/dashboard")
def api_admin_dashboard():

    # Check admin login
    if "admin_id" not in session:
        return jsonify({
            "message": "Unauthorized"
        }), 401

    # -------------------------
    # Total Users
    # -------------------------
    cursor.execute("""
        SELECT COUNT(*) AS total_users
        FROM users
    """)
    total_users = cursor.fetchone()["total_users"]

    # -------------------------
    # Total Packages
    # -------------------------
    cursor.execute("""
        SELECT COUNT(*) AS total_packages
        FROM packages
        WHERE is_active = 1
    """)
    total_packages = cursor.fetchone()["total_packages"]

    # -------------------------
    # Total Bookings
    # -------------------------
    cursor.execute("""
        SELECT COUNT(*) AS total_bookings
        FROM bookings
    """)
    total_bookings = cursor.fetchone()["total_bookings"]

    # -------------------------
    # Confirmed Bookings
    # -------------------------
    cursor.execute("""
        SELECT COUNT(*) AS confirmed_bookings
        FROM bookings
        WHERE booking_status = 'confirmed'
    """)
    confirmed_bookings = cursor.fetchone()["confirmed_bookings"]

    # -------------------------
    # Cancelled Bookings
    # -------------------------
    cursor.execute("""
        SELECT COUNT(*) AS cancelled_bookings
        FROM bookings
        WHERE booking_status = 'cancelled'
    """)
    cancelled_bookings = cursor.fetchone()["cancelled_bookings"]

    # -------------------------
    # Total Revenue
    # -------------------------
    cursor.execute("""
        SELECT COALESCE(SUM(amount), 0) AS total_revenue
        FROM payments
        WHERE payment_status = 'paid'
    """)
    total_revenue = cursor.fetchone()["total_revenue"]

    # -------------------------
    # Return Dashboard Data
    # -------------------------
    return jsonify({
        "total_users": total_users,
        "total_packages": total_packages,
        "total_bookings": total_bookings,
        "confirmed_bookings": confirmed_bookings,
        "cancelled_bookings": cancelled_bookings,
        "total_revenue": float(total_revenue)
    })



@app.route("/api/admin/bookings", methods=["GET"])
def admin_bookings():

    print("========== ADMIN BOOKINGS API CALLED ==========")
    print("ADMIN SESSION:", dict(session))
    print("ADMIN COOKIES:", request.cookies)
    print("ADMIN ORIGIN:", request.headers.get("Origin"))

    # Admin authentication
    if "admin_id" not in session:

        print("❌ ADMIN ID NOT FOUND IN SESSION")

        return {
            "status": "failed",
            "message": "Admin login required"
        }, 401

    try:

        # Reconnect MySQL if connection was lost
        if not conn.is_connected():
            conn.reconnect(attempts=3, delay=1)

        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT
                b.booking_id,
                b.user_id,

                u.full_name AS user_name,
                u.email AS user_email,

                p.title AS package_title,
                p.destination,

                b.travel_date,
                b.adults,
                b.children,
                b.room_type,

                b.base_amount,
                b.additional_charges,
                b.discount_amount,
                b.total_amount,

                b.booking_status,
                b.created_at,

                COALESCE(
                    (
                        SELECT pay.payment_status
                        FROM payments pay
                        WHERE pay.booking_id = b.booking_id
                        ORDER BY pay.payment_id DESC
                        LIMIT 1
                    ),
                    'Not Paid'
                ) AS payment_status,

                COALESCE(
                    (
                        SELECT pay.payment_method
                        FROM payments pay
                        WHERE pay.booking_id = b.booking_id
                        ORDER BY pay.payment_id DESC
                        LIMIT 1
                    ),
                    '-'
                ) AS payment_method

            FROM bookings b

            LEFT JOIN users u
                ON b.user_id = u.user_id

            LEFT JOIN packages p
                ON b.package_id = p.package_id

            ORDER BY b.booking_id DESC
        """)

        bookings = cursor.fetchall()

        print("✅ TOTAL ADMIN BOOKINGS:", len(bookings))

        return {
            "status": "success",
            "bookings": bookings
        }, 200

    except Exception as e:

        print("❌ ADMIN BOOKINGS ERROR:", str(e))

        return {
            "status": "failed",
            "message": str(e)
        }, 500


@app.route("/admin/payments")
def admin_payments():

    if "admin_id" not in session:
        return redirect("/admin/login")

    cursor.execute("""
        SELECT
            pay.payment_id,
            pay.booking_id,
            u.full_name,
            p.title,
            pay.amount,
            pay.razorpay_order_id,
            pay.razorpay_payment_id,
            pay.payment_status,
            pay.payment_method,
            pay.created_at,
            pay.updated_at

        FROM payments pay

        JOIN bookings b
            ON pay.booking_id = b.booking_id

        JOIN users u
            ON b.user_id = u.user_id

        JOIN packages p
            ON b.package_id = p.package_id

        ORDER BY pay.payment_id DESC
    """)

    payments = cursor.fetchall()

    return render_template(
        "admin_payments.html",
        payments=payments
    )
@app.route("/api/admin/payments", methods=["GET"])
def api_admin_payments():

    print("========== ADMIN PAYMENTS API CALLED ==========")
    print("ADMIN SESSION:", dict(session))
    print("ADMIN COOKIES:", request.cookies)

    # Admin login check
    if "admin_id" not in session:
        print("❌ ADMIN ID NOT FOUND")

        return {
            "status": "failed",
            "message": "Admin login required"
        }, 401

    try:
        # Check MySQL connection
        if not conn.is_connected():
            conn.reconnect(attempts=3, delay=1)

        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT
                pay.payment_id,
                pay.booking_id,
                u.full_name AS user_name,
                u.email AS user_email,
                p.title AS package_title,

                pay.amount,

                pay.razorpay_order_id,
                pay.razorpay_payment_id,

                pay.payment_status,
                pay.payment_method,

                pay.created_at,
                pay.updated_at

            FROM payments pay

            JOIN bookings b
                ON pay.booking_id = b.booking_id

            JOIN users u
                ON b.user_id = u.user_id

            JOIN packages p
                ON b.package_id = p.package_id

            ORDER BY pay.payment_id DESC
        """)

        payments = cursor.fetchall()

        print("✅ TOTAL ADMIN PAYMENTS:", len(payments))

        return {
            "status": "success",
            "payments": payments
        }, 200

    except Exception as e:

        print("❌ ADMIN PAYMENTS ERROR:", str(e))

        return {
            "status": "failed",
            "message": str(e)
        }, 500

@app.route("/admin/users")
def admin_users():

    if "admin_id" not in session:
        return redirect("/admin/login")

    cursor.execute("""
        SELECT
            user_id,
            full_name,
            email,
            phone
        FROM users
        ORDER BY user_id DESC
    """)

    users = cursor.fetchall()

    return render_template(
        "admin_users.html",
        users=users
    )
@app.route("/api/admin/users", methods=["GET"])
def api_admin_users():

    print("========== ADMIN USERS API CALLED ==========")
    print("ADMIN SESSION:", dict(session))
    print("ADMIN COOKIES:", request.cookies)

    # Admin login check
    if "admin_id" not in session:
        print("❌ ADMIN ID NOT FOUND")

        return {
            "status": "failed",
            "message": "Admin login required"
        }, 401

    try:
        # Check MySQL connection
        if not conn.is_connected():
            conn.reconnect(attempts=3, delay=1)

        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT
                user_id,
                full_name,
                email,
                phone
            FROM users
            ORDER BY user_id DESC
        """)

        users = cursor.fetchall()

        print("✅ TOTAL ADMIN USERS:", len(users))

        return {
            "status": "success",
            "users": users
        }, 200

    except Exception as e:

        print("❌ ADMIN USERS ERROR:", str(e))

        return {
            "status": "failed",
            "message": str(e)
        }, 500
@app.route("/api/packages", methods=["GET"])
def api_packages():

    print("========== PACKAGES API CALLED ==========")
    print("PACKAGES SESSION:", dict(session))

    # Login check
    if "user_id" not in session and "admin_id" not in session:
        return jsonify({
            "message": "Please login first",
            "logged_in": False
        }), 401

    cursor.execute("""
        SELECT
            package_id,
            title,
            destination,
            description,
            duration_days,
            duration_nights,
            base_price,
            image_url,
            is_active
        FROM packages
        WHERE is_active = 1
        ORDER BY package_id DESC
    """)

    packages = cursor.fetchall()

    return jsonify({
        "packages": packages
    }), 200
@app.route("/api/packages/<int:package_id>", methods=["GET"])
def api_package_details(package_id):

    cursor.execute("""
        SELECT
            package_id,
            title,
            destination,
            description,
            duration_days,
            duration_nights,
            base_price,
            image_url,
            is_active
        FROM packages
        WHERE package_id = %s
          AND is_active = 1
    """, (package_id,))

    package = cursor.fetchone()

    if not package:
        return jsonify({
            "message": "Package not found"
        }), 404

    return jsonify({
        "package": package
    }), 200
@app.route("/admin/packages")
def admin_packages():

    if "admin_id" not in session:
        return redirect("/admin/login")

    cursor.execute("""
        SELECT
            package_id,
            title,
            destination,
            description,
            duration_days,
            duration_nights,
            base_price,
            image_url,
            is_active
        FROM packages
        ORDER BY package_id DESC
    """)

    packages = cursor.fetchall()

    return render_template(
        "admin_packages.html",
        packages=packages
    )
@app.route("/api/admin/packages")
def api_admin_packages():

    if "admin_id" not in session:
        return jsonify({
            "message": "Unauthorized"
        }), 401

    cursor.execute("""
        SELECT
            package_id,
            title,
            destination,
            description,
            duration_days,
            duration_nights,
            base_price,
            image_url,
            is_active
        FROM packages
        ORDER BY package_id DESC
    """)

    packages = cursor.fetchall()

    return jsonify({
        "packages": packages
    })

@app.route("/api/admin/packages/toggle/<int:package_id>", methods=["POST"])
def api_toggle_package(package_id):

    if "admin_id" not in session:
        return jsonify({
            "message": "Unauthorized"
        }), 401

    cursor.execute("""
        SELECT is_active
        FROM packages
        WHERE package_id=%s
    """, (package_id,))

    package = cursor.fetchone()

    if not package:
        return jsonify({
            "message": "Package not found"
        }), 404

    new_status = 0 if package["is_active"] == 1 else 1

    cursor.execute("""
        UPDATE packages
        SET is_active=%s
        WHERE package_id=%s
    """, (new_status, package_id))

    conn.commit()

    return jsonify({
        "message": "Package status updated successfully",
        "is_active": new_status
    })
@app.route("/admin/packages/add", methods=["GET", "POST"])
def admin_add_package():

    if "admin_id" not in session:
        return redirect("/admin/login")

    if request.method == "POST":

        title = request.form["title"].strip()
        destination = request.form["destination"].strip()
        description = request.form["description"].strip()

        duration_days = int(request.form["duration_days"])
        duration_nights = int(request.form["duration_nights"])

        base_price = float(request.form["base_price"])

        image_url = request.form.get("image_url", "").strip()

        cursor.execute("""
            INSERT INTO packages
            (
                title,
                destination,
                description,
                duration_days,
                duration_nights,
                base_price,
                image_url,
                is_active
            )
            VALUES
            (%s,%s,%s,%s,%s,%s,%s,1)
        """, (
            title,
            destination,
            description,
            duration_days,
            duration_nights,
            base_price,
            image_url
        ))

        conn.commit()

        return redirect("/admin/packages")

    return render_template("admin_add_package.html")
@app.route("/api/admin/packages/add", methods=["POST"])
def api_admin_add_package():

    if "admin_id" not in session:
        return jsonify({
            "message": "Unauthorized"
        }), 401

    data = request.get_json()

    if not data:
        return jsonify({
            "message": "Invalid request"
        }), 400

    title = data.get("title", "").strip()
    destination = data.get("destination", "").strip()
    description = data.get("description", "").strip()

    duration_days = data.get("duration_days")
    duration_nights = data.get("duration_nights")
    base_price = data.get("base_price")

    image_url = data.get("image_url", "").strip()

    if not title or not destination or not description:
        return jsonify({
            "message": "Please fill all required fields."
        }), 400

    cursor.execute("""
        INSERT INTO packages
        (
            title,
            destination,
            description,
            duration_days,
            duration_nights,
            base_price,
            image_url,
            is_active
        )
        VALUES
        (%s, %s, %s, %s, %s, %s, %s, 1)
    """, (
        title,
        destination,
        description,
        duration_days,
        duration_nights,
        base_price,
        image_url
    ))

    conn.commit()

    return jsonify({
        "message": "Package added successfully"
    }), 201
@app.route("/api/admin/packages/<int:package_id>", methods=["GET"])
def api_admin_package_details(package_id):

    if "admin_id" not in session:
        return jsonify({
            "message": "Unauthorized"
        }), 401

    cursor.execute("""
        SELECT
            package_id,
            title,
            destination,
            description,
            duration_days,
            duration_nights,
            base_price,
            image_url,
            is_active
        FROM packages
        WHERE package_id=%s
    """, (package_id,))

    package = cursor.fetchone()

    if not package:
        return jsonify({
            "message": "Package not found"
        }), 404

    return jsonify({
        "package": package
    }), 200


@app.route("/api/admin/packages/<int:package_id>", methods=["PUT"])
def api_admin_update_package(package_id):

    if "admin_id" not in session:
        return jsonify({
            "message": "Unauthorized"
        }), 401

    data = request.get_json()

    if not data:
        return jsonify({
            "message": "Invalid request"
        }), 400

    title = data.get("title", "").strip()
    destination = data.get("destination", "").strip()
    description = data.get("description", "").strip()

    duration_days = data.get("duration_days")
    duration_nights = data.get("duration_nights")
    base_price = data.get("base_price")

    image_url = data.get("image_url", "").strip()

    if not title or not destination or not description:
        return jsonify({
            "message": "Please fill all required fields."
        }), 400

    cursor.execute("""
        UPDATE packages
        SET
            title=%s,
            destination=%s,
            description=%s,
            duration_days=%s,
            duration_nights=%s,
            base_price=%s,
            image_url=%s
        WHERE package_id=%s
    """, (
        title,
        destination,
        description,
        duration_days,
        duration_nights,
        base_price,
        image_url,
        package_id
    ))

    conn.commit()

    return jsonify({
        "message": "Package updated successfully"
    }), 200

@app.route("/admin/packages/toggle/<int:package_id>", methods=["POST"])
def toggle_package(package_id):

    if "admin_id" not in session:
        return redirect("/admin/login")

    cursor.execute("""
        SELECT is_active
        FROM packages
        WHERE package_id=%s
    """, (package_id,))

    package = cursor.fetchone()

    if not package:
        return "Package not found", 404

    new_status = 0 if package["is_active"] == 1 else 1

    cursor.execute("""
        UPDATE packages
        SET is_active=%s
        WHERE package_id=%s
    """, (new_status, package_id))

    conn.commit()

    return redirect("/admin/packages")

@app.route("/admin/packages/edit/<int:package_id>", methods=["GET", "POST"])
def admin_edit_package(package_id):

    if "admin_id" not in session:
        return redirect("/admin/login")

    # Get existing package
    cursor.execute("""
        SELECT *
        FROM packages
        WHERE package_id=%s
    """, (package_id,))

    package = cursor.fetchone()

    if not package:
        return "Package not found", 404

    if request.method == "POST":

        title = request.form["title"].strip()
        destination = request.form["destination"].strip()
        description = request.form["description"].strip()

        duration_days = int(request.form["duration_days"])
        duration_nights = int(request.form["duration_nights"])

        base_price = float(request.form["base_price"])

        image_url = request.form.get("image_url", "").strip()

        cursor.execute("""
            UPDATE packages
            SET
                title=%s,
                destination=%s,
                description=%s,
                duration_days=%s,
                duration_nights=%s,
                base_price=%s,
                image_url=%s
            WHERE package_id=%s
        """, (
            title,
            destination,
            description,
            duration_days,
            duration_nights,
            base_price,
            image_url,
            package_id
        ))

        conn.commit()

        return redirect("/admin/packages")

    return render_template("admin_edit_package.html", package=package)
@app.route("/admin/logout")
def admin_logout():

    session.pop("admin_id", None)
    session.pop("admin_name", None)

    return redirect("/admin/login")

if __name__ == "__main__":
    app.run(debug=True)

app.add_url_rule("/assets/<path:filename>", endpoint="react_assets", view_func=lambda filename: send_from_directory(os.path.join(FRONTEND_DIST,"assets"), filename))
app.add_url_rule("/images/<path:filename>", endpoint="react_images", view_func=lambda filename: send_from_directory(os.path.join(FRONTEND_DIST,"images"), filename))
app.add_url_rule("/favicon.svg", endpoint="react_favicon", view_func=lambda: send_from_directory(FRONTEND_DIST,"favicon.svg"))
app.add_url_rule("/icons.svg", endpoint="react_icons", view_func=lambda: send_from_directory(FRONTEND_DIST,"icons.svg"))


def serve_react(*args, **kwargs):
    return send_from_directory(FRONTEND_DIST, "index.html")

app.add_url_rule("/user-home", endpoint="react_user_home", view_func=serve_react)



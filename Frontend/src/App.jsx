import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Register from "./pages/Register";
import Login from "./pages/Login";
import UserHome from "./pages/UserHome";
import Packages from "./pages/Packages";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminPackages from "./pages/AdminPackages";
import AdminAddPackage from "./pages/AdminAddPackage";
import AdminEditPackage from "./pages/AdminEditPackage";
import PackageDetails from "./pages/PackageDetails";
import Booking from "./pages/Booking";
import BookingSuccess from "./pages/BookingSuccess";
import Payment from "./pages/Payment";
import MyBookings from "./pages/MyBookings";
import AdminBookings from "./pages/AdminBookings";
import AdminPayments from "./pages/AdminPayments";
import AdminUsers from "./pages/AdminUsers";
import Wishlist from "./pages/Wishlist";
import BookingDetails from "./pages/BookingDetails";
import VerifyOtp from "./pages/VerifyOtp";
function Home() {
  return (
    <main className="home-page">
      <section className="welcome-section">
        <h1>Welcome to TravelMate</h1>

        <p>
          Explore amazing destinations and book your perfect trip.
        </p>

        <div className="home-buttons">
          <a href="/register">Register</a>
          <a href="/login">Login</a>
        </div>
      </section>
    </main>
  );
}

function App() {
  return (
    <BrowserRouter>

      <Navbar />

      <Routes>

        <Route path="/" element={<Home />} />

        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/user-home" element={<UserHome />} />
        <Route path="/packages" element={<Packages />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin/packages" element={<AdminPackages />} />
        
        <Route path="/admin/packages/add"element={<AdminAddPackage />}/>
        <Route path="/admin/packages/edit/:packageId"element={<AdminEditPackage />}/>
        <Route path="/packages/:packageId" element={<PackageDetails />} />
        <Route path="/booking/:packageId" element={<Booking />} />
        <Route path="/booking-success/:bookingId" element={<BookingSuccess />} />
        <Route path="/payment/:bookingId" element={<Payment />} />
        <Route path="/my-bookings"element={<MyBookings />}/>
        <Route path="/admin/bookings"element={<AdminBookings />}/>
        <Route path="/admin/payments"element={<AdminPayments />}/>
        <Route path="/admin/users"element={<AdminUsers />}/>
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/booking-details/:bookingId" element={<BookingDetails />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
      </Routes>

    </BrowserRouter>
  );
}

export default App;

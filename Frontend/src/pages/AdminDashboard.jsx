import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    total_users: 0,
    total_packages: 0,
    total_bookings: 0,
    confirmed_bookings: 0,
    cancelled_bookings: 0,
    total_revenue: 0,
  });

  const [adminName, setAdminName] = useState("Admin");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/dashboard", {
      method: "GET",
      credentials: "include",
    })
      .then(async (response) => {

        if (response.status === 401) {
          navigate("/admin-login");
          throw new Error("Unauthorized");
        }

        if (!response.ok) {
          throw new Error("Failed to load dashboard");
        }

        return response.json();
      })

      .then((data) => {
        console.log("Admin Dashboard Data:", data);

        setStats({
          total_users: data.total_users || 0,
          total_packages: data.total_packages || 0,
          total_bookings: data.total_bookings || 0,
          confirmed_bookings: data.confirmed_bookings || 0,
          cancelled_bookings: data.cancelled_bookings || 0,
          total_revenue: data.total_revenue || 0,
        });

        if (data.admin_name) {
          setAdminName(data.admin_name);
        }

        setError("");
      })

      .catch((err) => {
        console.error("Dashboard Error:", err);

        if (err.message !== "Unauthorized") {
          setError("Unable to load dashboard data.");
        }
      })

      .finally(() => {
        setLoading(false);
      });

  }, [navigate]);


  const handleLogout = async () => {

    try {

      await fetch(
        "/admin/logout",
        {
          method: "GET",
          credentials: "include",
        }
      );

      navigate("/admin-login");

    } catch (error) {

      console.error("Logout Error:", error);

      navigate("/admin-login");
    }
  };


  if (loading) {
    return (
      <div className="admin-loading">
        <h2>Loading Admin Dashboard...</h2>
      </div>
    );
  }


  return (
    <div className="admin-dashboard">

      {/* Sidebar */}

      <aside className="admin-sidebar">

        <div className="admin-logo">

          <div className="admin-logo-icon">
            ✈️
          </div>

          <div>
            <h2>TravelMate</h2>
            <span>ADMIN PANEL</span>
          </div>

        </div>


        <nav className="admin-nav">

          <button
            className="admin-nav-item active"
            onClick={() => navigate("/admin-dashboard")}
          >
            📊
            <span>Dashboard</span>
          </button>


          <button
            className="admin-nav-item"
            onClick={() => navigate("/admin/packages")}
          >
            📦
            <span>Packages</span>
          </button>


          <button
            className="admin-nav-item"
            onClick={() => navigate("/admin/bookings")}
          >
            🧳
            <span>Bookings</span>
          </button>


          <button
            className="admin-nav-item"
            onClick={() => navigate("/admin/payments")}
          >
            💳
            <span>Payments</span>
          </button>


          <button
            className="admin-nav-item"
            onClick={() => navigate("/admin/users")}
          >
            👥
            <span>Users</span>
          </button>

        </nav>


        <button
          className="admin-logout"
          onClick={handleLogout}
        >
          🚪
          <span>Logout</span>
        </button>

      </aside>


      {/* Main Content */}

      <main className="admin-main">

        {/* Header */}

        <header className="admin-header">

          <div>

            <span className="admin-header-label">
              ADMIN DASHBOARD
            </span>

            <h1>
              Welcome back 👋
            </h1>

            <p>
              Manage your TravelMate platform from here.
            </p>

          </div>


          <div className="admin-user">

            <div className="admin-user-avatar">
              {adminName.charAt(0).toUpperCase()}
            </div>

            <div>
              <strong>{adminName}</strong>
              <span>Administrator</span>
            </div>

          </div>

        </header>


        {/* Error */}

        {error && (
          <div className="admin-error">
            {error}
          </div>
        )}


        {/* Statistics */}

        <section className="stats-grid">


          {/* Users */}

          <div className="stat-card">

            <div className="stat-icon">
              👥
            </div>

            <div className="stat-content">

              <span>
                Total Users
              </span>

              <h2>
                {stats.total_users}
              </h2>

            </div>

          </div>


          {/* Packages */}

          <div className="stat-card">

            <div className="stat-icon">
              📦
            </div>

            <div className="stat-content">

              <span>
                Total Packages
              </span>

              <h2>
                {stats.total_packages}
              </h2>

            </div>

          </div>


          {/* Bookings */}

          <div className="stat-card">

            <div className="stat-icon">
              🧳
            </div>

            <div className="stat-content">

              <span>
                Total Bookings
              </span>

              <h2>
                {stats.total_bookings}
              </h2>

            </div>

          </div>


          {/* Confirmed */}

          <div className="stat-card">

            <div className="stat-icon">
              ✅
            </div>

            <div className="stat-content">

              <span>
                Confirmed
              </span>

              <h2>
                {stats.confirmed_bookings}
              </h2>

            </div>

          </div>


          {/* Cancelled */}

          <div className="stat-card">

            <div className="stat-icon">
              ❌
            </div>

            <div className="stat-content">

              <span>
                Cancelled
              </span>

              <h2>
                {stats.cancelled_bookings}
              </h2>

            </div>

          </div>


          {/* Revenue */}

          <div className="stat-card revenue-card">

            <div className="stat-icon">
              💰
            </div>

            <div className="stat-content">

              <span>
                Total Revenue
              </span>

              <h2>
                ₹
                {Number(
                  stats.total_revenue
                ).toLocaleString("en-IN")}
              </h2>

            </div>

          </div>

        </section>


        {/* Quick Management */}

        <section className="quick-management">

          <div className="section-heading">

            <span>
              ADMIN TOOLS
            </span>

            <h2>
              Quick Management
            </h2>

          </div>


          <div className="management-grid">


            {/* Packages */}

            <div
              className="management-card"
              onClick={() => navigate("/admin/packages")}
            >

              <div className="management-icon">
                📦
              </div>

              <h3>
                Manage Packages
              </h3>

              <p>
                Add, edit and manage travel packages.
              </p>

              <button>
                Manage Packages →
              </button>

            </div>


            {/* Bookings */}

            <div
              className="management-card"
              onClick={() => navigate("/admin/bookings")}
            >

              <div className="management-icon">
                🧳
              </div>

              <h3>
                View Bookings
              </h3>

              <p>
                Check customer bookings and status.
              </p>

              <button>
                View Bookings →
              </button>

            </div>


            {/* Payments */}

            <div
              className="management-card"
              onClick={() => navigate("/admin/payments")}
            >

              <div className="management-icon">
                💳
              </div>

              <h3>
                View Payments
              </h3>

              <p>
                Monitor payment transactions.
              </p>

              <button>
                View Payments →
              </button>

            </div>


            {/* Users */}

            <div
              className="management-card"
              onClick={() => navigate("/admin/users")}
            >

              <div className="management-icon">
                👥
              </div>

              <h3>
                Manage Users
              </h3>

              <p>
                View registered TravelMate users.
              </p>

              <button>
                Manage Users →
              </button>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default AdminDashboard;
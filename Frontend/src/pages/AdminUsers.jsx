import { useEffect, useState } from "react";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://localhost:5000/api/admin/users",
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await response.json();

      console.log("ADMIN USERS RESPONSE:", data);

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load users"
        );
      }

      setUsers(data.users || []);

    } catch (err) {
      console.error("Admin Users Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-card">
          <h2>Loading Users...</h2>
          <p>Please wait.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page">
        <div className="admin-card">
          <h2>Users Error</h2>

          <p className="error-message">
            {error}
          </p>

          <button onClick={loadUsers}>
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
          <h1>Users</h1>
          <p>
            Manage registered TravelMate users.
          </p>
        </div>

        <button
          className="refresh-button"
          onClick={loadUsers}
        >
          🔄 Refresh
        </button>
      </div>

      <div className="payment-summary">

        <div className="summary-card">
          <span>Total Users</span>
          <strong>{users.length}</strong>
        </div>

      </div>

      <div className="payments-table-container">

        {users.length === 0 ? (

          <div className="empty-state">
            <div className="empty-icon">
              👥
            </div>

            <h2>No Users Found</h2>

            <p>
              There are no registered users.
            </p>
          </div>

        ) : (

          <table className="payments-table">

            <thead>
              <tr>
                <th>User ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
              </tr>
            </thead>

            <tbody>

              {users.map((user) => (

                <tr key={user.user_id}>

                  <td>
                    #{user.user_id}
                  </td>

                  <td>
                    <strong>
                      {user.full_name}
                    </strong>
                  </td>

                  <td>
                    {user.email}
                  </td>

                  <td>
                    {user.phone || "-"}
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

export default AdminUsers;
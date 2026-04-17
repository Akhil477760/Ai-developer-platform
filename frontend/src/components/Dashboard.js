import { useEffect, useState } from "react";
import CodeReview from "./CodeReview";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        console.log("Stored token:", token);

        if (!token) {
          setError("No token found. Please login again.");
          return;
        }

        const res = await fetch("http://localhost:5000/profile", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        console.log("Profile response:", data);

        if (res.ok && data.user) {
          setUser(data.user);
        } else {
          setError(data.error || "Failed to load profile");
        }
      } catch (err) {
        console.log("Fetch error:", err);
        setError("Something went wrong");
      }
    };

    fetchProfile();
  }, []);

return (
  <div className="container">
    <div className="card">
      <h2>Dashboard</h2>

      {user ? (
        <div>
          <p>Welcome: {user.email}</p>

          <button onClick={handleLogout}>Logout</button>

          <div style={{ marginTop: "20px" }}>
            <CodeReview />
          </div>
        </div>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  </div>
);
}

const handleLogout = () => {
  localStorage.removeItem("token");
  window.location.reload();
};

export default Dashboard;
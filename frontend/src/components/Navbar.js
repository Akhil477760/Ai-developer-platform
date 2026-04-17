import { Link } from "react-router-dom";
import "./../App.css";

function Navbar() {
  const token = localStorage.getItem("token");

  return (
    <div className="navbar">
      <Link to="/">Register</Link>
      <Link to="/login">Login</Link>
      {token && <Link to="/dashboard">Dashboard</Link>}
    </div>
  );
}

export default Navbar;
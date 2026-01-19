import { useNavigate } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <div className="navbar__logo" onClick={() => navigate("/")}>
        ToggleNest
      </div>

      <ul className="navbar__links">
        <li>
          <button className="link-btn" onClick={() => navigate("/dashboard")}>
            Dashboard
          </button>
        </li>
        <li>
          <button className="link-btn" onClick={() => navigate("/workspace")}>
            Workspace
          </button>
        </li>
        <li>
          <button className="link-btn" onClick={() => navigate("/sprints")}>
            Create +
          </button>
        </li>
      </ul>

      <div className="navbar__actions">
        <button className="btn-login" onClick={() => navigate("/login")}>
          Login
        </button>
        <button className="btn-signup" onClick={() => navigate("/signup")}>
          Sign Up
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
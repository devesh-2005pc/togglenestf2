import React from "react";
import "../theme/Home.css";
import { useNavigate } from "react-router-dom";
import bgImage from "../assets/togglenest-bg.png";

const Home = () => {
  const navigate = useNavigate();

  return (
    <section
      className="home"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="home-overlay"></div>

      <div className="home-container">
        <div className="home-content">
          <span className="home-badge">⚡ Smart Feature Management</span>

          <h1 className="home-title">
            Welcome to <span>ToggleNest</span>
          </h1>

          <p className="home-subtitle">
            Control features in real-time without redeploying code.
            Build faster, release safer, and scale smarter.
          </p>

          <div className="home-buttons">
            <button onClick={() => navigate("/login")} className="home-btn login">
              Login
            </button>
            <button onClick={() => navigate("/signup")} className="home-btn signup">
              Get Started
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Home;

// Footer.jsx
import React from "react";
import { Link } from "react-router-dom";
import "../theme/Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      {/* Top Section */}
      <div className="footer__container">
        <div className="footer__top">
          
          {/* Brand */}
          <div className="footer__brand">
            <div className="footer__logo">ToggleNest</div>
            <p className="footer__tagline">
              Modern workspace solutions for teams that move fast.
            </p>
          </div>

          {/* Navigation */}
          <div className="footer__nav">
            <h4 className="footer__nav-title">Product</h4>
            <ul className="footer__nav-links">
              <li>
                <Link to="/dashboard">Dashboard</Link>
              </li>
              <li>
                <Link to="/workspace">Workspace</Link>
              </li>
              <li>
                <Link to="/analytics">Analytics</Link>
              </li>
              {/* ❌ Integrations removed */}
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer__bottom">
        <div className="footer__bottom-content">
          <p className="footer__copyright">
            © 2026 ToggleNest. All rights reserved.
          </p>
          <div className="footer__bottom-links">
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
            <Link to="/cookies">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
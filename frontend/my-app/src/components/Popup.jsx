import React from "react";
import "./Navbar.css"; // reuse your navbar CSS for styling

const Popup = ({ message, onClose }) => {
  return (
    <div className="popup-overlay">
      <div className="popup-card">
        <p>{message}</p>
        <button className="popup-btn" onClick={onClose}>
          OK
        </button>
      </div>
    </div>
  );
};

export default Popup;

// Updated ActivityItem.jsx
import React from "react";
import "../theme/Dashboard.css";

// Right-click support for delete modal
const ActivityItem = ({ user, action, time, onContextMenu }) => {
  const getRelativeTime = (timestamp) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diff = Math.floor((now - past) / 1000); // in seconds

    if (diff < 60) return `${diff} sec ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  };

  return (
    <div
      className="activity-item"
      onContextMenu={onContextMenu} // Right-click opens delete modal
    >
      {/* Human emoji before username */}
      <span className="activity-user-emoji" role="img" aria-label="user">
        🧑
      </span>
      <strong>{user}</strong> {action}
      <span className="activity-time">{getRelativeTime(time)}</span>
    </div>
  );
};

export default ActivityItem;

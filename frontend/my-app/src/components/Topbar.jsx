import "../theme/Topbar.css";

const username = localStorage.getItem("username") || "GUEST";

const Topbar = () => {
  return (
    <div className="topbar">
      <input
        type="text"
        placeholder="Search tasks, projects..."
      />
      {/* <div className="user">
        <span>{username}</span>
        {username === "GUEST" ? (
          <span className="guest-emoji" role="img" aria-label="guest">👤</span>
        ) : (
          <img src="https://i.pravatar.cc/40" alt="user" />
        )}
      </div> */}
    </div>
  );
};

export default Topbar;

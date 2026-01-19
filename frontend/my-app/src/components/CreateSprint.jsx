import { useState } from "react";
import api from "../api/axios";

const CreateSprintPopup = ({ show, onClose, onSprintCreated }) => {
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [goal, setGoal] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreateSprint = async () => {
    if (!name || !startDate || !endDate) {
      alert("All fields are required");
      return;
    }

    try {
      setLoading(true);

      // 🔥 BACKEND CALL
      const res = await api.post("/sprints", {
        name,
        startDate,
        endDate,
        goal,
      });

      // Notify dashboard
     // onSprintCreated?.(res.data);

      // reset & close
      setName("");
      setStartDate("");
      setEndDate("");
      setGoal("");

      onClose();

    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || "Failed to create sprint");
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="popup-overlay open">
      <h1>hagaya</h1>
      <div className="popup-card">
        <h2>Create Sprint</h2>

        <input
          type="text"
          placeholder="Enter sprint name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div className="date-row">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />

          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <textarea
          placeholder="What is the goal of this sprint?"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
        />

        <div className="popup-buttons">
          <button onClick={onClose}>Cancel</button>
          <button onClick={handleCreateSprint} disabled={loading}>
            {loading ? "Creating..." : "Create Sprint"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateSprintPopup;

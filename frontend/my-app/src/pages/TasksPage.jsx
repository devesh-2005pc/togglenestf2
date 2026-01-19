import { useState } from "react";
import api from "../api/axios"; // ✅ import axios instance

const Tasks = () => {
  const [showTaskPopup, setShowTaskPopup] = useState(false);
  const [nameValue, setNameValue] = useState("");
  const [deadlineValue, setDeadlineValue] = useState("");

  // 👇 PUT YOUR FUNCTION HERE (TOP OR BOTTOM — BOTH OK)
  const handleAddTask = async () => {
    console.log("Add Task button clicked");

    if (!nameValue) {
      alert("Task name is required");
      return;
    }

    try {
      await api.post("/tasks", {
        title: nameValue,
        dueDate: deadlineValue,
      });

      setShowTaskPopup(false);
    } catch (error) {
      console.error(error);
      alert("Error creating task");
    }
  };

  return (
    <>
      <button onClick={() => setShowTaskPopup(true)}>
        Create Task
      </button>

      {showTaskPopup && (
        <div className="popup-overlay open">
          <div className="popup-card">
            <h3>Create New Task</h3>

            <input
              type="text"
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
            />

            <input
              type="date"
              value={deadlineValue}
              onChange={(e) => setDeadlineValue(e.target.value)}
            />

            <button type="button" onClick={handleAddTask}>
              Add Task
            </button>

            <button
              type="button"
              onClick={() => setShowTaskPopup(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Tasks;

import { useState } from "react";
import api from "../api/axios";
import Swal from "sweetalert2";

const CreateProjectPopup = ({ show, onClose, onProjectCreated }) => {
  const [nameValue, setNameValue] = useState("");
  const [descriptionValue, setDescriptionValue] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreateProject = async () => {
    if (!nameValue.trim()) {
      alert("Project name is required");
      return;
    }

    try {
      setLoading(true);

      // 🔥 CALL BACKEND
      const res = await api.post("/projects", {
        name: nameValue.trim(),
        description: descriptionValue.trim(),
      });

      // // Notify parent (Dashboard)
      // onProjectCreated?.(res.data);
      // }
            if (res.data) {
              Swal.fire("Project Created!", "Your project is now active.", "success");
              // console.log("Created Project:", res.data);
              setNameValue(res.data.name);
              setDescriptionValue(res.data.description || "");
              onClose();
            }
            // ✅ Reset & close popup
            
      

      // Reset + Close popup
      setNameValue("");
      setDescriptionValue("");
      onClose();

    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || "Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="popup-overlay open">
      <div className="popup-card">
        <h3>Create New Project</h3>

        <input
          type="text"
          placeholder="Project Name"
          value={nameValue}
          onChange={(e) => setNameValue(e.target.value)}
          className="popup-input"
        />

        <textarea
          placeholder="Description"
          value={descriptionValue}
          onChange={(e) => setDescriptionValue(e.target.value)}
          className="popup-input"
        />

        <div className="popup-buttons">
          <button type="button" onClick={handleCreateProject} disabled={loading}>
            {loading ? "Creating..." : "Create Project"}
          </button>

          <button type="button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateProjectPopup;

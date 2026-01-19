import { useEffect, useState } from "react";
import api from "../api/axios";

const MyTasks = ({ reload }) => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchTasks = async () => {
      const res = await api.get("/tasks/my");
      setTasks(res.data);
    };

    fetchTasks();
  }, [reload]);

  return (
    <div>
      <h3>My Tasks</h3>

      {tasks.length === 0 && <p>No tasks assigned</p>}

      {tasks.map((task) => (
        <div key={task._id} className="task-card">
          <h4>{task.title}</h4>
          <p>{task.description}</p>
          <p>Status: {task.status}</p>
          <p>
            Due:{" "}
            {task.dueDate
              ? new Date(task.dueDate).toLocaleDateString()
              : "No deadline"}
          </p>
        </div>
      ))}
    </div>
  );
};

export default MyTasks;

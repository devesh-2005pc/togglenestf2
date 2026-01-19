import { useEffect, useState } from "react";
import api from "../api/axios";

const TaskCount = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      const res = await api.get("/tasks/count");
      setCount(res.data.count);
    };

    fetchCount();
  }, []);

  return (
    <div className="dashboard-card">
      <h4>My Tasks</h4>
      <h2>{count}</h2>
    </div>
  );
};

export default TaskCount;

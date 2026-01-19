// ✅ FULLY UPDATED Dashboard.jsx - HYBRID BACKEND + MOCK DATA
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import StatCard from "../components/StatCard";
import ActivityItem from "../components/ActivityItem";
import CreateTaskPopup from "../components/CreateTask";
import CreateProjectPopup from "../components/CreateProject";
import Swal from "sweetalert2";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import api from "../api/axios";
import "../theme/Dashboard.css";

const Dashboard = () => {
  // 🔹 Dashboard data
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [sprintChartData, setSprintChartData] = useState([
    { name: "Completed", value: 0 },
    { name: "Remaining", value: 1 },
  ]);

  // 🔹 Tasks for team performance
  const [tasks, setTasks] = useState([]);

  // 🔹 Projects
  const [projects, setProjects] = useState([]);

  // 🔹 Popups
  const [showTaskPopup, setShowTaskPopup] = useState(false);
  const [showProjectPopup, setShowProjectPopup] = useState(false);

  // 🔹 Fallback flag
  const [useMockData, setUseMockData] = useState(false);

  // =====================
  // LOAD DASHBOARD
  // =====================
  const loadDashboard = async () => {
    try {
      const res = await api.get("/dashboard"); // /api is already handled in axios
      setStats(res.data.stats);
      setRecentActivity(res.data.recentActivity || []);
      if (res.data.sprintChart) {
        setSprintChartData([
          { name: "Completed", value: res.data.sprintChart.completed },
          { name: "Remaining", value: res.data.sprintChart.remaining },
        ]);
      }
    } catch (err) {
      console.error("Dashboard backend failed, using mock data:", err);
      setUseMockData(true);

      // 🔹 Load mock fallback
      loadMockDashboard();
    }
  };

  const loadMockDashboard = () => {
    const mockStats = {
      workspaces: 3,
      members: 5,
      projects: 8,
      sprints: 2,
      boards: 4,
    };

    const mockRecentActivity = [
      { itemId: "1", user: "John", action: "Created a new task", type: "task", time: new Date() },
      { itemId: "2", user: "Jane", action: "Completed a sprint", type: "sprint", time: new Date() },
      { itemId: "3", user: "You", action: "Created a project", type: "project", time: new Date() },
    ];

    const mockTasks = [
      { _id: "t1", title: "Design Homepage", completed: true },
      { _id: "t2", title: "Fix Auth Bug", completed: false },
      { _id: "t3", title: "Setup CI/CD", completed: true },
    ];

    const mockProjects = [
      { _id: "p1", name: "Website Redesign", createdAt: new Date() },
      { _id: "p2", name: "Mobile App", createdAt: new Date() },
    ];

    setStats(mockStats);
    setRecentActivity(mockRecentActivity);
    setSprintChartData([{ name: "Completed", value: 2 }, { name: "Remaining", value: 1 }]);
    setTasks(mockTasks);
    setProjects(
      mockProjects.map((p) => ({
        ...p,
        user: "You",
        action: `Created project: ${p.name}`,
        time: new Date(p.createdAt).toLocaleString(),
      }))
    );
  };

  // =====================
  // LOAD TASKS
  // =====================
  const loadTasks = async () => {
    if (useMockData) return;
    try {
      const res = await api.get("/tasks/my");
      setTasks(res.data);
    } catch (err) {
      console.error("Error loading tasks, switching to mock:", err);
      setUseMockData(true);
      loadMockDashboard();
    }
  };

  // =====================
  // LOAD PROJECTS
  // =====================
  const loadProjects = async () => {
    if (useMockData) return;
    try {
      const res = await api.get("/projects");
      const formattedProjects = res.data.map((project) => ({
        _id: project._id,
        name: project.name,
        user: "You",
        action: `Created project: ${project.name}`,
        time: new Date(project.createdAt).toLocaleString(),
      }));
      setProjects(formattedProjects);
    } catch (err) {
      console.error("Error loading projects, switching to mock:", err);
      setUseMockData(true);
      loadMockDashboard();
    }
  };

  // =====================
  // DELETE ACTIVITY
  // =====================
  const deleteActivityItem = async (itemId, type) => {
    try {
      if (!useMockData) {
        if (type === "task") await api.delete(`/tasks/${itemId}`);
        else if (type === "project") await api.delete(`/projects/${itemId}`);
      }
      Swal.fire({
        icon: "success",
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} Deleted`,
        text: `${type.charAt(0).toUpperCase() + type.slice(1)} has been deleted successfully!`,
        timer: 2000,
        showConfirmButton: false,
      });

      loadDashboard();
      loadTasks();
      loadProjects();
    } catch (err) {
      console.error("Delete failed:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.msg || "Failed to delete item",
      });
    }
  };

  // =====================
  // INITIAL LOAD
  // =====================
  useEffect(() => {
    loadDashboard();
    loadTasks();
    loadProjects();
  }, []);

  // =====================
  // TEAM PERFORMANCE
  // =====================
  const completedTasks = tasks.filter((t) => t.completed).length;
  const totalTasks = tasks.length || 1;

  return (
    <div className="dashboard-layout">
      <Sidebar
        openTaskPopup={() => setShowTaskPopup(true)}
        openProjectPopup={() => setShowProjectPopup(true)}
      />

      <div className="dashboard-content">
        <Topbar />

        <h2>Dashboard Overview</h2>
        <p className="muted-text">Welcome back! Here's what's happening.</p>

        {stats && (
          <div className="stats-grid">
            <StatCard title="Workspaces" value={stats.workspaces} />
            <StatCard title="Members" value={stats.members} />
            <StatCard title="Projects" value={stats.projects} />
            <StatCard title="Sprints" value={stats.sprints} />
            <StatCard title="Boards" value={stats.boards} />
          </div>
        )}

        <div className="bottom-grid">
          <div className="activity card card--glow">
            <h3>Recent Activity</h3>

            {recentActivity.length === 0 ? (
              <p className="empty-text">No recent activity</p>
            ) : (
              recentActivity.slice(0, 5).map((item, i) => (
                <div
                  key={i}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    Swal.fire({
                      title: "Delete?",
                      text: `Delete this ${item.type}?`,
                      icon: "warning",
                      showCancelButton: true,
                      confirmButtonColor: "#ef4444",
                      cancelButtonColor: "#6b7280",
                      confirmButtonText: "Delete",
                      cancelButtonText: "Cancel",
                    }).then((result) => {
                      if (result.isConfirmed) {
                        deleteActivityItem(item.itemId, item.type);
                      }
                    });
                  }}
                  style={{ cursor: "context-menu" }}
                >
                  <ActivityItem
                    user={item.user || "You"}
                    action={item.action}
                    time={new Date(item.time).toLocaleString()}
                  />
                </div>
              ))
            )}
          </div>

          <div className="progress card card--glow">
            <h3>Sprint Progress</h3>

           <div className="sprint-chart-wrapper">
  <ResponsiveContainer width="100%" height={170}>
    <PieChart>
      <Pie
        data={sprintChartData}
        innerRadius={55}
        outerRadius={75}
        dataKey="value"
        stroke="none"
      >
        <Cell fill="#22c55e" />
        <Cell fill="#334155" />
      </Pie>
    </PieChart>
  </ResponsiveContainer>

  <div className="sprint-chart-center">
    <h4>
      {sprintChartData[0].value}/
      {sprintChartData[0].value + sprintChartData[1].value}
    </h4>
    <span>Completed</span>
  </div>
</div>

            </div>
          </div>

        <div className="overview-grid">
          <div className="big-card card card--glow">
            <h3>Team Performance</h3>
            <div className="performance-stats">
              <div className="perf-box success">
                <h2>{completedTasks}</h2>
                <span>Completed</span>
              </div>
              <div className="perf-box info">
                <h2>{totalTasks - completedTasks}</h2>
                <span>In Progress</span>
              </div>
            </div>
          </div>

          <div className="big-card card card--glow">
            <h3>Workspace Overview</h3>
            <div className="workspace-item">
              <span>Active Projects</span>
              <strong>{stats?.projects || 0}</strong>
            </div>
            <div className="workspace-item">
              <span>Team Members</span>
              <strong>{stats?.members || 1}</strong>
            </div>
          </div>
        </div>
      </div>

      <CreateTaskPopup
        showTaskPopup={showTaskPopup}
        setShowTaskPopup={setShowTaskPopup}
        onTaskCreated={() => {
          loadTasks();
          loadDashboard();
        }}
      />

      <CreateProjectPopup
        show={showProjectPopup}
        onClose={() => setShowProjectPopup(false)}
        onProjectCreated={() => {
          loadDashboard();
          loadProjects();
        }}
      />
    </div>
  );
};

export default Dashboard;


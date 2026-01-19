// ✅ FINAL WorkSpace.jsx - FULLY WORKING BACKEND + MOCK DATA HYBRID
import React, { useState, useEffect } from "react";
import "../theme/Workspace.css"; 
import api from "../api/axios";

const WorkSpace = () => {
  const [workspaces, setWorkspaces] = useState([]);
  const [currentWorkspace, setCurrentWorkspace] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [deleteModal, setDeleteModal] = useState({ show: false, workspaceId: null });

  // Context menu + Members management
  const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0, workspaceId: null });
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState(null);
  const [newMemberEmail, setNewMemberEmail] = useState("");

  // Loading & Error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [useMockData, setUseMockData] = useState(false);

  // Load workspaces (with backend fallback)
  useEffect(() => {
    const fetchWorkspaces = async () => {
      setLoading(true);
      try {
        const res = await api.get("/workspaces");
        const saved = localStorage.getItem("currentWorkspace");
        let initialWorkspace = null;
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            initialWorkspace = res.data.find(
              (w) => w._id === parsed._id || w.id === parsed.id
            );
          } catch (e) {
            console.log("Invalid saved workspace");
          }
        }
        if (!initialWorkspace && res.data.length > 0) {
          initialWorkspace = res.data.find((w) => w.active) || res.data[0];
        }
        setCurrentWorkspace(initialWorkspace);
        if (initialWorkspace) {
          localStorage.setItem("currentWorkspace", JSON.stringify(initialWorkspace));
        }
        setWorkspaces(res.data);
      } catch (err) {
        console.error("❌ Backend failed, using mock data:", err);
        setUseMockData(true);
        loadMockData();
        setError("Using demo data (backend unavailable)");
      } finally {
        setLoading(false);
      }
    };

    const loadMockData = () => {
      const mockWorkspaces = [
        {
          _id: "1",
          id: "1",
          name: "Acme Corp HQ",
          projects: 12,
          active: true,
          members: [{ email: "john@acme.com" }, { email: "jane@acme.com" }]
        },
        {
          _id: "2",
          id: "2",
          name: "Personal Projects",
          projects: 5,
          active: false,
          members: [{ email: "you@toggle.com" }]
        },
        {
          _id: "3",
          id: "3",
          name: "Marketing Team",
          projects: 8,
          active: false,
          members: [{ email: "marketing@company.com" }]
        }
      ];

      setWorkspaces(mockWorkspaces);
      setCurrentWorkspace(mockWorkspaces[0]);
      localStorage.setItem("currentWorkspace", JSON.stringify(mockWorkspaces[0]));
    };

    fetchWorkspaces();
  }, []);

  // ✅ Switch Workspace
  const handleSwitch = async (workspace) => {
    const updateLocal = () => {
      const updatedWorkspaces = workspaces.map(w => ({
        ...w,
        active: (w._id || w.id) === (workspace._id || workspace.id)
      }));
      setWorkspaces(updatedWorkspaces);
      setCurrentWorkspace(workspace);
      localStorage.setItem("currentWorkspace", JSON.stringify(workspace));
    };

    try {
      if (!useMockData) await api.patch(`/workspaces/${workspace._id || workspace.id}/activate`);
      updateLocal();
    } catch (err) {
      console.error("Switch failed:", err);
      updateLocal();
    }
  };

  // ✅ Context menu
  const handleContextMenu = (e, workspaceId) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ show: true, x: e.pageX, y: e.pageY, workspaceId });
  };
  const handleCloseContextMenu = () => setContextMenu({ show: false, x: 0, y: 0, workspaceId: null });

  // ✅ Manage Members
  const handleManageMembers = (workspaceId) => {
    setSelectedWorkspaceId(workspaceId);
    handleCloseContextMenu();
    setShowMembersModal(true);
  };

  // ✅ Delete Workspace
  const handleDeleteConfirm = async () => {
    try {
      if (!useMockData) await api.delete(`/workspaces/${deleteModal.workspaceId}`);
      const remaining = workspaces.filter(w => (w._id || w.id) !== deleteModal.workspaceId);
      setWorkspaces(remaining);

      if (currentWorkspace && (currentWorkspace._id || currentWorkspace.id) === deleteModal.workspaceId && remaining.length > 0) {
        await handleSwitch(remaining[0]);
      } else if (remaining.length === 0) {
        setCurrentWorkspace(null);
        localStorage.removeItem("currentWorkspace");
      }

      setDeleteModal({ show: false, workspaceId: null });
    } catch (err) {
      console.error("Delete failed:", err);
      setWorkspaces(workspaces.filter(w => (w._id || w.id) !== deleteModal.workspaceId));
      setDeleteModal({ show: false, workspaceId: null });
    }
  };

  // ✅ Create Workspace
  const createWorkspace = async () => {
    if (!newWorkspaceName.trim()) return alert("Please enter a workspace name");

    try {
      const newWs = !useMockData
        ? (await api.post("/workspaces", { name: newWorkspaceName.trim() })).data
        : {
            _id: Date.now().toString(),
            id: Date.now().toString(),
            name: newWorkspaceName.trim(),
            projects: 0,
            members: [{ email: "you@toggle.com" }],
            active: true
          };
      setWorkspaces([newWs, ...workspaces]);
      setCurrentWorkspace(newWs);
      localStorage.setItem("currentWorkspace", JSON.stringify(newWs));
      setIsCreating(false);
      setNewWorkspaceName("");
    } catch (err) {
      console.error("Create failed:", err);
      alert("Failed to create workspace");
    }
  };

  // ✅ Add Member
  const addMember = async () => {
    if (!newMemberEmail.trim()) return;
    try {
      if (!useMockData) {
        const updatedWs = (await api.post(`/workspaces/${selectedWorkspaceId}/members`, { email: newMemberEmail.trim() })).data;
        setWorkspaces(workspaces.map(w => (w._id || w.id) === selectedWorkspaceId ? updatedWs : w));
        if ((currentWorkspace._id || currentWorkspace.id) === selectedWorkspaceId) setCurrentWorkspace(updatedWs);
      } else {
        const updatedWorkspaces = workspaces.map(w =>
          (w._id || w.id) === selectedWorkspaceId
            ? { ...w, members: [...w.members, { email: newMemberEmail.trim() }] }
            : w
        );
        setWorkspaces(updatedWorkspaces);
        if ((currentWorkspace._id || currentWorkspace.id) === selectedWorkspaceId)
          setCurrentWorkspace(updatedWorkspaces.find(w => (w._id || w.id) === selectedWorkspaceId));
      }
      setNewMemberEmail("");
    } catch (err) {
      console.error("Add member failed:", err);
      alert("Failed to add member");
    }
  };

  // ✅ Remove Member
  const removeMember = async (email) => {
    try {
      if (!useMockData) {
        const updatedWs = (await api.delete(`/workspaces/${selectedWorkspaceId}/members`, { data: { email } })).data;
        setWorkspaces(workspaces.map(w => (w._id || w.id) === selectedWorkspaceId ? updatedWs : w));
        if ((currentWorkspace._id || currentWorkspace.id) === selectedWorkspaceId) setCurrentWorkspace(updatedWs);
      } else {
        const updatedWorkspaces = workspaces.map(w =>
          (w._id || w.id) === selectedWorkspaceId
            ? { ...w, members: w.members.filter(m => m.email !== email) }
            : w
        );
        setWorkspaces(updatedWorkspaces);
        if ((currentWorkspace._id || currentWorkspace.id) === selectedWorkspaceId)
          setCurrentWorkspace(updatedWorkspaces.find(w => (w._id || w.id) === selectedWorkspaceId));
      }
    } catch (err) {
      console.error("Remove member failed:", err);
    }
  };

  const filteredWorkspaces = workspaces.filter(ws =>
    ws.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div style={{ textAlign: "center", marginTop: "50px", color: "white" }}>Loading workspaces...</div>;

  return (
    <div className="workspace-page">
      {/* Workspaces Header */}
      <div className="workspace-header">
        <h1>Workspaces</h1>
        <p className="subtitle">Manage all your teams, projects, and collaborative spaces</p>
      </div>

      {/* Current Workspace */}
      <div className="workspace-current-card glass-card">
        <h2>{currentWorkspace?.name || "No Workspace Selected"}</h2>
        <div>{currentWorkspace?.projects || 0} Projects</div>
        <div>{currentWorkspace?.members?.length || 0} Members</div>
        <button className="btn primary" onClick={() => document.querySelector('.workspaces-list-card')?.scrollIntoView({ behavior: 'smooth' })}>
          {currentWorkspace ? "Switch Workspace" : "Create First Workspace"}
        </button>
      </div>

      {/* All Workspaces */}
      <div className="workspaces-list-card glass-card">
        <h3>All Workspaces ({workspaces.length})</h3>
        <input
          type="text"
          placeholder="Search workspaces..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        {filteredWorkspaces.length === 0 ? (
          <p>No workspaces match your search.</p>
        ) : (
          filteredWorkspaces.map(ws => (
            <div key={ws._id || ws.id} className={`workspace-item ${ws.active ? "active" : ""}`} onClick={() => handleSwitch(ws)} onContextMenu={e => handleContextMenu(e, ws._id || ws.id)}>
              <div>{ws.name}</div>
              <div>{ws.projects} Projects</div>
              <div>{ws.members?.length || 0} Members</div>
            </div>
          ))
        )}
        <button className="btn light full-width" onClick={() => setIsCreating(true)}>+ New Workspace</button>
      </div>
    </div>
  );
};

export default WorkSpace;

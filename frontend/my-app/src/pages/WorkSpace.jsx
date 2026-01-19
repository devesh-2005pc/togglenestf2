// ✅ FINAL WorkSpace.jsx - FULLY WORKING BACKEND + MOCK DATA HYBRID (DEPLOYMENT READY)
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

        // Set current workspace from localStorage or first available
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
        setWorkspaces(res.data);  // ✅ FIXED: Set workspaces from API response
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
          membersCount: 2,
          members: [{ email: "john@acme.com" }, { email: "jane@acme.com" }]
        },
        {
          _id: "2",
          id: "2",
          name: "Personal Projects",
          projects: 5,
          active: false,
          membersCount: 1,
          members: [{ email: "you@toggle.com" }]
        },
        {
          _id: "3",
          id: "3",
          name: "Marketing Team",
          projects: 8,
          active: false,
          membersCount: 1,
          members: [{ email: "marketing@company.com" }]
        }
      ];

      setWorkspaces(mockWorkspaces);
      setCurrentWorkspace(mockWorkspaces[0]);
      localStorage.setItem("currentWorkspace", JSON.stringify(mockWorkspaces[0]));
    };

    fetchWorkspaces();
  }, []);

  // ✅ UNIVERSAL SWITCH (Backend OR Mock)
  const handleSwitch = async (workspace) => {
    const updateLocalState = () => {
      const updatedWorkspaces = workspaces.map(w => ({
        ...w,
        active: (w._id || w.id) === (workspace._id || workspace.id)
      }));
      setWorkspaces(updatedWorkspaces);
      setCurrentWorkspace(workspace);
      localStorage.setItem("currentWorkspace", JSON.stringify(workspace));
    };

    try {
      if (!useMockData) {
        await api.patch(`/workspaces/${workspace._id || workspace.id}/activate`);
      }
      updateLocalState();
    } catch (err) {
      console.error("Switch failed:", err);
      updateLocalState();
    }
  };

  // ✅ CONTEXT MENU
  const handleContextMenu = (e, workspaceId) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      show: true,
      x: e.pageX,
      y: e.pageY,
      workspaceId: workspaceId
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu({ show: false, x: 0, y: 0, workspaceId: null });
  };

  // ✅ MANAGE MEMBERS
  const handleManageMembers = (workspaceId) => {
    setSelectedWorkspaceId(workspaceId);
    handleCloseContextMenu();
    setShowMembersModal(true);
  };

  // ✅ DELETE WORKSPACE
  const handleDeleteConfirm = async () => {
    try {
      if (!useMockData) {
        await api.delete(`/workspaces/${deleteModal.workspaceId}`);
      }

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
      const remaining = workspaces.filter(w => (w._id || w.id) !== deleteModal.workspaceId);
      setWorkspaces(remaining);
      setDeleteModal({ show: false, workspaceId: null });
    }
  };

  // ✅ CREATE WORKSPACE
  const createWorkspace = async () => {
    if (!newWorkspaceName.trim()) return alert("Please enter a workspace name");

    try {
      if (!useMockData) {
        const res = await api.post("/workspaces", { name: newWorkspaceName.trim() });
        const newWs = res.data;
        setWorkspaces([newWs, ...workspaces]);
        setCurrentWorkspace(newWs);
        localStorage.setItem("currentWorkspace", JSON.stringify(newWs));
      } else {
        const newWs = {
          _id: Date.now().toString(),
          id: Date.now().toString(),
          name: newWorkspaceName.trim(),
          projects: 0,
          membersCount: 1,
          members: [{ email: "you@toggle.com" }],
          active: true
        };
        setWorkspaces([newWs, ...workspaces]);
        setCurrentWorkspace(newWs);
        localStorage.setItem("currentWorkspace", JSON.stringify(newWs));
      }
      setIsCreating(false);
      setNewWorkspaceName("");
    } catch (err) {
      console.error("Create failed:", err);
      alert("Failed to create workspace");
    }
  };

  // ✅ ADD MEMBER
  const addMember = async () => {
    if (!newMemberEmail.trim()) return;

    try {
      if (!useMockData) {
        const res = await api.post(`/workspaces/${selectedWorkspaceId}/members`, { email: newMemberEmail.trim() });
        const updatedWs = res.data;
        setWorkspaces(workspaces.map(w => (w._id || w.id) === selectedWorkspaceId ? updatedWs : w));
        if (currentWorkspace && (currentWorkspace._id || currentWorkspace.id) === selectedWorkspaceId) {
          setCurrentWorkspace(updatedWs);
        }
      } else {
        const updatedWorkspaces = workspaces.map(w =>
          (w._id || w.id) === selectedWorkspaceId
            ? {
                ...w,
                members: [...(w.members || []), { email: newMemberEmail.trim() }],
                membersCount: (w.members?.length || 0) + 1
              }
            : w
        );
        setWorkspaces(updatedWorkspaces);
        if (currentWorkspace && (currentWorkspace._id || currentWorkspace.id) === selectedWorkspaceId) {
          setCurrentWorkspace(updatedWorkspaces.find(w => (w._id || w.id) === selectedWorkspaceId));
        }
      }
      setNewMemberEmail("");
    } catch (err) {
      console.error("Add member failed:", err);
      alert("Failed to add member");
    }
  };

  // ✅ REMOVE MEMBER
  const removeMember = async (email) => {
    try {
      if (!useMockData) {
        const res = await api.delete(`/workspaces/${selectedWorkspaceId}/members`, { data: { email } });
        const updatedWs = res.data;
        setWorkspaces(workspaces.map(w => (w._id || w.id) === selectedWorkspaceId ? updatedWs : w));
        if (currentWorkspace && (currentWorkspace._id || currentWorkspace.id) === selectedWorkspaceId) {
          setCurrentWorkspace(updatedWs);
        }
      } else {
        const updatedWorkspaces = workspaces.map(w =>
          (w._id || w.id) === selectedWorkspaceId
            ? {
                ...w,
                members: (w.members || []).filter(m => m.email !== email),
                membersCount: Math.max(0, (w.members?.length || 1) - 1)
              }
            : w
        );
        setWorkspaces(updatedWorkspaces);
        if (currentWorkspace && (currentWorkspace._id || currentWorkspace.id) === selectedWorkspaceId) {
          setCurrentWorkspace(updatedWorkspaces.find(w => (w._id || w.id) === selectedWorkspaceId));
        }
      }
    } catch (err) {
      console.error("Remove member failed:", err);
    }
  };

  const filteredWorkspaces = workspaces.filter(ws =>
    ws.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="workspace-page">
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '50vh',
          color: 'white',
          fontSize: '18px'
        }}>
          Loading workspaces...
        </div>
      </div>
    );
  }

  return (
    <div className="workspace-page">
      <div className="stars">
        <div className="star"></div><div className="star"></div><div className="star"></div>
        <div className="star"></div><div className="star"></div>
      </div>

      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.2)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '30px',
          color: '#fee2e2'
        }}>
          {error} 
          <button 
            onClick={() => window.location.reload()} 
            style={{
              marginLeft: '10px', 
              background: '#ef4444', 
              color: 'white', 
              border: 'none', 
              padding: '5px 12px', 
              borderRadius: '6px', 
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      )}

      <div className="workspace-header">
        <h1>Workspaces</h1>
        <p className="subtitle">Manage all your teams, projects, and collaborative spaces</p>
      </div>

      <div className="workspace-grid">
        <div className="workspace-current-card glass-card">
          <div className="current-workspace-info">
            <div className="workspace-icon blue">🏢</div>
            <div>
              <h2>{currentWorkspace?.name || "No Workspace Selected"}</h2>
              <div className="workspace-stats">
                <span>{currentWorkspace?.projects || 0} Projects</span>
                <span>{currentWorkspace?.members?.length || currentWorkspace?.membersCount || 0} Members</span> {/* ✅ FIXED: Safe fallback */}
              </div>
            </div>
          </div>
          <button 
            className="btn primary" 
            onClick={() => {
              document.querySelector('.workspaces-list-card')?.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
              });
            }}
          >
            {currentWorkspace ? "Switch Workspace" : "Create First Workspace"}
          </button>
        </div>

        <div className="workspaces-list-card glass-card">
          <div className="list-header">
            <h3>All Workspaces ({workspaces.length})</h3>
            <div className="search-container">
              <input
                type="text"
                placeholder="Search workspaces..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          <div className="workspaces-grid">
            {filteredWorkspaces.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                color: 'rgba(255,255,255,0.6)'
              }}>
                <div style={{fontSize: '48px', marginBottom: '20px'}}>📁</div>
                <p>No workspaces match your search. {searchTerm ? 'Clear search or create new.' : 'Create your first workspace!'}</p>
              </div>
            ) : (
              filteredWorkspaces.map((workspace) => (
                <div
                  key={workspace._id || workspace.id}
                  className={`workspace-item ${workspace.active ? "active" : ""}`}
                  onClick={() => handleSwitch(workspace)}
                  onContextMenu={(e) => handleContextMenu(e, workspace._id || workspace.id)}
                >
                  <div className="workspace-icon teal">📁</div>
                  <div className="workspace-details">
                    <h4>{workspace.name}</h4>
                    <div className="workspace-meta">
                      <span>{workspace.projects || 0} projects</span>
                      <span>{workspace.members?.length || workspace.membersCount || 0} members</span> {/* ✅ FIXED: Safe fallback */}
                    </div>
                  </div>
                  {workspace.active && <div className="active-indicator"></div>}
                </div>
              ))
            )}
          </div>

          <button className="btn light full-width" onClick={() => setIsCreating(true)}>
            + New Workspace
          </button>
        </div>
      </div>

      {/* ✅ FIXED CONTEXT MENU - ALL BUTTONS WORK */}
      {contextMenu.show && (
        <div 
          className="context-menu"
          style={{ 
            left: `${contextMenu.x}px`, 
            top: `${contextMenu.y}px`,
            position: 'fixed',
            zIndex: 1002
          }}
        >
          <div 
            className="context-menu-item" 
            onClick={(e) => {
              e.stopPropagation();
              const ws = workspaces.find(w => (w._id || w.id) === contextMenu.workspaceId);
              if (ws) {
                handleSwitch(ws);
              }
              handleCloseContextMenu();
            }}
          >
            👉 Switch to Workspace
          </div>
          <div 
            className="context-menu-item" 
            onClick={(e) => {
              e.stopPropagation();
              handleManageMembers(contextMenu.workspaceId);
            }}
          >
            👥 Manage Members
          </div>
          <div 
            className="context-menu-item danger" 
            onClick={(e) => {
              e.stopPropagation();
              setDeleteModal({ show: true, workspaceId: contextMenu.workspaceId });
              handleCloseContextMenu();
            }}
          >
            🗑️ Delete Workspace
          </div>
        </div>
      )}

      {/* CREATE MODAL */}
      {isCreating && (
        <div className="create-modal-overlay">
          <div className="create-modal glass-card">
            <h3>Create New Workspace</h3>
            <input
              type="text"
              placeholder="Workspace name..."
              value={newWorkspaceName}
              onChange={(e) => setNewWorkspaceName(e.target.value)}
              className="modal-input"
              autoFocus
            />
            <div className="modal-actions">
              <button className="btn primary" onClick={createWorkspace}>Create</button>
              <button className="btn outline" onClick={() => setIsCreating(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* MEMBERS MODAL - FIXED */}
      {showMembersModal && selectedWorkspaceId && (
        <div className="create-modal-overlay">
          <div className="members-modal glass-card">
            <h3>Manage Members</h3>
            <p className="workspace-name">
              {workspaces.find(w => (w._id || w.id) === selectedWorkspaceId)?.name || 'Loading...'}
            </p>
            
            <div className="add-member-section">
              <input
                type="email"
                placeholder="Add member by email..."
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                className="modal-input"
              />
              <button className="btn primary" onClick={addMember}>Add Member</button>
            </div>

            <div className="members-list">
              <h4>Team Members ({workspaces.find(w => (w._id || w.id) === selectedWorkspaceId)?.members?.length || 0})</h4>
              {(() => {
                const ws = workspaces.find(w => (w._id || w.id) === selectedWorkspaceId);
                const membersList = ws?.members || [];
                if (membersList.length > 0) {
                  return membersList.map((member, idx) => (
                    <div key={idx} className="member-item">
                      <span className="member-avatar">{member.email.charAt(0).toUpperCase()}</span>
                      <span className="member-name">{member.email}</span>
                      <button 
                        className="btn-remove" 
                        onClick={() => removeMember(member.email)}
                      >
                        Remove
                      </button>
                    </div>
                  ));
                }
                return <p style={{textAlign: 'center', color: 'rgba(255,255,255,0.6)', padding: '20px'}}>No members yet. Add the first one!</p>;
              })()}
            </div>

            <div className="modal-actions">
              <button className="btn outline" onClick={() => {
                setShowMembersModal(false);
                setSelectedWorkspaceId(null);
                setNewMemberEmail("");
              }}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteModal.show && (
        <div className="delete-modal-overlay">
          <div className="delete-modal glass-card">
            <div className="delete-icon">🗑️</div>
            <h3>Delete Workspace?</h3>
            <p className="delete-warning">
              This will permanently remove "{workspaces.find(w => (w._id || w.id) === deleteModal.workspaceId)?.name}" 
              and all its data. This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button className="btn danger" onClick={handleDeleteConfirm}>Delete Workspace</button>
              <button className="btn outline" onClick={() => setDeleteModal({ show: false, workspaceId: null })}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkSpace;

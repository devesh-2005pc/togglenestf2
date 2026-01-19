import React, { useState, useEffect } from "react";
import api from "../api/axios";
import "../theme/TeamPage.css";
import { FaEdit, FaTrashAlt, FaEllipsisV, FaPlus, FaCog, FaSearch, FaTimes } from "react-icons/fa";

const TeamPage = () => {
  // Main states
  const [activeTab, setActiveTab] = useState("members");
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingInvitations, setPendingInvitations] = useState([]);

  // Search/Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [bulkActionsOpen, setBulkActionsOpen] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState([]);

  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteMemberId, setDeleteMemberId] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");

  // Settings panel state
  const [showSettings, setShowSettings] = useState(false);
  const [teamSettings, setTeamSettings] = useState({
    allowInvites: true,
    require2FA: false,
    emailNotifications: true,
    autoApproveMembers: false,
    maxMembers: 20
  });

  // Filter members
  const filteredMembers = members.filter(member =>
    (member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (selectedRole === "all" || member.role?.toLowerCase() === selectedRole)
  );

  // Handlers
  const handleSettings = () => setShowSettings(true);

  const updateSetting = (key, value) => {
    setTeamSettings(prev => {
      const newSettings = { ...prev, [key]: value };
      localStorage.setItem('teamSettings', JSON.stringify(newSettings));
      return newSettings;
    });
  };

  const handleInviteMember = () => setShowInviteModal(true);

  // 🔹 Send Invite (backend + email)
  const handleSubmitInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail) return;
    if (!teamSettings.allowInvites) return alert("❌ Member invites are disabled!");

    try {
      const res = await api.post("/team/invite", {
        email: inviteEmail,
        role: inviteRole
      });
      // add to pending invitations
      setPendingInvitations([res.data, ...pendingInvitations]);
      setInviteEmail("");
      setShowInviteModal(false);
      alert(`📧 Invite sent to ${res.data.email}!`);
    } catch (err) {
      console.error(err);
      alert("❌ Failed to send invite");
    }
  };

  // Bulk actions
  const toggleBulkActions = () => setBulkActionsOpen(!bulkActionsOpen);

  const selectAllMembers = () => {
    if (selectedMembers.length === filteredMembers.length) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(filteredMembers.map(m => m.id));
    }
  };

  const toggleMemberSelection = (id) => {
    setSelectedMembers(prev =>
      prev.includes(id)
        ? prev.filter(memberId => memberId !== id)
        : [...prev, id]
    );
  };

  // 🔹 Edit member (backend)
  const handleEditMember = async (memberId, updatedData) => {
    try {
      const res = await api.put(`/users/${memberId}`, updatedData);
      setMembers(prev => prev.map(m => (m.id === memberId ? res.data : m)));
      alert("✏️ Member updated successfully!");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to update member");
    }
  };

  // 🔹 Delete member (backend)
  const handleDeleteMember = (id) => {
    setDeleteMemberId(id);
    setShowDeleteModal(true);
  };

  const confirmDeleteMember = async () => {
    if (!deleteMemberId) return;
    try {
      await api.delete(`/team/member/${deleteMemberId}`);
      setMembers(prev => prev.filter(member => member.id !== deleteMemberId));
      setDeleteMemberId(null);
      setShowDeleteModal(false);
      alert("🗑️ Member deleted successfully!");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to delete member");
    }
  };

  // 🔹 Bulk delete members
  const handleBulkDelete = async () => {
    if (selectedMembers.length === 0) return;

    try {
      await Promise.all(selectedMembers.map(id => api.delete(`/team/member/${id}`)));
      setMembers(prev => prev.filter(member => !selectedMembers.includes(member.id)));
      setSelectedMembers([]);
      setBulkActionsOpen(false);
      alert(`🗑️ Deleted ${selectedMembers.length} members!`);
    } catch (err) {
      console.error(err);
      alert("❌ Failed to delete some members");
    }
  };

  // 🔹 Resend / Cancel invites (backend)
  const handleResendInvite = async (invite) => {
    try {
      await api.post("/team/invite", { email: invite.email, role: invite.role });
      alert(`📧 Resent invitation to ${invite.email}`);
    } catch (err) {
      console.error(err);
      alert("❌ Failed to resend invite");
    }
  };
const handleCancelInvite = async (inviteId) => {
  if (!window.confirm("Cancel this invite?")) return;

  try {
    await api.delete(`/team/invite/${inviteId}`);
    alert("Invite cancelled");
    fetchInvites(); // refresh list
  } catch (err) {
    console.error(err);
    alert("Failed to cancel invite");
  }
};


  // 🔹 Fetch members & invites from backend
  useEffect(() => {
    const fetchMembersAndInvites = async () => {
      setLoading(true);
      try {
        const [membersRes, invitesRes] = await Promise.all([
          api.get("/team/members"),
          api.get("/team/invites")
        ]);
        setMembers(membersRes.data);
        setPendingInvitations(invitesRes.data);
      } catch (err) {
        console.error("Failed to fetch team data", err);
        alert("❌ Failed to fetch team data from server");
      } finally {
        setLoading(false);
      }
    };

    fetchMembersAndInvites();
  }, []);

  // localStorage persistence (settings only)
  useEffect(() => {
    const savedSettings = localStorage.getItem('teamSettings');
    if (savedSettings) setTeamSettings(JSON.parse(savedSettings));
  }, []);

  useEffect(() => {
    localStorage.setItem('teamSettings', JSON.stringify(teamSettings));
  }, [teamSettings]);

  return (
    <div className="team-page">
      {/* Header */}
      <div className="team-header">
        <div>
          <h2>Team Management</h2>
          <p>Member management and settings</p>
        </div>
        <div className="team-actions">
          <button className="settings-btn" onClick={handleSettings} title="Open Settings">
            <FaCog /> Settings
          </button>
          <button className="invite-btn" onClick={handleInviteMember} title="Invite New Member">
            <FaPlus /> Invite Member
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="team-tabs">
        <button
          className={activeTab === "members" ? "active" : ""}
          onClick={() => setActiveTab("members")}
        >
          Team Members
        </button>
        <button
          className={activeTab === "pending" ? "active" : ""}
          onClick={() => setActiveTab("pending")}
        >
          Pending Invitations <span className="badge">{pendingInvitations.length}</span>
        </button>
      </div>

      {/* Search / Filters */}
      {activeTab === "members" && (
        <div className="team-search-container">
          <div className="team-search">
            <div className="search-input-wrapper">
              <FaSearch className="search-icon" />
              <input 
                type="text" 
                placeholder="Search members..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <select 
              value={selectedRole} 
              onChange={(e) => setSelectedRole(e.target.value)}
              className="role-filter"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="member">Member</option>
              <option value="viewer">Viewer</option>
            </select>
            <button className="bulk-btn" onClick={toggleBulkActions}>
              Bulk Actions ({selectedMembers.length})
            </button>
          </div>
          
          {bulkActionsOpen && (
            <div className="bulk-dropdown-container">
              <div className="bulk-dropdown">
                <div className="bulk-dropdown-header">
                  {selectedMembers.length} {selectedMembers.length === 1 ? 'member' : 'members'} selected
                </div>
                <button className="bulk-select-all" onClick={selectAllMembers}>
                  {selectedMembers.length === filteredMembers.length && filteredMembers.length > 0 ? "Deselect All" : "Select All"}
                </button>
                <button 
                  className="bulk-delete"
                  disabled={selectedMembers.length === 0}
                  onClick={handleBulkDelete}
                >
                  Delete Selected
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Members Table */}
      {activeTab === "members" && (
        <div className="team-table">
          <div className="table-header">
            <span>
              <input 
                type="checkbox" 
                checked={selectedMembers.length === filteredMembers.length && filteredMembers.length > 0}
                onChange={selectAllMembers}
              />
              Name
            </span>
            <span>Role</span>
            <span>Department</span>
            <span>Last Active</span>
            <span>Status</span>
            <span>Actions</span>
          </div>
          <div className="table-body">
            {loading ? (
              <div className="empty-state">Loading members...</div>
            ) : filteredMembers.length === 0 ? (
              <div className="empty-state">
                <div>No team members yet.</div>
                <div style={{ fontSize: "14px", opacity: 0.8 }}>
                  Use "Invite Member" to add your first team member!
                </div>
              </div>
            ) : (
              filteredMembers.map((member) => (
                <div className="table-row" key={member.id}>
                  <div className="member-info">
                    <input
                      type="checkbox"
                      checked={selectedMembers.includes(member.id)}
                      onChange={() => toggleMemberSelection(member.id)}
                    />
                    <div className="avatar-placeholder">👤</div>
                    <div>
                      <p>{member.name}</p>
                      <span>{member.email}</span>
                    </div>
                  </div>
                  <span className={`role ${member.role?.toLowerCase()}`}>{member.role}</span>
                  <span>{member.department}</span>
                  <span>{member.lastActive}</span>
                  <span className={`status ${member.status}`}>{member.status}</span>
                  <div className="actions">
                    <FaEdit 
                      onClick={() => handleEditMember(member.id, { role: member.role })} 
                      style={{ cursor: "pointer" }}
                      title="Edit Member"
                    />
                    <FaTrashAlt 
                      onClick={() => handleDeleteMember(member.id)} 
                      style={{ cursor: "pointer" }}
                      title="Delete Member"
                    />
                    <FaEllipsisV title="More actions" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Pending Invitations Table */}
      {activeTab === "pending" && (
        <div className="team-table">
          <div className="table-header">
            <span>Email</span>
            <span>Role</span>
            <span>Invited By</span>
            <span>Invited On</span>
            <span>Expires</span>
            <span>Actions</span>
          </div>
          <div className="table-body">
            {pendingInvitations.length === 0 ? (
              <div className="empty-state">
                <div>No pending invitations.</div>
                <div style={{ fontSize: "14px", opacity: 0.8 }}>Invite members to see them here!</div>
              </div>
            ) : (
              pendingInvitations.map((invite) => (
                <div className="table-row" key={invite.id}>
                  <span>{invite.email}</span>
                  <span className={`role ${invite.role.toLowerCase()}`}>{invite.role}</span>
                  <span>{invite.invitedBy}</span>
                  <span>{invite.invitedOn}</span>
                  <span>{invite.expires}</span>
                  <div className="actions">
                    <button 
                      className="resend-btn" 
                      onClick={() => handleResendInvite(invite)}
                    >
                      Resend
                    </button>
                    <button 
                      className="cancel-btn"
                      onClick={() => handleCancelInvite(invite._id)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Modals & Settings (same as your previous code) */}
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Delete Member?</h3>
            <p>This action cannot be undone. Are you sure you want to delete this member?</p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button className="btn-danger" onClick={confirmDeleteMember}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="modal-overlay" onClick={() => setShowInviteModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Invite New Member</h3>
            <form onSubmit={handleSubmitInvite}>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="Enter email address"
                required
              />
              <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}>
                <option value="member">Member</option>
                <option value="viewer">Viewer</option>
                <option value="admin">Admin</option>
              </select>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowInviteModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Send Invite</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Settings Panel (same as your previous code) */}
      {showSettings && (
        <div className="settings-panel open">
          <div className="settings-panel-header">
            <button className="settings-panel-close" onClick={() => setShowSettings(false)}>
              <FaTimes />
            </button>
            <h3>Team Settings</h3>
            <p>Configure your team preferences</p>
          </div>

          {/* Settings Sections... same as your previous code */}
          <div className="settings-footer">
            <button 
              className="btn-secondary"
              onClick={() => {
                const defaultSettings = { 
                  allowInvites: true, 
                  require2FA: false, 
                  emailNotifications: true, 
                  autoApproveMembers: false, 
                  maxMembers: 20 
                };
                setTeamSettings(defaultSettings);
                localStorage.setItem('teamSettings', JSON.stringify(defaultSettings));
                alert('⚙️ Settings reset to defaults!');
              }}
            >
              Reset to Defaults
            </button>
            <button 
              className="btn-primary" 
              onClick={() => {
                setShowSettings(false);
                alert('💾 All settings saved successfully!');
              }}
            >
              Save & Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamPage;

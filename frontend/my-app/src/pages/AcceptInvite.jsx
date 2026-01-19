import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

const AcceptInvite = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading"); // "loading" | "error" | "expired" | "accepted" | "success"
  const [inviteData, setInviteData] = useState(null);

  useEffect(() => {
    const processInvite = async () => {
      try {
        // Step 1: Verify invite exists
        const res = await api.get(`/team/invite/${token}`);
        setInviteData(res.data);

        // Step 2: Accept invite automatically
        await api.post(`/team/invite/accept/${token}`);
        setStatus("success");

      } catch (err) {
        console.error("Accept invite error:", err.response?.data || err.message);

        // Handle backend responses
        if (err.response) {
          const msg = err.response.data.message;
          if (msg === "Invite expired") setStatus("expired");
          else if (msg === "Invite already accepted") setStatus("accepted");
          else setStatus("error");
        } else {
          setStatus("error");
        }
      }
    };

    processInvite();
  }, [token]);

  if (status === "loading") return <div>Processing your invite...</div>;
  if (status === "error") return <div>❌ Invalid or failed invite.</div>;
  if (status === "expired") return <div>⏰ Invite has expired.</div>;
  if (status === "accepted") return <div>✅ Invite already accepted.</div>;

  // Success page
  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h2>🎉 Invite Accepted!</h2>
      <p>You are now part of the team.</p>
      <p>Email: {inviteData?.email}</p>
      <p>Role: {inviteData?.role}</p>
      <button onClick={() => navigate("/team")} style={{ marginTop: "1rem", padding: "0.5rem 1rem" }}>
        Go to Team
      </button>
    </div>
  );
};

export default AcceptInvite;

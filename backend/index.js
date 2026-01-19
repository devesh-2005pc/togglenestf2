const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// =========================
// MIDDLEWARE
// =========================

// Parse JSON
app.use(express.json());

// ✅ CORS (SAFE + WORKING FOR VERCEL)
app.use(
  cors({
    origin: "*", // 🔥 allow all for now (ok for submission)
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);

// =========================
// ROUTES
// =========================
const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");
const taskRoutes = require("./routes/taskRoutes");
const workspaceRoutes = require("./routes/workspaceRoutes");
const userRoutes = require("./routes/userRoutes");
const teamRoutes = require("./routes/teamRoutes");
const sprintRoutes = require("./routes/sprintRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/workspaces", workspaceRoutes);
app.use("/api/users", userRoutes);
app.use("/api/team", teamRoutes);
app.use("/api/sprints", sprintRoutes);
app.use("/api/dashboard", dashboardRoutes);

// =========================
// TEST ROUTES
// =========================
app.get("/api/test", (req, res) => {
  res.json({ msg: "API working 🚀" });
});

app.post("/api/test", (req, res) => {
  res.json({ msg: "POST test working 🚀" });
});

// =========================
// SERVER + DATABASE
// =========================
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () =>
      console.log(`🚀 Server running on port ${PORT}`)
    );
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });

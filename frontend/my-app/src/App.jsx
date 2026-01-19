import { Routes, Route, useLocation, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import WorkSpace from "./pages/WorkSpace";
import Sprints from "./pages/Sprints";
import Boards from "./pages/Boards";
import Analytics from "./pages/Analytics";
import TeamPage from "./pages/TeamPage";

import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
  const location = useLocation();

  // Hide Navbar & Footer on auth pages
  const hideNavbarFooterRoutes = ["/","/login", "/signup"];
  const shouldShowNavbarFooter = !hideNavbarFooterRoutes.includes(location.pathname);

  


  return (
    <>
      {shouldShowNavbarFooter && <Navbar />}

      <main>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/workspace"
            element={
              <ProtectedRoute>
                <WorkSpace />
              </ProtectedRoute>
            }
          />

          <Route
            path="/sprints"
            element={
              <ProtectedRoute>
                <Sprints />
              </ProtectedRoute>
            }
          />

          <Route
            path="/boards"
            element={
              <ProtectedRoute>
                <Boards />
              </ProtectedRoute>
            }
          />

          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            }
          />

          <Route
            path="/teampage"
            element={
              <ProtectedRoute>
                <TeamPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>

      {shouldShowNavbarFooter && <Footer />}
    </>
  );
}

export default App;

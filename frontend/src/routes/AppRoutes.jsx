import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import SplashScreen from "../pages/Splash/SplashScreen";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import DonorDashboard from "../pages/Donor/DonorDashboard";
import PatientDashboard from "../pages/Patient/PatientDashboard";
import HospitalDashboard from "../pages/Hospital/HospitalDashboard";
import AdminDashboard from "../pages/Admin/AdminDashboard";
import NotFound from "../pages/NotFound/NotFound";
import RoleSelection from "../pages/RoleSelection/RoleSelection";


// =========================================================
// CHECK LOGIN
// =========================================================

function isLoggedIn() {
  const user = localStorage.getItem("user");
  const token = localStorage.getItem("access_token");

  return Boolean(user && token);
}


// =========================================================
// GET ACTIVE ROLE
// =========================================================

function getActiveRole() {
  return localStorage.getItem("active_role");
}


// =========================================================
// PROTECTED ROUTE
// =========================================================

function ProtectedRoute({ children, allowedRole }) {

  // -----------------------------------------
  // Check authentication
  // -----------------------------------------

  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }


  // -----------------------------------------
  // Check role
  // -----------------------------------------

  const activeRole = getActiveRole();

  if (activeRole !== allowedRole) {

    return (
      <Navigate
        to="/select-role"
        replace
      />
    );
  }


  // -----------------------------------------
  // Access granted
  // -----------------------------------------

  return children;
}


// =========================================================
// APP ROUTES
// =========================================================

export default function AppRoutes() {

  return (
    <BrowserRouter>

      <Routes>

        {/* ======================================
            SPLASH
        ====================================== */}

        <Route
          path="/"
          element={<SplashScreen />}
        />


        {/* ======================================
            AUTH
        ====================================== */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/select-role"
          element={<RoleSelection />}
        />


        {/* ======================================
            DONOR
        ====================================== */}

        <Route
          path="/donor"
          element={
            <ProtectedRoute allowedRole="donor">
              <DonorDashboard />
            </ProtectedRoute>
          }
        />


        {/* ======================================
            PATIENT
        ====================================== */}

        <Route
          path="/patient"
          element={
            <ProtectedRoute allowedRole="patient">
              <PatientDashboard />
            </ProtectedRoute>
          }
        />


        {/* ======================================
            HOSPITAL - RESTRICTED
        ====================================== */}

        <Route
          path="/hospital"
          element={
            <ProtectedRoute allowedRole="hospital">
              <HospitalDashboard />
            </ProtectedRoute>
          }
        />


        {/* ======================================
            ADMIN - RESTRICTED
        ====================================== */}

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />


        {/* ======================================
            FALLBACK
        ====================================== */}

        <Route
          path="*"
          element={<NotFound />}
        />

      </Routes>

    </BrowserRouter>
  );
}
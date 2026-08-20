import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";

import Card from "../../components/ui/Card";
import logo from "../../assets/images/rapidred-logo.png";

const API_URL = "http://127.0.0.1:8000";

// Prototype-only access codes.
// IMPORTANT: For production, move these checks to FastAPI.
const HOSPITAL_SECRET_CODE = "RR-HOSPITAL-2026";
const ADMIN_SECRET_CODE = "RR-ADMIN-2026";

function RoleSelection() {
  const navigate = useNavigate();

  const [loadingRole, setLoadingRole] = useState(null);

  // Restricted-role modal
  const [restrictedRole, setRestrictedRole] = useState(null);
  const [secretCode, setSecretCode] = useState("");
  const [secretError, setSecretError] = useState("");

  // ==========================================
  // CHECK LOGIN
  // ==========================================

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("access_token");

    if (!storedUser || !token) {
      navigate("/login");
    }
  }, [navigate]);

  // ==========================================
  // GET REAL BACKEND USER ID
  // ==========================================

  const getUserId = () => {
    try {
      const storedUser = localStorage.getItem("user");

      if (!storedUser) {
        return null;
      }

      const user = JSON.parse(storedUser);

      const id = user.user_id ?? user.id;

      if (
        id === undefined ||
        id === null ||
        id === ""
      ) {
        return null;
      }

      const numericId = Number(id);

      return Number.isFinite(numericId)
        ? numericId
        : null;
    } catch (error) {
      console.error(
        "Failed to read user:",
        error
      );

      return null;
    }
  };

  // ==========================================
  // UPDATE ROLE + NAVIGATE
  // ==========================================

  const updateRoleAndNavigate = async (role) => {
    setLoadingRole(role);

    try {
      const storedUser =
        localStorage.getItem("user");

      if (!storedUser) {
        navigate("/login");
        return;
      }

      const userData = JSON.parse(storedUser);

      const userId =
        userData.user_id ?? userData.id;

      if (
        userId === undefined ||
        userId === null ||
        userId === ""
      ) {
        alert(
          "User ID not found. Please login again."
        );
        return;
      }

      const numericUserId = Number(userId);

      if (!Number.isFinite(numericUserId)) {
        alert(
          "Invalid user ID. Please login again."
        );
        return;
      }

      console.log(
        "================================"
      );

      console.log(
        "🔄 UPDATING USER ROLE"
      );

      console.log(
        "User ID:",
        numericUserId
      );

      console.log(
        "New role:",
        role
      );

      console.log(
        "================================"
      );

      // ======================================
      // UPDATE ROLE IN BACKEND
      // ======================================

      const response = await axios.put(
        `${API_URL}/auth/role/${numericUserId}`,
        null,
        {
          params: {
            role: role,
          },
        }
      );

      console.log(
        "✅ BACKEND ROLE UPDATED:",
        response.data
      );

      // ======================================
      // UPDATE LOCAL USER
      // ======================================

      const updatedUser = {
        ...userData,
        id: numericUserId,
        user_id: numericUserId,
        role: role,
      };

      localStorage.setItem(
        "user",
        JSON.stringify(updatedUser)
      );

      // ======================================
      // SAVE ACTIVE ROLE
      // ======================================

      localStorage.setItem(
        "active_role",
        role
      );

      // ======================================
      // NAVIGATION
      // ======================================

      if (role === "donor") {
        navigate("/donor");
      } else if (role === "patient") {
        navigate("/patient");
      } else if (role === "hospital") {
        navigate("/hospital");
      } else if (role === "admin") {
        navigate("/admin");
      }

    } catch (error) {
      console.error(
        "❌ ROLE UPDATE FAILED",
        error
      );

      console.error(
        "Status:",
        error.response?.status
      );

      console.error(
        "Server response:",
        error.response?.data
      );

      const detail =
        error.response?.data?.detail;

      if (typeof detail === "string") {
        alert(detail);
      } else if (
        error.response?.status === 422
      ) {
        alert(
          "Role update request is invalid. Check the user ID and role."
        );
      } else if (
        error.response?.status === 500
      ) {
        alert(
          "RapidRed server/database error. Check the FastAPI terminal."
        );
      } else if (error.request) {
        alert(
          "Cannot connect to RapidRed API. Make sure FastAPI is running on port 8000."
        );
      } else {
        alert(
          "Unable to update your role. Please try again."
        );
      }

    } finally {
      setLoadingRole(null);
    }
  };

  // ==========================================
  // NORMAL ROLE
  // ==========================================

  const selectRole = async (role) => {
    await updateRoleAndNavigate(role);
  };

  // ==========================================
  // OPEN RESTRICTED ROLE
  // ==========================================

  const openRestrictedRole = (role) => {
    setRestrictedRole(role);
    setSecretCode("");
    setSecretError("");
  };

  // ==========================================
  // CLOSE SECRET CODE MODAL
  // ==========================================

  const closeRestrictedRole = () => {
    if (loadingRole) {
      return;
    }

    setRestrictedRole(null);
    setSecretCode("");
    setSecretError("");
  };

  // ==========================================
  // VERIFY SECRET CODE
  // ==========================================

  const verifySecretCode = async () => {
    setSecretError("");

    if (!secretCode.trim()) {
      setSecretError(
        "Please enter the secret access code."
      );
      return;
    }

    const correctCode =
      restrictedRole === "hospital"
        ? HOSPITAL_SECRET_CODE
        : ADMIN_SECRET_CODE;

    if (secretCode.trim() !== correctCode) {
      setSecretError(
        restrictedRole === "hospital"
          ? "Invalid hospital access code."
          : "Invalid administrator access code."
      );
      return;
    }

    console.log(
      `🔐 ${restrictedRole} access verified`
    );

    // Close modal before navigation
    setRestrictedRole(null);
    setSecretCode("");
    setSecretError("");

    await updateRoleAndNavigate(
      restrictedRole
    );
  };

  // ==========================================
  // HANDLE ENTER KEY
  // ==========================================

  const handleSecretKeyDown = (event) => {
    if (event.key === "Enter") {
      verifySecretCode();
    }

    if (event.key === "Escape") {
      closeRestrictedRole();
    }
  };

  // ==========================================
  // LOGOUT
  // ==========================================

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("access_token");
    localStorage.removeItem("active_role");

    navigate("/login");
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 px-6 py-10">

      <div className="max-w-6xl mx-auto">

        {/* ======================================
            HEADER
        ====================================== */}

        <div className="flex justify-between items-center mb-10">

          <div className="flex items-center gap-3">

            <img
              src={logo}
              alt="RapidRed"
              className="w-16"
            />

            <div>

              <h1 className="text-2xl font-bold text-red-600">
                RapidRed
              </h1>

              <p className="text-sm text-gray-500">
                Emergency Blood Support
              </p>

            </div>

          </div>

          <button
            type="button"
            onClick={logout}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-900 transition"
          >
            Logout
          </button>

        </div>

        {/* ======================================
            WELCOME
        ====================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: 30,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.5,
          }}
          className="text-center mb-10"
        >

          <h2 className="text-4xl md:text-5xl font-bold text-gray-800">
            Choose your RapidRed role
          </h2>

          <p className="text-gray-500 mt-3 text-lg">
            Select how you want to use the platform.
          </p>

        </motion.div>

        {/* ======================================
            ROLE CARDS
        ====================================== */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* ====================================
              DONOR
          ==================================== */}

          <motion.div
            initial={{
              opacity: 0,
              x: -40,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 0.6,
            }}
          >

            <Card>

              <div className="text-center">

                <div className="w-24 h-24 mx-auto rounded-full bg-red-100 flex items-center justify-center text-5xl">
                  🩸
                </div>

                <h3 className="text-3xl font-bold text-gray-800 mt-6">
                  Donate Blood
                </h3>

                <p className="text-gray-500 mt-3">
                  Help save someone's life by becoming an available blood donor.
                </p>

                <div className="mt-6 space-y-2 text-left bg-red-50 rounded-xl p-5">

                  <p className="text-gray-700">
                    ✓ Complete eligibility screening
                  </p>

                  <p className="text-gray-700">
                    ✓ Go online when you are available
                  </p>

                  <p className="text-gray-700">
                    ✓ Receive nearby emergency requests
                  </p>

                  <p className="text-gray-700">
                    ✓ Help patients in critical situations
                  </p>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    selectRole("donor")
                  }
                  disabled={
                    loadingRole !== null
                  }
                  className="w-full mt-6 py-3 bg-red-600 text-white rounded-xl font-bold text-lg hover:bg-red-700 transition disabled:bg-gray-400"
                >

                  {loadingRole === "donor"
                    ? "Updating..."
                    : "Continue as Donor"}

                </button>

              </div>

            </Card>

          </motion.div>

          {/* ====================================
              PATIENT
          ==================================== */}

          <motion.div
            initial={{
              opacity: 0,
              x: 40,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 0.6,
            }}
          >

            <Card>

              <div className="text-center">

                <div className="w-24 h-24 mx-auto rounded-full bg-red-100 flex items-center justify-center text-5xl">
                  🚨
                </div>

                <h3 className="text-3xl font-bold text-gray-800 mt-6">
                  Request Blood
                </h3>

                <p className="text-gray-500 mt-3">
                  Find compatible blood donors quickly during an emergency.
                </p>

                <div className="mt-6 space-y-2 text-left bg-red-50 rounded-xl p-5">

                  <p className="text-gray-700">
                    ✓ Create an emergency blood request
                  </p>

                  <p className="text-gray-700">
                    ✓ Share hospital and location
                  </p>

                  <p className="text-gray-700">
                    ✓ Set request urgency
                  </p>

                  <p className="text-gray-700">
                    ✓ Track your blood request
                  </p>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    selectRole("patient")
                  }
                  disabled={
                    loadingRole !== null
                  }
                  className="w-full mt-6 py-3 bg-red-600 text-white rounded-xl font-bold text-lg hover:bg-red-700 transition disabled:bg-gray-400"
                >

                  {loadingRole === "patient"
                    ? "Updating..."
                    : "Continue as Patient"}

                </button>

              </div>

            </Card>

          </motion.div>

          {/* ====================================
              HOSPITAL
          ==================================== */}

          <motion.div
            initial={{
              opacity: 0,
              y: 40,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.6,
              delay: 0.1,
            }}
          >

            <Card>

              <div className="text-center">

                <div className="w-24 h-24 mx-auto rounded-full bg-red-100 flex items-center justify-center text-5xl">
                  🏥
                </div>

                <div className="flex items-center justify-center gap-2 mt-6">

                  <h3 className="text-3xl font-bold text-gray-800">
                    Hospital
                  </h3>

                  <span className="px-2.5 py-1 rounded-full bg-gray-800 text-white text-xs font-bold">
                    🔐 RESTRICTED
                  </span>

                </div>

                <p className="text-gray-500 mt-3">
                  Manage emergency blood requirements and hospital inventory.
                </p>

                <div className="mt-6 space-y-2 text-left bg-red-50 rounded-xl p-5">

                  <p className="text-gray-700">
                    ✓ Monitor emergency blood requests
                  </p>

                  <p className="text-gray-700">
                    ✓ Manage blood inventory
                  </p>

                  <p className="text-gray-700">
                    ✓ Monitor donor matches
                  </p>

                  <p className="text-gray-700">
                    ✓ Track critical blood requirements
                  </p>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    openRestrictedRole("hospital")
                  }
                  disabled={
                    loadingRole !== null
                  }
                  className="w-full mt-6 py-3 bg-gray-900 text-white rounded-xl font-bold text-lg hover:bg-black transition disabled:bg-gray-400"
                >
                  🔐 Hospital Access
                </button>

              </div>

            </Card>

          </motion.div>

          {/* ====================================
              ADMIN
          ==================================== */}

          <motion.div
            initial={{
              opacity: 0,
              y: 40,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.6,
              delay: 0.2,
            }}
          >

            <Card>

              <div className="text-center">

                <div className="w-24 h-24 mx-auto rounded-full bg-gray-100 flex items-center justify-center text-5xl">
                  🔐
                </div>

                <div className="flex items-center justify-center gap-2 mt-6">

                  <h3 className="text-3xl font-bold text-gray-800">
                    Administrator
                  </h3>

                  <span className="px-2.5 py-1 rounded-full bg-red-600 text-white text-xs font-bold">
                    🔒 SECURE
                  </span>

                </div>

                <p className="text-gray-500 mt-3">
                  Monitor and manage the RapidRed emergency network.
                </p>

                <div className="mt-6 space-y-2 text-left bg-gray-50 rounded-xl p-5">

                  <p className="text-gray-700">
                    ✓ Monitor emergency requests
                  </p>

                  <p className="text-gray-700">
                    ✓ Monitor donors and patients
                  </p>

                  <p className="text-gray-700">
                    ✓ Monitor connected hospitals
                  </p>

                  <p className="text-gray-700">
                    ✓ View system activity
                  </p>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    openRestrictedRole("admin")
                  }
                  disabled={
                    loadingRole !== null
                  }
                  className="w-full mt-6 py-3 bg-red-600 text-white rounded-xl font-bold text-lg hover:bg-red-700 transition disabled:bg-gray-400"
                >
                  🔐 Admin Access
                </button>

              </div>

            </Card>

          </motion.div>

        </div>

        {/* ======================================
            FOOTER
        ====================================== */}

        <div className="mt-10 text-center">

          <p className="text-gray-400 text-sm">
            Restricted roles require authorized access.
          </p>

        </div>

      </div>

      {/* ========================================
          SECRET CODE MODAL
      ======================================== */}

      {restrictedRole && (

        <div className="fixed inset-0 z-50 flex items-center justify-center px-5">

          {/* BACKDROP */}

          <div
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            onClick={closeRestrictedRole}
          />

          {/* MODAL */}

          <motion.div
            initial={{
              opacity: 0,
              scale: 0.95,
              y: 20,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            transition={{
              duration: 0.25,
            }}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-7"
          >

            {/* ICON */}

            <div className="w-16 h-16 mx-auto rounded-full bg-red-100 flex items-center justify-center text-3xl">
              {restrictedRole === "hospital"
                ? "🏥"
                : "🔐"}
            </div>

            {/* TITLE */}

            <h3 className="text-2xl font-bold text-center text-gray-900 mt-5">

              {restrictedRole === "hospital"
                ? "Hospital Access"
                : "Administrator Access"}

            </h3>

            <p className="text-center text-gray-500 text-sm mt-2">

              {restrictedRole === "hospital"
                ? "Enter the authorized hospital access code to continue."
                : "Enter the authorized administrator access code to continue."}

            </p>

            {/* INPUT */}

            <div className="mt-6">

              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Secret Access Code
              </label>

              <input
                type="password"
                value={secretCode}
                onChange={(event) => {
                  setSecretCode(
                    event.target.value
                  );
                  setSecretError("");
                }}
                onKeyDown={handleSecretKeyDown}
                placeholder="Enter secret code"
                autoFocus
                className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-red-600 focus:ring-2 focus:ring-red-200"
              />

            </div>

            {/* ERROR */}

            {secretError && (

              <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                ❌ {secretError}
              </div>

            )}

            {/* BUTTONS */}

            <div className="flex gap-3 mt-6">

              <button
                type="button"
                onClick={closeRestrictedRole}
                disabled={loadingRole !== null}
                className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={verifySecretCode}
                disabled={loadingRole !== null}
                className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition disabled:bg-gray-400"
              >

                {loadingRole === restrictedRole
                  ? "Verifying..."
                  : "Verify Access"}

              </button>

            </div>

            {/* SECURITY NOTE */}

            <p className="text-center text-xs text-gray-400 mt-5">
              🔒 Restricted RapidRed access
            </p>

          </motion.div>

        </div>

      )}

    </div>
  );
}

export default RoleSelection;
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = "http://127.0.0.1:8000";

function PatientDashboard() {
  const navigate = useNavigate();

  // =========================================================
  // USER
  // =========================================================

  const [user, setUser] = useState(null);

  // =========================================================
  // BLOOD REQUEST FORM
  // =========================================================

  const [formData, setFormData] = useState({
    blood_group: "",
    hospital: "",
    urgency: "",
    details: "",
    latitude: "",
    longitude: "",
  });

  // =========================================================
  // REQUESTS
  // =========================================================

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  // =========================================================
  // MESSAGES
  // =========================================================

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================================================
  // ACCEPTED DONOR
  // =========================================================

  const [acceptedDonors, setAcceptedDonors] = useState({});
  const [contactRequested, setContactRequested] = useState({});
  const [checkingDonors, setCheckingDonors] = useState({});

  // =========================================================
  // DONOR TRACKING
  // =========================================================

  const [trackingData, setTrackingData] = useState({});
  const [trackingLoading, setTrackingLoading] = useState({});
  const [trackingVisible, setTrackingVisible] = useState({});

  // =========================================================
  // REQUEST HISTORY
  // =========================================================

  const [historyOpen, setHistoryOpen] = useState(false);

  // =========================================================
  // LOAD USER
  // =========================================================

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("access_token");
    const activeRole = localStorage.getItem("active_role");

    if (!storedUser || !token) {
      navigate("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);

      console.log("================================");
      console.log("Logged-in user:", parsedUser);
      console.log("Active role:", activeRole);
      console.log("Patient ID:", parsedUser.id);
      console.log("================================");

      if (activeRole !== "patient") {
        navigate("/select-role");
        return;
      }

      setUser(parsedUser);

      setFormData((previous) => ({
        ...previous,
        blood_group: parsedUser.blood_group || "",
      }));

      loadRequests(parsedUser.id);
    } catch (err) {
      console.error("Invalid user data:", err);

      localStorage.removeItem("user");
      localStorage.removeItem("access_token");
      localStorage.removeItem("active_role");

      navigate("/login");
    }
  }, [navigate]);

  // =========================================================
  // LOAD PATIENT REQUESTS
  // =========================================================

  const loadRequests = async (patientId) => {
    if (!patientId) return;

    setLoadingRequests(true);

    try {
      const response = await axios.get(
        `${API_URL}/blood-requests/patient/${patientId}`,
        {
          timeout: 8000,
        }
      );

      console.log("Patient requests:", response.data);

      if (Array.isArray(response.data)) {
        const sortedRequests = [...response.data].sort(
          (a, b) => Number(b.id) - Number(a.id)
        );

        setRequests(sortedRequests);
      } else {
        setRequests([]);
      }
    } catch (err) {
      console.error(
        "Failed to load blood requests:",
        err.response?.data || err.message
      );

      if (err.response?.status === 404) {
        setRequests([]);
      }
    } finally {
      setLoadingRequests(false);
    }
  };

  // =========================================================
  // CURRENT / LATEST REQUEST
  // =========================================================

  const currentRequest =
    requests.length > 0 ? requests[0] : null;

  // =========================================================
  // CHECK ACCEPTED DONOR
  // =========================================================

  const checkAcceptedDonor = async (requestId) => {
    if (!requestId || !user?.id) {
      return;
    }

    if (checkingDonors[requestId]) {
      return;
    }

    setCheckingDonors((previous) => ({
      ...previous,
      [requestId]: true,
    }));

    try {
      console.log(
        `🔎 Checking accepted donor for request #${requestId}`
      );

      const response = await axios.get(
        `${API_URL}/donor-responses/request/${requestId}/accepted`,
        {
          params: {
            viewer_id: Number(user.id),
          },
          timeout: 8000,
        }
      );

      console.log(
        `🤝 Accepted donor for request #${requestId}:`,
        response.data
      );

      setAcceptedDonors((previous) => ({
        ...previous,
        [requestId]: response.data,
      }));
    } catch (err) {
      console.error(
        `Failed to check accepted donor for request #${requestId}:`,
        err.response?.data || err.message
      );

      // Do not destroy already-known accepted donor data
      setAcceptedDonors((previous) => {
        if (previous[requestId]?.donor) {
          return previous;
        }

        return {
          ...previous,
          [requestId]: {
            request_id: requestId,
            status: "waiting",
            donor: null,
          },
        };
      });
    } finally {
      setCheckingDonors((previous) => ({
        ...previous,
        [requestId]: false,
      }));
    }
  };

  // =========================================================
  // CHECK DONOR WHEN CURRENT REQUEST CHANGES
  // =========================================================

  useEffect(() => {
    if (!currentRequest || !user?.id) {
      return;
    }

    checkAcceptedDonor(currentRequest.id);
  }, [currentRequest?.id, user?.id]);

  // =========================================================
  // AUTO CHECK ACCEPTED DONOR
  // EVERY 10 SECONDS
  // =========================================================

  useEffect(() => {
    if (!currentRequest || !user?.id) {
      return;
    }

    const requestId = currentRequest.id;

    const interval = setInterval(() => {
      checkAcceptedDonor(requestId);
    }, 10000);

    return () => {
      clearInterval(interval);
    };
  }, [currentRequest?.id, user?.id]);

  // =========================================================
  // TRACK DONOR
  // =========================================================

  const trackDonor = async (
    requestId,
    showLoading = true
  ) => {
    if (!requestId) return;

    if (showLoading) {
      setTrackingLoading((previous) => ({
        ...previous,
        [requestId]: true,
      }));
    }

    try {
      console.log(
        `📍 Tracking donor for request #${requestId}`
      );

      const response = await axios.get(
        `${API_URL}/location/track/${requestId}`,
        {
          timeout: 8000,
        }
      );

      console.log(
        "📍 Donor tracking:",
        response.data
      );

      setTrackingData((previous) => ({
        ...previous,
        [requestId]: response.data,
      }));
    } catch (err) {
      console.error(
        "❌ Tracking failed:",
        err.response?.data || err.message
      );

      // Keep previous tracking data visible.
    } finally {
      if (showLoading) {
        setTrackingLoading((previous) => ({
          ...previous,
          [requestId]: false,
        }));
      }
    }
  };

  // =========================================================
  // AUTO TRACKING
  // EVERY 10 SECONDS
  // =========================================================

  useEffect(() => {
    if (!currentRequest?.id) {
      return;
    }

    const requestId = currentRequest.id;

    const donorData = acceptedDonors[requestId];

    if (
      donorData?.status !== "accepted" ||
      !donorData?.donor
    ) {
      return;
    }

    if (!trackingVisible[requestId]) {
      return;
    }

    const interval = setInterval(() => {
      trackDonor(requestId, false);
    }, 10000);

    return () => {
      clearInterval(interval);
    };
  }, [
    currentRequest?.id,
    acceptedDonors[currentRequest?.id]?.status,
    trackingVisible[currentRequest?.id],
  ]);

  // =========================================================
  // INPUT CHANGE
  // =========================================================

  const handleChange = (e) => {
    setFormData((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));

    setError("");
    setSuccess("");
  };

  // =========================================================
  // GET CURRENT LOCATION
  // =========================================================

  const getCurrentLocation = () => {
    setError("");
    setSuccess("");

    if (!navigator.geolocation) {
      setError(
        "Geolocation is not supported by your browser."
      );
      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude =
          position.coords.latitude;

        const longitude =
          position.coords.longitude;

        setFormData((previous) => ({
          ...previous,
          latitude: latitude.toString(),
          longitude: longitude.toString(),
        }));

        setLocationLoading(false);

        setSuccess(
          "Your current location has been detected."
        );
      },
      (err) => {
        console.error("Location error:", err);

        setLocationLoading(false);

        if (err.code === 1) {
          setError(
            "Location permission was denied. Please allow location access."
          );
        } else if (err.code === 2) {
          setError(
            "Your current location could not be determined."
          );
        } else if (err.code === 3) {
          setError(
            "Location request timed out. Please try again."
          );
        } else {
          setError(
            "Unable to get your current location."
          );
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
    );
  };

  // =========================================================
  // SUBMIT BLOOD REQUEST
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!user?.id) {
      setError(
        "User information is missing. Please login again."
      );

      navigate("/login");
      return;
    }

    if (!formData.blood_group) {
      setError(
        "Please select the required blood group."
      );
      return;
    }

    if (!formData.hospital.trim()) {
      setError(
        "Please enter the hospital name."
      );
      return;
    }

    if (!formData.urgency) {
      setError(
        "Please select the urgency."
      );
      return;
    }

    if (
      formData.latitude === "" ||
      formData.longitude === ""
    ) {
      setError(
        "Please get your current location before submitting the request."
      );
      return;
    }

    setLoading(true);

    try {
      const requestData = {
        patient_id: Number(user.id),
        blood_group: formData.blood_group,
        hospital: formData.hospital.trim(),
        urgency: formData.urgency,
        details: formData.details.trim(),
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
      };

      console.log(
        "🚨 Creating blood request:",
        requestData
      );

      const response = await axios.post(
        `${API_URL}/blood-requests/`,
        requestData,
        {
          timeout: 10000,
        }
      );

      console.log(
        "✅ Blood request created:",
        response.data
      );

      setSuccess(
        "Blood request created successfully! 🩸"
      );

      setAcceptedDonors({});
      setContactRequested({});
      setCheckingDonors({});
      setTrackingData({});
      setTrackingLoading({});
      setTrackingVisible({});

      setFormData({
        blood_group:
          user.blood_group || "",
        hospital: "",
        urgency: "",
        details: "",
        latitude: "",
        longitude: "",
      });

      await loadRequests(user.id);
    } catch (err) {
      console.error(
        "Blood request error:",
        err
      );

      if (err.response) {
        const detail =
          err.response.data?.detail;

        if (Array.isArray(detail)) {
          setError(
            detail
              .map(
                (item) =>
                  item?.msg ||
                  "Invalid request"
              )
              .join(", ")
          );
        } else if (
          typeof detail === "string"
        ) {
          setError(detail);
        } else {
          setError(
            `Server error: ${err.response.status}`
          );
        }
      } else if (err.request) {
        setError(
          "Cannot connect to RapidRed API. Make sure FastAPI is running on port 8000."
        );
      } else {
        setError(
          err.message ||
            "Failed to create blood request."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // SWITCH TO DONOR
  // =========================================================

  const switchToDonor = () => {
    localStorage.setItem(
      "active_role",
      "donor"
    );

    navigate("/donor");
  };

  // =========================================================
  // LOGOUT
  // =========================================================

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("access_token");
    localStorage.removeItem("active_role");

    navigate("/login");
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">
          Loading RapidRed...
        </p>
      </div>
    );
  }

  // =========================================================
  // CURRENT DONOR DATA
  // =========================================================

  const currentDonorData =
    currentRequest
      ? acceptedDonors[currentRequest.id]
      : null;

  const currentDonorAccepted =
    currentDonorData?.status === "accepted" &&
    !!currentDonorData?.donor;

  // =========================================================
  // DASHBOARD
  // =========================================================

  return (
    <div className="min-h-screen bg-gray-50">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="bg-white shadow-sm px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">

          <div>
            <h1 className="text-2xl font-bold text-red-600">
              RapidRed 🩸
            </h1>

            <p className="text-sm text-gray-500">
              Patient Dashboard
            </p>
          </div>

          <div className="flex items-center gap-3">

            <button
              type="button"
              onClick={switchToDonor}
              className="px-4 py-2 border border-red-600 text-red-600 rounded-lg font-semibold hover:bg-red-50"
            >
              🩸 Donate Blood
            </button>

            <button
              type="button"
              onClick={logout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700"
            >
              Logout
            </button>

          </div>

        </div>
      </header>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="max-w-6xl mx-auto px-6 py-8">

        {/* WELCOME */}

        <div className="bg-gradient-to-r from-red-600 to-red-500 rounded-2xl p-6 text-white shadow-lg">

          <h2 className="text-3xl font-bold">
            Welcome, {user.name}! ❤️
          </h2>

          <p className="mt-2 text-red-100">
            Find the blood you need quickly.
          </p>

        </div>

        {/* PROFILE CARDS */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <p className="text-gray-500 text-sm">
              Blood Group
            </p>

            <p className="text-4xl font-bold text-red-600 mt-2">
              {user.blood_group || "Not set"}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <p className="text-gray-500 text-sm">
              Current Mode
            </p>

            <p className="text-2xl font-bold text-gray-800 mt-2">
              Patient
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <p className="text-gray-500 text-sm">
              Emergency Support
            </p>

            <p className="text-green-600 font-semibold mt-2">
              Available
            </p>
          </div>

        </div>

        {/* ALERTS */}

        {error && (
          <div className="mt-6 p-4 rounded-xl bg-red-100 border border-red-200 text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-6 p-4 rounded-xl bg-green-100 border border-green-200 text-green-700">
            {success}
          </div>
        )}

        {/* ===================================================
            BLOOD REQUEST FORM
        =================================================== */}

        <div className="mt-8 bg-white rounded-2xl shadow-sm p-6">

          <h2 className="text-2xl font-bold text-gray-800">
            🩸 Request Emergency Blood
          </h2>

          <p className="text-gray-500 mt-1">
            Enter the details below to request compatible blood donors.
          </p>

          <form
            onSubmit={handleSubmit}
            className="space-y-6 mt-6"
          >

            {/* BLOOD GROUP */}

            <div>
              <label className="font-semibold text-gray-700">
                Blood Group Required
              </label>

              <select
                name="blood_group"
                value={formData.blood_group}
                onChange={handleChange}
                className="w-full mt-2 border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-red-600 focus:ring-2 focus:ring-red-200"
              >
                <option value="">
                  Select Blood Group
                </option>

                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>

            {/* HOSPITAL */}

            <div>
              <label className="font-semibold text-gray-700">
                Hospital
              </label>

              <input
                type="text"
                name="hospital"
                value={formData.hospital}
                onChange={handleChange}
                placeholder="Enter hospital name"
                className="w-full mt-2 border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-red-600 focus:ring-2 focus:ring-red-200"
              />
            </div>

            {/* URGENCY */}

            <div>
              <label className="font-semibold text-gray-700">
                Urgency
              </label>

              <select
                name="urgency"
                value={formData.urgency}
                onChange={handleChange}
                className="w-full mt-2 border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-red-600 focus:ring-2 focus:ring-red-200"
              >
                <option value="">
                  Select urgency
                </option>

                <option value="critical">
                  🔴 Critical — Emergency
                </option>

                <option value="medium">
                  🟠 Medium
                </option>

                <option value="planned">
                  🟢 Planned
                </option>
              </select>
            </div>

            {/* DETAILS */}

            <div>
              <label className="font-semibold text-gray-700">
                Additional Details
              </label>

              <textarea
                name="details"
                value={formData.details}
                onChange={handleChange}
                rows="4"
                placeholder="Describe any additional information..."
                className="w-full mt-2 border border-gray-300 rounded-xl px-4 py-3 outline-none resize-none focus:border-red-600 focus:ring-2 focus:ring-red-200"
              />
            </div>

            {/* LOCATION */}

            <div className="border border-gray-200 rounded-xl p-5">

              <h3 className="font-bold text-gray-800">
                📍 Your Current Location
              </h3>

              {formData.latitude &&
              formData.longitude ? (
                <div className="mt-3 p-3 bg-green-50 rounded-lg">

                  <p className="text-sm text-green-700">
                    ✓ Location detected
                  </p>

                  <p className="text-xs text-gray-500 mt-1">
                    Latitude: {formData.latitude}
                  </p>

                  <p className="text-xs text-gray-500">
                    Longitude: {formData.longitude}
                  </p>

                </div>
              ) : (
                <p className="text-sm text-gray-500 mt-2">
                  Your location is needed to find nearby donors.
                </p>
              )}

              <button
                type="button"
                onClick={getCurrentLocation}
                disabled={locationLoading}
                className="mt-4 px-5 py-3 border border-red-600 text-red-600 rounded-xl font-semibold hover:bg-red-50 disabled:opacity-50"
              >
                {locationLoading
                  ? "Getting Location..."
                  : "📍 Get My Current Location"}
              </button>

            </div>

            {/* SUBMIT */}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-red-600 text-white rounded-xl font-bold text-lg hover:bg-red-700 disabled:bg-gray-400 transition"
            >
              {loading
                ? "Submitting Request..."
                : "🚨 Submit Blood Request"}
            </button>

          </form>
        </div>

        {/* ===================================================
            CURRENT BLOOD REQUEST
        =================================================== */}

        <div className="mt-8 bg-white rounded-2xl shadow-sm p-6">

          <div className="flex items-center justify-between">

            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                📋 My Blood Request
              </h2>

              <p className="text-gray-500 mt-1">
                Track your latest emergency blood request.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                if (user?.id) {
                  loadRequests(user.id);
                }
              }}
              disabled={loadingRequests}
              className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              {loadingRequests
                ? "Loading..."
                : "↻ Refresh"}
            </button>

          </div>

          {/* LOADING */}

          {loadingRequests && (
            <div className="text-center py-10">
              <p className="text-gray-500">
                Loading latest request...
              </p>
            </div>
          )}

          {/* EMPTY */}

          {!loadingRequests && !currentRequest && (
            <div className="text-center py-10">

              <div className="text-5xl">
                🩸
              </div>

              <h3 className="text-lg font-semibold text-gray-700 mt-4">
                You haven't created any blood requests yet.
              </h3>

              <p className="text-gray-500 mt-1">
                Create an emergency request above.
              </p>

            </div>
          )}

          {/* CURRENT REQUEST */}

          {!loadingRequests && currentRequest && (

            <div className="border border-gray-200 rounded-xl p-5 mt-6">

              {/* REQUEST INFORMATION */}

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                <div>

                  <div className="flex items-center gap-3">

                    <span className="text-2xl font-bold text-red-600">
                      {currentRequest.blood_group}
                    </span>

                    <span
                      className={
                        currentRequest.urgency === "critical"
                          ? "px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm font-semibold"
                          : currentRequest.urgency === "medium"
                          ? "px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-sm font-semibold"
                          : "px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-semibold"
                      }
                    >
                      {currentRequest.urgency}
                    </span>

                  </div>

                  <p className="text-gray-700 mt-2">
                    🏥 {currentRequest.hospital}
                  </p>

                  {currentRequest.details && (
                    <p className="text-gray-500 text-sm mt-1">
                      {currentRequest.details}
                    </p>
                  )}

                </div>

                <div className="text-left md:text-right">

                  <p className="text-sm text-gray-500">
                    Request Status
                  </p>

                  <p className="font-bold text-blue-600 capitalize">
                    {currentDonorAccepted
                      ? "accepted"
                      : currentRequest.status || "active"}
                  </p>

                </div>

              </div>

              {/* DONOR STATUS */}

              <div className="mt-5">

                {/* CHECKING */}

                {checkingDonors[currentRequest.id] &&
                !currentDonorData?.donor ? (

                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">

                    <p className="text-gray-500 text-sm">
                      🔎 Checking for available donors...
                    </p>

                  </div>

                ) : currentDonorAccepted ? (

                  /* =================================================
                     ACCEPTED DONOR
                  ================================================= */

                  <div className="p-5 rounded-xl bg-green-50 border border-green-300">

                    {/* HEADER */}

                    <div className="flex items-center gap-3">

                      <div className="text-3xl">
                        🟢
                      </div>

                      <div>

                        <h3 className="text-lg font-bold text-green-800">
                          Donor Found!
                        </h3>

                        <p className="text-green-700 text-sm">
                          A compatible donor has accepted your request.
                        </p>

                      </div>

                    </div>

                    {/* DONOR DETAILS */}

                    <div className="mt-4 bg-white rounded-xl p-4 border border-green-200">

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                        {/* DONOR NAME */}

                        <div>

                          <p className="text-xs text-gray-500">
                            Donor Name
                          </p>

                          <p className="font-bold text-gray-800">
                            {currentDonorData.donor.name ||
                              "Anonymous Donor"}
                          </p>

                        </div>

                        {/* BLOOD GROUP */}

                        <div>

                          <p className="text-xs text-gray-500">
                            Blood Group
                          </p>

                          <p className="font-bold text-red-600">
                            {currentDonorData.donor.blood_group ||
                              "N/A"}
                          </p>

                        </div>

                        {/* CONTACT */}

                        <div>

                          <p className="text-xs text-gray-500">
                            Contact
                          </p>

                          {currentDonorData.donor.phone ? (

                            contactRequested[currentRequest.id] ? (

                              <a
                                href={`tel:${currentDonorData.donor.phone}`}
                                className="font-bold text-green-600 hover:underline"
                              >
                                📞 {currentDonorData.donor.phone}
                              </a>

                            ) : (

                              <div>

                                <p className="text-sm font-semibold text-gray-700">
                                  🔐 Contact Protected
                                </p>

                                <p className="text-xs text-gray-500 mt-1">
                                  Donor contact information is protected.
                                </p>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setContactRequested(
                                      (previous) => ({
                                        ...previous,
                                        [currentRequest.id]: true,
                                      })
                                    );
                                  }}
                                  className="mt-2 px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition"
                                >
                                  🔓 Reveal Contact
                                </button>

                              </div>

                            )

                          ) : (

                            <p className="text-gray-500">
                              Contact unavailable
                            </p>

                          )}

                        </div>

                      </div>

                    </div>

                    {/* =================================================
                        DONOR TRACKER
                    ================================================= */}

                    <div className="mt-4">

                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">

                        <div className="flex items-center justify-between gap-4">

                          <div>

                            <h3 className="text-lg font-bold text-blue-800">
                              🚚 Track Donor
                            </h3>

                            <p className="text-sm text-blue-700 mt-1">
                              Track the accepted donor's location.
                            </p>

                          </div>

                          <button
                            type="button"
                            onClick={() => {

                              const requestId =
                                currentRequest.id;

                              const newVisible =
                                !trackingVisible[requestId];

                              setTrackingVisible(
                                (previous) => ({
                                  ...previous,
                                  [requestId]: newVisible,
                                })
                              );

                              if (newVisible) {
                                trackDonor(
                                  requestId,
                                  true
                                );
                              }

                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                          >
                            {trackingVisible[
                              currentRequest.id
                            ]
                              ? "Hide Tracking"
                              : "📍 Track Donor"}
                          </button>

                        </div>

                        {/* TRACKING CONTENT */}

                        {trackingVisible[
                          currentRequest.id
                        ] && (

                          <div className="mt-5">

                            {trackingLoading[
                              currentRequest.id
                            ] &&
                            !trackingData[
                              currentRequest.id
                            ] ? (

                              <div className="bg-white rounded-xl p-5 text-center">

                                <p className="text-gray-500">
                                  📍 Getting donor location...
                                </p>

                              </div>

                            ) : trackingData[
                                currentRequest.id
                              ] ? (

                              <div className="bg-white rounded-xl border border-blue-200 p-5">

                                {/* STATUS */}

                                <div className="flex items-center gap-3 mb-5">

                                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                    🟢
                                  </div>

                                  <div>

                                    <p className="font-bold text-green-800">
                                      Donor is on the way
                                    </p>

                                    <p className="text-sm text-gray-500">
                                      Location updates automatically.
                                    </p>

                                  </div>

                                </div>

                                {/* DISTANCE + ETA */}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                  <div className="bg-blue-50 rounded-xl p-4">

                                    <p className="text-xs text-gray-500">
                                      Distance
                                    </p>

                                    <p className="text-2xl font-bold text-blue-700 mt-1">
                                      {trackingData[
                                        currentRequest.id
                                      ]?.distance_km ?? "--"}{" "}
                                      km
                                    </p>

                                  </div>

                                  <div className="bg-green-50 rounded-xl p-4">

                                    <p className="text-xs text-gray-500">
                                      Estimated Arrival
                                    </p>

                                    <p className="text-2xl font-bold text-green-700 mt-1">
                                      {trackingData[
                                        currentRequest.id
                                      ]?.estimated_minutes ?? "--"}{" "}
                                      min
                                    </p>

                                  </div>

                                </div>

                                {/* DONOR LOCATION */}

                                {trackingData[
                                  currentRequest.id
                                ]?.donor_location && (

                                  <div className="mt-4 bg-gray-50 rounded-xl p-4">

                                    <p className="font-semibold text-gray-700">
                                      📍 Donor Location
                                    </p>

                                    <p className="text-sm text-gray-500 mt-2">
                                      Latitude:{" "}
                                      {
                                        trackingData[
                                          currentRequest.id
                                        ].donor_location.latitude
                                      }
                                    </p>

                                    <p className="text-sm text-gray-500">
                                      Longitude:{" "}
                                      {
                                        trackingData[
                                          currentRequest.id
                                        ].donor_location.longitude
                                      }
                                    </p>

                                  </div>

                                )}

                                <p className="text-xs text-gray-400 mt-3 text-center">
                                  Auto-refreshing every 10 seconds
                                </p>

                                {/* MANUAL REFRESH */}

                                <button
                                  type="button"
                                  onClick={() =>
                                    trackDonor(
                                      currentRequest.id,
                                      true
                                    )
                                  }
                                  disabled={
                                    trackingLoading[
                                      currentRequest.id
                                    ]
                                  }
                                  className="w-full mt-4 py-3 border border-blue-600 text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition disabled:opacity-50"
                                >
                                  {trackingLoading[
                                    currentRequest.id
                                  ]
                                    ? "Updating Location..."
                                    : "🔄 Refresh Donor Location"}
                                </button>

                              </div>

                            ) : (

                              <div className="bg-white rounded-xl p-5 border border-gray-200">

                                <p className="text-gray-500">
                                  Unable to get the donor's current location.
                                </p>

                                <button
                                  type="button"
                                  onClick={() =>
                                    trackDonor(
                                      currentRequest.id,
                                      true
                                    )
                                  }
                                  className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold"
                                >
                                  Try Again
                                </button>

                              </div>

                            )}

                          </div>

                        )}

                      </div>

                    </div>

                    {/* ACCEPTED MESSAGE */}

                    <div className="mt-4 p-3 rounded-lg bg-green-100">

                      <p className="text-sm text-green-800 font-semibold">
                        ❤️ Your donor has accepted the request.
                      </p>

                      <p className="text-xs text-green-700 mt-1">
                        Please coordinate with the donor and hospital.
                      </p>

                    </div>

                  </div>

                ) : (

                  /* =================================================
                     WAITING FOR DONOR
                  ================================================= */

                  <div className="p-4 rounded-xl bg-yellow-50 border border-yellow-200">

                    <div className="flex items-center justify-between gap-4">

                      <div>

                        <p className="font-semibold text-yellow-800">
                          🟡 Waiting for donor
                        </p>

                        <p className="text-sm text-yellow-700 mt-1">
                          We are looking for a compatible donor near you.
                        </p>

                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          checkAcceptedDonor(
                            currentRequest.id
                          )
                        }
                        disabled={
                          checkingDonors[
                            currentRequest.id
                          ]
                        }
                        className="px-4 py-2 bg-white border border-yellow-400 text-yellow-700 rounded-lg font-semibold hover:bg-yellow-100 disabled:opacity-50"
                      >
                        {checkingDonors[
                          currentRequest.id
                        ]
                          ? "Checking..."
                          : "↻ Check"}
                      </button>

                    </div>

                  </div>

                )}

              </div>

            </div>

          )}

        </div>

        {/* ===================================================
            REQUEST HISTORY
        =================================================== */}

        {!loadingRequests &&
          requests.length > 1 && (

            <div className="mt-8 bg-white rounded-2xl shadow-sm p-6">

              <button
                type="button"
                onClick={() =>
                  setHistoryOpen((value) => !value)
                }
                className="w-full flex items-center justify-between text-left"
              >

                <div>

                  <h2 className="text-2xl font-bold text-gray-800">
                    📚 Request History
                  </h2>

                  <p className="text-gray-500 mt-1">
                    {requests.length - 1} older request
                    {requests.length - 1 === 1
                      ? ""
                      : "s"}
                  </p>

                </div>

                <span className="text-gray-500 text-xl">
                  {historyOpen ? "▲" : "▼"}
                </span>

              </button>

              {historyOpen && (

                <div className="mt-5 space-y-3">

                  {requests
                    .slice(1)
                    .map((request) => {

                      const status = String(
                        request.status || "active"
                      ).toLowerCase();

                      const completed = [
                        "completed",
                        "fulfilled",
                        "donated",
                      ].includes(status);

                      const expired = [
                        "expired",
                        "cancelled",
                        "canceled",
                      ].includes(status);

                      const accepted =
                        status === "accepted";

                      const text = completed
                        ? "Completed"
                        : expired
                        ? "Expired"
                        : accepted
                        ? "Accepted"
                        : "Waiting for Donor";

                      const cls = completed
                        ? "bg-green-100 text-green-700"
                        : expired
                        ? "bg-gray-100 text-gray-600"
                        : accepted
                        ? "bg-blue-100 text-blue-700"
                        : "bg-yellow-100 text-yellow-700";

                      return (

                        <div
                          key={request.id}
                          className="border border-gray-200 rounded-xl p-4"
                        >

                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">

                            <div>

                              <div className="flex items-center gap-2 flex-wrap">

                                <span className="font-bold text-red-600">
                                  🩸 {request.blood_group}
                                </span>

                                <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold capitalize">
                                  {request.urgency || "normal"}
                                </span>

                              </div>

                              <p className="text-sm text-gray-700 mt-2">
                                🏥{" "}
                                {request.hospital ||
                                  "Hospital not specified"}
                              </p>

                              <p className="text-xs text-gray-400 mt-1">
                                Request #{request.id}
                              </p>

                            </div>

                            <span
                              className={`px-3 py-1.5 rounded-full text-xs font-bold ${cls}`}
                            >
                              {accepted
                                ? "❤️ "
                                : completed
                                ? "✓ "
                                : ""}
                              {text}
                            </span>

                          </div>

                          {accepted && (
                            <div className="mt-3 p-3 rounded-lg bg-blue-50 border border-blue-100">

                              <p className="text-sm text-blue-700 font-semibold">
                                ❤️ This request was accepted by a donor.
                              </p>

                              <p className="text-xs text-blue-600 mt-1">
                                Your latest accepted request is shown above with live donor tracking.
                              </p>

                            </div>
                          )}

                          {completed && (
                            <div className="mt-3 p-3 rounded-lg bg-green-50 border border-green-100">

                              <p className="text-sm text-green-700 font-semibold">
                                ✅ Donation request completed.
                              </p>

                            </div>
                          )}

                          {expired && (
                            <div className="mt-3 p-3 rounded-lg bg-gray-50 border border-gray-200">

                              <p className="text-sm text-gray-600">
                                This request is no longer active.
                              </p>

                            </div>
                          )}

                          {!accepted &&
                            !completed &&
                            !expired && (

                              <div className="mt-3 p-3 rounded-lg bg-yellow-50 border border-yellow-100">

                                <p className="text-sm text-yellow-700">
                                  🟡 No donor has accepted this request yet.
                                </p>

                              </div>

                            )}

                        </div>

                      );
                    })}

                </div>

              )}

            </div>

          )}

      </main>

    </div>
  );
}

export default PatientDashboard;
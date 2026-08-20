import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = "http://127.0.0.1:8000";

// Get the real backend user ID safely.
// Supports both `id` and `user_id` returned by the API.
const getUserId = (userData) => {
  if (!userData) return null;

  const id = userData.user_id ?? userData.id;

  if (id === undefined || id === null || id === "") {
    return null;
  }

  const numericId = Number(id);
  return Number.isFinite(numericId) ? numericId : null;
};

function DonorDashboard() {
  const navigate = useNavigate();

  // ==========================================
  // STATE
  // ==========================================

  const [user, setUser] = useState(null);

  const [quickAction, setQuickAction] = useState(null);

  const [available, setAvailable] = useState(false);

  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
  });

  const [locationLoading, setLocationLoading] = useState(false);

  const [eligibilityResult, setEligibilityResult] =
    useState(null);

  const [savedEligibilityResult, setSavedEligibilityResult] =
    useState(null);

  const [showEligibility, setShowEligibility] =
    useState(false);

  const [checkingEligibility, setCheckingEligibility] =
    useState(false);

  const [step, setStep] = useState(1);

  const [matchedRequests, setMatchedRequests] =
    useState([]);

  // Keeps accepted requests visible after the donor goes offline.
  const [acceptedRequests, setAcceptedRequests] =
    useState([]);

  const [patientContacts, setPatientContacts] = useState({});
  const [contactLoading, setContactLoading] = useState({});
  

  const [matchingLoading, setMatchingLoading] =
    useState(false);

  const [respondingRequestId, setRespondingRequestId] =
    useState(null);

  const [eligibility, setEligibility] = useState({
    age: "",
    weight: "",
    hemoglobin: "",
    healthy: "",
    illness: "",
    recentDonation: "",
    majorSurgery: "",
    tattooPiercing: "",
    medication: "",
    alcohol: "",
    pregnancy: "",
    medicalCondition: "",
  });

  // ==========================================
  // LOAD USER
  // ==========================================

  useEffect(() => {
    const storedUser =
      localStorage.getItem("user");

    const token =
      localStorage.getItem("access_token");

    const activeRole =
      localStorage.getItem("active_role");

    if (!storedUser || !token) {
      navigate("/login");
      return;
    }

    try {
      const parsedUser =
        JSON.parse(storedUser);

      console.log(
        "Logged-in user:",
        parsedUser
      );

      console.log(
        "Active role:",
        activeRole
      );

      if (String(activeRole || "").toLowerCase() !== "donor") {
        navigate("/select-role");
        return;
      }

      const donorUserId = getUserId(parsedUser);

      if (!donorUserId) {
        console.error(
          "❌ Could not determine backend user ID:",
          parsedUser
        );

        alert(
          "Unable to determine your user account. Please login again."
        );

        navigate("/login");
        return;
      }

      // Normalize the user object so the whole dashboard consistently
      // uses the same backend ID.
      const normalizedUser = {
        ...parsedUser,
        id: donorUserId,
        user_id: donorUserId,
      };

      console.log(
        "✅ NORMALIZED DONOR:",
        normalizedUser
      );

      console.log(
        "🆔 ACTUAL DONOR ID:",
        donorUserId
      );

      setUser(normalizedUser);

      loadSavedEligibility(
        donorUserId
      );

      loadAvailability(
        donorUserId
      );

      loadSavedLocation(
        donorUserId
      );

    } catch (error) {
      console.error(
        "Invalid user:",
        error
      );

      localStorage.removeItem("user");
      localStorage.removeItem(
        "access_token"
      );
      localStorage.removeItem(
        "active_role"
      );

      navigate("/login");
    }
  }, [navigate]);

  // ==========================================
  // LOAD ELIGIBILITY
  // ==========================================

  const loadSavedEligibility = async (
    userId
  ) => {
    try {
      const response =
        await axios.get(
          `${API_URL}/eligibility/${userId}`
        );

      console.log(
        "Saved eligibility:",
        response.data
      );

      const result = String(
        response.data?.result || ""
      )
        .toLowerCase()
        .trim();

      if (result) {
        setSavedEligibilityResult(result);
        setEligibilityResult(result);
      }

    } catch (error) {
      if (
        error.response?.status !== 404
      ) {
        console.error(
          "Eligibility loading error:",
          error
        );
      }

      setSavedEligibilityResult(null);
    }
  };

  // ==========================================
  // LOAD AVAILABILITY
  // ==========================================

  const loadAvailability = async (
    userId
  ) => {
    try {
      const response =
        await axios.get(
          `${API_URL}/availability/${userId}`
        );

      console.log(
        "Saved availability:",
        response.data
      );

      setAvailable(
        Boolean(
          response.data?.is_available
        )
      );

    } catch (error) {
      if (
        error.response?.status !== 404
      ) {
        console.error(
          "Availability loading error:",
          error
        );
      }

      setAvailable(false);
    }
  };

  // ==========================================
  // LOAD SAVED LOCATION
  // ==========================================

  const loadSavedLocation = async (
    userId
  ) => {
    try {
      const response =
        await axios.get(
          `${API_URL}/location/${userId}`
        );

      console.log(
        "Saved location:",
        response.data
      );

      setLocation({
        latitude:
          response.data?.latitude ??
          null,

        longitude:
          response.data?.longitude ??
          null,
      });

    } catch (error) {
      if (
        error.response?.status !== 404
      ) {
        console.error(
          "Location loading error:",
          error
        );
      }

      setLocation({
        latitude: null,
        longitude: null,
      });
    }
  };

  // ==========================================
  // UPDATE GPS LOCATION
  // ==========================================

  const updateDonorLocation = () => {
    return new Promise(
      (resolve, reject) => {

        if (!getUserId(user)) {
          reject(
            new Error(
              "User information is missing. Please login again."
            )
          );
          return;
        }

        if (!navigator.geolocation) {
          reject(
            new Error(
              "Geolocation is not supported by your browser."
            )
          );
          return;
        }

        setLocationLoading(true);

        navigator.geolocation.getCurrentPosition(
          async (position) => {

            const latitude =
              position.coords.latitude;

            const longitude =
              position.coords.longitude;

            console.log(
              "Donor GPS location:",
              {
                latitude,
                longitude,
              }
            );

            try {
              const response =
                await axios.post(
                  `${API_URL}/location/update`,
                  {
                    user_id:
                      getUserId(user),

                    latitude,
                    longitude,
                  }
                );

              console.log(
                "Location saved:",
                response.data
              );

              setLocation({
                latitude,
                longitude,
              });

              resolve(
                response.data
              );

            } catch (error) {
              console.error(
                "Location update error:",
                error
              );

              reject(
                new Error(
                  error.response?.data?.detail ||
                    "Failed to save your location."
                )
              );

            } finally {
              setLocationLoading(false);
            }
          },

          (error) => {
            console.error(
              "GPS error:",
              error
            );

            setLocationLoading(false);

            if (error.code === 1) {
              reject(
                new Error(
                  "Location permission was denied. Please allow location access."
                )
              );

            } else if (error.code === 2) {
              reject(
                new Error(
                  "Your current location could not be determined."
                )
              );

            } else if (error.code === 3) {
              reject(
                new Error(
                  "Location request timed out. Please try again."
                )
              );

            } else {
              reject(
                new Error(
                  "Unable to get your current location."
                )
              );
            }
          },

          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          }
        );
      }
    );
  };

  // ==========================================
  // MANUAL LOCATION UPDATE
  // ==========================================

  const handleLocationUpdate = async () => {
    try {
      await updateDonorLocation();

      alert(
        "📍 Your location has been updated successfully!"
      );

      if (available) {
        setTimeout(() => {
          loadMatchedRequests();
        }, 300);
      }

    } catch (error) {
      alert(
        error.message ||
          "Unable to update your location."
      );
    }
  };

  // ==========================================
  // ELIGIBILITY CHANGE
  // ==========================================

  const handleEligibilityChange = (e) => {
    setEligibility(
      (previous) => ({
        ...previous,
        [e.target.name]:
          e.target.value,
      })
    );
  };

  // ==========================================
  // RESET ELIGIBILITY
  // ==========================================

  const resetEligibility = () => {
    setStep(1);

    setEligibilityResult(null);

    setEligibility({
      age: "",
      weight: "",
      hemoglobin: "",
      healthy: "",
      illness: "",
      recentDonation: "",
      majorSurgery: "",
      tattooPiercing: "",
      medication: "",
      alcohol: "",
      pregnancy: "",
      medicalCondition: "",
    });
  };

  const openEligibility = () => {
    resetEligibility();
    setShowEligibility(true);
  };

  const closeEligibility = () => {
    setShowEligibility(false);
    resetEligibility();
  };

  // ==========================================
  // CHECK ELIGIBILITY
  // ==========================================

  const calculateEligibility = async () => {
    const requiredFields = [
      "age",
      "weight",
      "hemoglobin",
      "healthy",
      "illness",
      "recentDonation",
      "majorSurgery",
      "tattooPiercing",
      "medication",
      "alcohol",
      "pregnancy",
      "medicalCondition",
    ];

    const missing =
      requiredFields.some(
        (field) =>
          eligibility[field] === ""
      );

    if (missing) {
      alert(
        "Please answer all eligibility questions."
      );
      return;
    }

    if (!getUserId(user)) {
      alert(
        "User information is missing."
      );
      navigate("/login");
      return;
    }

    setCheckingEligibility(true);

    try {
      const response =
        await axios.post(
          `${API_URL}/eligibility/check`,
          {
            user_id:
              getUserId(user),

            role: "donor",

            age:
              Number(
                eligibility.age
              ),

            weight:
              Number(
                eligibility.weight
              ),

            hemoglobin:
              Number(
                eligibility.hemoglobin
              ),

            healthy:
              eligibility.healthy ===
              "yes",

            illness:
              eligibility.illness ===
              "yes",

            recent_donation:
              eligibility.recentDonation ===
              "yes",

            major_surgery:
              eligibility.majorSurgery ===
              "yes",

            tattoo_piercing:
              eligibility.tattooPiercing ===
              "yes",

            medication:
              eligibility.medication ===
              "yes",

            alcohol:
              eligibility.alcohol ===
              "yes",

            pregnancy:
              eligibility.pregnancy ===
              "yes",

            medical_condition:
              eligibility.medicalCondition ===
              "yes",
          }
        );

      console.log(
        "Eligibility response:",
        response.data
      );

      const result = String(
        response.data?.result || ""
      )
        .toLowerCase()
        .trim();

      if (!result) {
        alert(
          "Backend did not return an eligibility result."
        );
        return;
      }

      setEligibilityResult(result);
      setSavedEligibilityResult(
        result
      );

    } catch (error) {
      console.error(
        "Eligibility error:",
        error
      );

      if (error.response) {
        const detail =
          error.response.data?.detail;

        alert(
          typeof detail === "string"
            ? detail
            : `Server error: ${error.response.status}`
        );

      } else if (error.request) {
        alert(
          "Cannot connect to RapidRed API. Make sure FastAPI is running."
        );

      } else {
        alert(
          error.message ||
            "Eligibility check failed."
        );
      }

    } finally {
      setCheckingEligibility(false);
    }
  };

  // ==========================================
  // LOAD MATCHED REQUESTS
  // ==========================================

  const loadMatchedRequests = async () => {

    const donorId = getUserId(user);

    if (!donorId) {
      console.error(
        "❌ No valid donor ID:",
        user
      );

      setMatchedRequests([]);
      return;
    }

    if (!available) {
      console.log("⚪ Donor is offline");
      setMatchedRequests([]);
      return;
    }

    try {
      setMatchingLoading(true);

      console.log("================================");
      console.log("🔎 CHECKING EMERGENCY REQUESTS");
      console.log("🆔 Donor ID:", donorId);
      console.log("🩸 Donor Blood Group:", user.blood_group);
      console.log("🟢 Donor Available:", available);

      // ========================================
      // GET ACTIVE REQUESTS
      // ========================================
      const activeResponse = await axios.get(
        `${API_URL}/blood-requests/active`
      );

      const activeRequests = Array.isArray(activeResponse.data)
        ? activeResponse.data
        : [];

      console.log("🩸 Active requests:", activeRequests);

      if (activeRequests.length === 0) {
        console.log("⚪ No active blood requests.");
        setMatchedRequests([]);
        return;
      }

      // ========================================
      // MATCH EACH REQUEST
      // ========================================
      const matched = [];

      for (const request of activeRequests) {
        console.log(`🔎 Checking request #${request.id}`);

        try {
          const matchResponse = await axios.get(
            `${API_URL}/matching/request/${request.id}`
          );

          const matchingResult = matchResponse.data;

          console.log(
            `🤖 Matching result #${request.id}:`,
            matchingResult
          );

          const matches = Array.isArray(matchingResult?.matches)
            ? matchingResult.matches
            : [];

          console.log(
            `👥 Backend matches for request #${request.id}:`,
            matches
          );

          // Backend currently returns donor_id.
          // The fallbacks make the frontend tolerant of id/user_id too.
          const donorMatch = matches.find((donor) => {
            const backendDonorId = Number(
              donor.donor_id ?? donor.user_id ?? donor.id
            );

            console.log("🔍 DONOR ID COMPARISON:", {
              loggedInDonorId: donorId,
              backendDonorId,
              donorName: donor.name,
              donorBloodGroup: donor.blood_group,
            });

            return backendDonorId === donorId;
          });

          console.log(
            `🎯 Donor match #${request.id}:`,
            donorMatch
          );

          if (donorMatch) {
            console.log(
              `✅ REQUEST #${request.id} MATCHED DONOR #${donorId}`
            );

            matched.push({
              request,
              donorMatch,
              distance_km: Number(donorMatch.distance_km ?? 0),
              urgency: request.urgency,
              search_radius_km: matchingResult?.search_radius_km,
            });
          } else {
            console.log(
              `❌ REQUEST #${request.id} DOES NOT MATCH DONOR #${donorId}`
            );
          }
        } catch (error) {
          console.error(
            `❌ Matching failed for request #${request.id}:`,
            error.response?.data || error.message
          );
        }
      }

      // ========================================
      // SORT: CRITICAL → MEDIUM → PLANNED,
      // then nearest donor first
      // ========================================
      const urgencyRank = {
        critical: 0,
        medium: 1,
        planned: 2,
      };

      matched.sort((a, b) => {
        const urgencyA =
          urgencyRank[String(a.request.urgency).toLowerCase()] ?? 3;

        const urgencyB =
          urgencyRank[String(b.request.urgency).toLowerCase()] ?? 3;

        if (urgencyA !== urgencyB) {
          return urgencyA - urgencyB;
        }

        return (
          Number(a.donorMatch?.distance_km ?? 999) -
          Number(b.donorMatch?.distance_km ?? 999)
        );
      });

      console.log("================================");
      console.log("🎯 FINAL MATCHED REQUESTS:", matched);
      console.log("🎯 TOTAL MATCHES:", matched.length);

      setMatchedRequests(matched);
    } catch (error) {
      console.error(
        "❌ Failed to load active blood requests:",
        error.response?.data || error.message
      );

      setMatchedRequests([]);
    } finally {
      setMatchingLoading(false);
    }
  };

  // ==========================================
  // AUTO REFRESH MATCHING
  // ==========================================

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    // Only fetch new matching requests while the donor is online.
    // Accepted requests are kept separately in acceptedRequests, so
    // going offline does not make an accepted request disappear.
    if (available) {
      loadMatchedRequests();
    }

    const interval = setInterval(() => {
      if (available) {
        loadMatchedRequests();
      }
    }, 10000);

    return () => {
      clearInterval(interval);
    };
  }, [
    user?.id,
    available,
  ]);

  // ==========================================
// ACCEPT / DECLINE BLOOD REQUEST
// ==========================================

const respondToRequest = async (
  requestId,
  response
) => {
  const donorId = getUserId(user);

  if (!donorId) {
    alert("User information is missing.");
    navigate("/login");
    return;
  }

  setRespondingRequestId(Number(requestId));

  try {
    const result = await axios.post(
      `${API_URL}/donor-responses/`,
      {
        request_id: Number(requestId),
        donor_id: donorId,
        response: response,
      }
    );

    console.log(
      "🩸 Donor response:",
      result.data
    );

    // ==========================================
    // ACCEPTED
    // ==========================================

    if (response === "accepted") {
      const acceptedItem =
        matchedRequests.find(
          (item) =>
            Number(item.request?.id) ===
            Number(requestId)
        );

      if (acceptedItem) {
        const updatedAcceptedItem = {
          ...acceptedItem,
          accepted: true,
        };

        // Keep accepted request in a separate state so it remains
        // visible after the donor becomes unavailable.
        setAcceptedRequests((previous) => {
          const alreadyExists = previous.some(
            (item) =>
              Number(item.request?.id) ===
              Number(requestId)
          );

          if (alreadyExists) {
            return previous.map((item) =>
              Number(item.request?.id) ===
              Number(requestId)
                ? updatedAcceptedItem
                : item
            );
          }

          return [
            ...previous,
            updatedAcceptedItem,
          ];
        });

        // Mark it accepted in the current matching list too.
        setMatchedRequests((previous) =>
          previous.map((item) =>
            Number(item.request?.id) ===
            Number(requestId)
              ? { ...item, accepted: true }
              : item
          )
        );
      }

      // Donor becomes unavailable for new emergency requests.
      setAvailable(false);

      alert(
        "❤️ Request Accepted!\n\n" +
        "You have been connected to the emergency request."
      );

      console.log(
        "✅ Request accepted:",
        requestId
      );

    }

    // ==========================================
    // DECLINED
    // ==========================================

    else {
      setMatchedRequests((previous) =>
        previous.filter(
          (item) =>
            Number(item.request?.id) !==
            Number(requestId)
        )
      );

      alert(
        "❌ Request Declined.\n\n" +
        "You will continue receiving other compatible requests."
      );
    }

  } catch (error) {

    console.error(
      "❌ Donor response error:",
      error
    );

    if (error.response) {
      const detail =
        error.response.data?.detail;

      alert(
        typeof detail === "string"
          ? detail
          : `Server error: ${error.response.status}`
      );

    } else if (error.request) {
      alert(
        "Cannot connect to RapidRed API. Make sure FastAPI is running."
      );

    } else {
      alert(
        error.message ||
        "Failed to respond to request."
      );
    }

  } finally {
    setRespondingRequestId(null);
  }
};
    // ==========================================
// GET PATIENT CONTACT AFTER ACCEPTANCE
// ==========================================

const getPatientContact = async (requestId) => {
  try {
    setContactLoading((prev) => ({
      ...prev,
      [requestId]: true,
    }));

    const donorId = getUserId(user);

    if (!donorId) {
      throw new Error("Donor ID not found");
    }

    console.log("📞 Getting patient contact:", {
      requestId,
      donorId,
    });

    const response = await axios.get(
      `${API_URL}/donor-responses/request/${requestId}/patient-contact`,
      {
        params: {
          donor_id: donorId,
        },
      }
    );

    console.log(
      "📞 Patient contact received:",
      response.data
    );

    setPatientContacts((prev) => ({
      ...prev,
      [requestId]: response.data.patient,
    }));

  } catch (error) {
    console.error(
      "❌ Failed to get patient contact:",
      error
    );

    alert(
      error.response?.data?.detail ||
      "Unable to get patient contact"
    );

  } finally {
    setContactLoading((prev) => ({
      ...prev,
      [requestId]: false,
    }));
  }
};
  // ==========================================
  // AVAILABILITY
  // ==========================================

  const handleAvailability =
    async () => {

      if (!getUserId(user)) {
        navigate("/login");
        return;
      }

      const result =
        eligibilityResult ||
        savedEligibilityResult;

      if (!result) {
        alert(
          "Please complete the eligibility test first."
        );

        openEligibility();
        return;
      }

      if (
        result !==
        "eligible"
      ) {
        alert(
          "You cannot go online because you are not currently eligible."
        );

        openEligibility();
        return;
      }

      try {

        // -----------------------------
        // GOING ONLINE
        // -----------------------------

        if (!available) {

          await updateDonorLocation();

          const response =
            await axios.post(
              `${API_URL}/availability/toggle?user_id=${getUserId(user)}`
            );

          console.log(
            "Availability response:",
            response.data
          );

          const newAvailability =
            Boolean(
              response.data
                ?.is_available
            );

          setAvailable(
            newAvailability
          );

          if (
            newAvailability
          ) {
            alert(
              "🟢 You are now online!\n\n" +
              "Your location has been updated and RapidRed can match you with nearby blood requests."
            );
          }

          return;
        }

        // -----------------------------
        // GOING OFFLINE
        // -----------------------------

        const response =
          await axios.post(
            `${API_URL}/availability/toggle?user_id=${getUserId(user)}`
          );

        console.log(
          "Availability response:",
          response.data
        );

        const newAvailability =
          Boolean(
            response.data
              ?.is_available
          );

        setAvailable(
          newAvailability
        );

        if (
          !newAvailability
        ) {
          setMatchedRequests([]);

          alert(
            "⚪ You are now offline."
          );
        }

      } catch (error) {

        console.error(
          "Availability error:",
          error
        );

        if (error.response) {
          const detail =
            error.response.data?.detail;

          alert(
            typeof detail ===
              "string"
              ? detail
              : `Server error: ${error.response.status}`
          );

        } else {
          alert(
            error.message ||
              "Cannot connect to RapidRed API."
          );
        }
      }
    };

  // ==========================================
  // SWITCH TO PATIENT
  // ==========================================

  const switchToPatient =
    () => {

      localStorage.setItem(
        "active_role",
        "patient"
      );

      navigate("/patient");
    };

  // ==========================================
  // LOGOUT
  // ==========================================

  const logout = () => {

    localStorage.removeItem(
      "user"
    );

    localStorage.removeItem(
      "access_token"
    );

    localStorage.removeItem(
      "active_role"
    );

    navigate("/login");
  };

  // ==========================================
  // REWARDS
  // ==========================================

  const acceptedDonationCount =
    acceptedRequests.length;

  const rewardPoints = acceptedDonationCount * 100;

  let rewardBadge = "🩸 New Donor";
  let nextMilestone = 1;

  if (acceptedDonationCount >= 5) {
    rewardBadge = "🏆 RapidRed Champion";
    nextMilestone = 10;
  } else if (acceptedDonationCount >= 3) {
    rewardBadge = "🥇 Hero Donor";
    nextMilestone = 5;
  } else if (acceptedDonationCount >= 1) {
    rewardBadge = "❤️ Life Saver";
    nextMilestone = 3;
  }

  const remainingDonations = Math.max(
    nextMilestone - acceptedDonationCount,
    0
  );

  // ==========================================
  // LOADING
  // ==========================================

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">
          Loading RapidRed...
        </p>
      </div>
    );
  }

  // ==========================================
  // DASHBOARD
  // ==========================================

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HEADER */}
      <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">

        <div>
          <h1 className="text-2xl font-bold text-red-600">
            RapidRed 🩸
          </h1>

          <p className="text-sm text-gray-500">
            Donor Dashboard
          </p>
        </div>

        <div className="flex items-center gap-3">

          <button
            onClick={
              switchToPatient
            }
            className="px-4 py-2 border border-red-600 text-red-600 rounded-lg font-semibold hover:bg-red-50"
          >
            🚨 Request Blood
          </button>

          <button
            onClick={logout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700"
          >
            Logout
          </button>

        </div>

      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">

        {/* WELCOME */}

        <div className="bg-gradient-to-r from-red-600 to-red-500 rounded-2xl p-6 text-white shadow-lg">

          <h2 className="text-3xl font-bold">
            Welcome, {user.name}! ❤️
          </h2>

          <p className="mt-2 text-red-100">
            Your donation can help save a life.
          </p>

        </div>

        {/* PROFILE CARDS */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">

          <div className="bg-white rounded-2xl p-6 shadow-sm">

            <p className="text-gray-500 text-sm">
              Blood Group
            </p>

            <p className="text-4xl font-bold text-red-600 mt-2">
              {user.blood_group}
            </p>

          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">

            <p className="text-gray-500 text-sm">
              Role
            </p>

            <p className="text-2xl font-bold text-gray-800 mt-2">
              Donor
            </p>

          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">

            <p className="text-gray-500 text-sm">
              Availability
            </p>

            <div className="flex items-center justify-between mt-3">

              <span
                className={
                  available
                    ? "font-semibold text-green-600"
                    : "font-semibold text-gray-500"
                }
              >
                {available
                  ? "Available"
                  : "Unavailable"}
              </span>

              <button
                onClick={
                  handleAvailability
                }
                disabled={
                  locationLoading
                }
                className={
                  available
                    ? "px-4 py-2 rounded-lg text-white font-semibold bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
                    : "px-4 py-2 rounded-lg text-white font-semibold bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400"
                }
              >
                {locationLoading
                  ? "Getting Location..."
                  : available
                  ? "Go Offline"
                  : "Go Online"}
              </button>

            </div>

          </div>

        </div>

        {/* LOCATION */}

        <section className="mt-5">

          <div className="bg-white rounded-2xl p-6 shadow-sm">

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

              <div>

                <p className="text-gray-500 text-sm">
                  Donor Location
                </p>

                <h3 className="text-xl font-bold text-gray-800 mt-1">
                  📍 Location Sharing
                </h3>

                <p className="text-gray-500 text-sm mt-1">
                  Your location helps RapidRed find nearby emergency blood requests.
                </p>

                {location.latitude !== null &&
                  location.longitude !== null && (
                    <div className="mt-3 text-sm text-green-600">

                      <p>
                        🟢 Location available
                      </p>

                      <p className="text-gray-500 mt-1">
                        Latitude:{" "}
                        {Number(
                          location.latitude
                        ).toFixed(6)}
                      </p>

                      <p className="text-gray-500">
                        Longitude:{" "}
                        {Number(
                          location.longitude
                        ).toFixed(6)}
                      </p>

                    </div>
                  )}

                {location.latitude === null &&
                  location.longitude === null && (
                    <p className="mt-3 text-sm text-orange-600">
                      🟠 Location not updated yet
                    </p>
                  )}

              </div>

              <button
                type="button"
                onClick={
                  handleLocationUpdate
                }
                disabled={
                  locationLoading
                }
                className="px-5 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 disabled:bg-gray-400"
              >
                {locationLoading
                  ? "📍 Getting Location..."
                  : "📍 Update My Location"}
              </button>

            </div>

          </div>

        </section>

        {/* ELIGIBILITY */}

        <section className="mt-8">

          <div className="bg-white rounded-2xl shadow-sm p-6">

            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">

              <div>

                <h2 className="text-2xl font-bold text-gray-800">
                  🩺 Donor Eligibility Test
                </h2>

                <p className="text-gray-500 mt-1">
                  Complete the preliminary screening before becoming available.
                </p>

              </div>

              <button
                onClick={
                  openEligibility
                }
                className="px-5 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700"
              >
                {eligibilityResult
                  ? "Retake Test"
                  : "Take Eligibility Test"}
              </button>

            </div>

            {!eligibilityResult && (
              <div className="mt-5 p-5 rounded-xl bg-gray-50 border border-gray-200">

                <h3 className="font-bold text-gray-700">
                  ⚪ Eligibility test not completed
                </h3>

                <p className="text-gray-500 mt-1">
                  Take the test to check your eligibility.
                </p>

              </div>
            )}

            {eligibilityResult ===
              "eligible" && (
              <div className="mt-5 p-5 rounded-xl bg-green-50 border border-green-200">

                <h3 className="text-lg font-bold text-green-700">
                  🟢 Preliminary Eligible
                </h3>

                <p className="text-green-600 mt-1">
                  You appear to meet the basic screening criteria.
                </p>

                <p className="text-sm text-green-600 mt-2">
                  Final eligibility must be confirmed by a medical professional.
                </p>

              </div>
            )}

            {eligibilityResult ===
              "deferred" && (
              <div className="mt-5 p-5 rounded-xl bg-red-50 border border-red-200">

                <h3 className="text-lg font-bold text-red-700">
                  🔴 Temporarily Deferred
                </h3>

                <p className="text-red-600 mt-1">
                  Based on your answers, you should not donate at this time.
                </p>

              </div>
            )}

            {eligibilityResult ===
              "review" && (
              <div className="mt-5 p-5 rounded-xl bg-orange-50 border border-orange-200">

                <h3 className="text-lg font-bold text-orange-700">
                  🟠 Medical Review Required
                </h3>

                <p className="text-orange-600 mt-1">
                  One or more answers may require professional assessment.
                </p>

              </div>
            )}

          </div>

        </section>

        {/* EMERGENCY REQUESTS */}

        <section className="mt-8">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">

            <div>

              <h2 className="text-2xl font-bold text-gray-800">
                🚨 Emergency Blood Requests
              </h2>

              <p className="text-gray-500 mt-1">
                Requests matched using blood group, eligibility, availability and distance.
              </p>

            </div>

            <button
              type="button"
              onClick={
                loadMatchedRequests
              }
              disabled={
                matchingLoading ||
                !available
              }
              className="px-4 py-2 border border-red-600 text-red-600 rounded-lg font-semibold hover:bg-red-50 disabled:opacity-50"
            >
              {matchingLoading
                ? "Checking..."
                : "🔄 Refresh"}
            </button>

          </div>

          {/* OFFLINE */}

          {!available && (
            <div className="bg-white rounded-2xl shadow-sm p-8 mt-5 text-center">

              <div className="text-5xl mb-4">
                ⚪
              </div>

              <h3 className="text-xl font-semibold text-gray-700">
                You are currently offline
              </h3>

              <p className="text-gray-500 mt-2">
                Go Online to receive nearby emergency blood requests.
              </p>

              <button
                type="button"
                onClick={
                  handleAvailability
                }
                disabled={
                  locationLoading
                }
                className="mt-5 px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 disabled:bg-gray-400"
              >
                {locationLoading
                  ? "Getting Location..."
                  : "🟢 Go Online"}
              </button>

            </div>
          )}

          {/* LOADING */}

          {available &&
            matchingLoading &&
            matchedRequests.length ===
              0 && (
              <div className="bg-white rounded-2xl shadow-sm p-8 mt-5 text-center">

                <div className="text-4xl mb-3">
                  🔍
                </div>

                <p className="text-gray-600 font-semibold">
                  Checking nearby emergency requests...
                </p>

              </div>
            )}

          {/* NO MATCH */}

          {available &&
            !matchingLoading &&
            matchedRequests.length ===
              0 && (
              <div className="bg-white rounded-2xl shadow-sm p-8 mt-5 text-center">

                <div className="text-5xl mb-4">
                  🩸
                </div>

                <h3 className="text-xl font-semibold text-gray-700">
                  No matching emergency requests
                </h3>

                <p className="text-gray-500 mt-2">
                  We'll automatically check again when a compatible request becomes available nearby.
                </p>

              </div>
            )}

          {/* MATCHED REQUESTS */}

          {matchedRequests.length >
            0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5">

              {matchedRequests.map(
  ({
    request,
    donorMatch,
    accepted,
  }) => {

                  const isCritical =
                    request.urgency ===
                    "critical";

                  const isMedium =
                    request.urgency ===
                    "medium";

                  const isResponding =
                    respondingRequestId ===
                    Number(
                      request.id
                    );

                  return (
                    <div
                      key={
                        request.id
                      }
                      className="bg-white rounded-2xl shadow-md border border-red-100 overflow-hidden"
                    >

                      {/* HEADER */}

                      <div
                        className={
                          isCritical
                            ? "bg-red-600 text-white px-6 py-4"
                            : isMedium
                            ? "bg-orange-500 text-white px-6 py-4"
                            : "bg-green-600 text-white px-6 py-4"
                        }
                      >

                        <div className="flex items-center justify-between">

                          <div>

                            <p className="text-sm font-semibold opacity-90">
                              EMERGENCY BLOOD REQUEST
                            </p>

                            <h3 className="text-xl font-bold mt-1">
                              {isCritical
                                ? "🔴 CRITICAL"
                                : isMedium
                                ? "🟠 MEDIUM"
                                : "🟢 PLANNED"}
                            </h3>

                          </div>

                          <div className="text-4xl">
                            🩸
                          </div>

                        </div>

                      </div>

                      {/* BODY */}

                      <div className="p-6">

                        <div className="flex items-center justify-between">

                          <div>

                            <p className="text-sm text-gray-500">
                              Blood Required
                            </p>

                            <p className="text-4xl font-bold text-red-600">
                              {
                                request.blood_group
                              }
                            </p>

                          </div>

                          <div className="text-right">

                            <p className="text-sm text-gray-500">
                              Distance
                            </p>

                            <p className="text-2xl font-bold text-gray-800">
                              {Number(
                                donorMatch.distance_km ||
                                  0
                              ).toFixed(1)}{" "}
                              km
                            </p>

                          </div>

                        </div>

                        {/* HOSPITAL */}

                        <div className="mt-5">

                          <p className="text-sm text-gray-500">
                            Hospital
                          </p>

                          <p className="font-semibold text-gray-800 mt-1">
                            🏥{" "}
                            {
                              request.hospital
                            }
                          </p>

                        </div>

                        {/* DETAILS */}

                        {request.details && (
                          <div className="mt-4">

                            <p className="text-sm text-gray-500">
                              Additional Details
                            </p>

                            <p className="text-gray-700 mt-1">
                              {
                                request.details
                              }
                            </p>

                          </div>
                        )}

                        {/* MATCH INFO */}

                        <div className="mt-5 p-4 bg-green-50 border border-green-200 rounded-xl">

                          <p className="font-semibold text-green-700">
                            ✅ You are a compatible donor
                          </p>

                          <p className="text-sm text-green-600 mt-1">
                            Your blood group:{" "}
                            <strong>
                              {
                                user.blood_group
                              }
                            </strong>
                          </p>

                          <p className="text-sm text-green-600">
                            Search radius:{" "}
                            <strong>
                              {
                                donorMatch.search_radius_km
                              }{" "}
                              km
                            </strong>
                          </p>

                        </div>

                        {/* ACTION BUTTONS */}

{!accepted ? (
  <div className="grid grid-cols-2 gap-3 mt-5">

    <button
      type="button"
      disabled={isResponding}
      onClick={() =>
        respondToRequest(
          request.id,
          "accepted"
        )
      }
      className="py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 disabled:bg-gray-400"
    >
      {isResponding
        ? "Sending..."
        : "❤️ Accept"}
    </button>

    <button
      type="button"
      disabled={isResponding}
      onClick={() =>
        respondToRequest(
          request.id,
          "declined"
        )
      }
      className="py-3 border border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 disabled:bg-gray-200"
    >
      {isResponding
        ? "Sending..."
        : "❌ Decline"}
    </button>

  </div>
) : (
  <div className="mt-5">

    {/* ACCEPTED MESSAGE */}

    <div className="p-4 bg-green-50 border border-green-200 rounded-xl">

      <p className="font-bold text-green-700">
        ✅ Request Accepted
      </p>

      <p className="text-sm text-green-600 mt-1">
        You have accepted this emergency blood request.
      </p>

      <p className="text-sm text-green-600 mt-1">
        Patient contact details are available only after acceptance.
      </p>

    </div>

    {/* PATIENT CONTACT */}

    {!patientContacts[request.id] ? (

      <button
        type="button"
        onClick={() =>
          getPatientContact(request.id)
        }
        disabled={
          contactLoading[request.id]
        }
        className="w-full mt-3 py-3 bg-gray-800 text-white rounded-xl font-bold hover:bg-gray-900 disabled:bg-gray-400"
      >
        {contactLoading[request.id]
          ? "📞 Getting Patient Contact..."
          : "📞 View Patient Contact"}
      </button>

    ) : (

      <div className="mt-3 p-5 bg-blue-50 border border-blue-200 rounded-xl">

        <h4 className="font-bold text-blue-800 text-lg">
          📞 Patient Contact
        </h4>

        <div className="mt-3 space-y-2">

          <p className="text-gray-700">
            <strong>Name:</strong>{" "}
            {patientContacts[request.id]?.name}
          </p>

          <p className="text-gray-700">
            <strong>Blood Group:</strong>{" "}
            {patientContacts[request.id]?.blood_group}
          </p>

          <p className="text-gray-700">
            <strong>Phone:</strong>{" "}
            <a
              href={`tel:${patientContacts[request.id]?.phone}`}
              className="text-blue-600 font-bold hover:underline"
            >
              {patientContacts[request.id]?.phone}
            </a>
          </p>

        </div>

        <p className="text-xs text-gray-500 mt-4">
          🔒 Contact details are shown only to the donor who accepted this request.
        </p>

      </div>

    )}

  </div>
)}

                      </div>

                    </div>
                  );
                }
              )}

            </div>
          )}

        </section>

        {/* QUICK ACTIONS */}
<section className="mt-8">
  <h2 className="text-2xl font-bold text-gray-800">
    Quick Actions
  </h2>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">

    {/* DONATION HISTORY */}
    <button
      type="button"
      onClick={() => setQuickAction("history")}
      className="text-left bg-white rounded-2xl p-6 shadow-sm border border-transparent hover:border-red-200 hover:shadow-md transition"
    >
      <div className="text-3xl mb-3">❤️</div>

      <h3 className="font-bold text-lg text-gray-800">
        Donation History
      </h3>

      <p className="text-gray-500 text-sm mt-1">
        View your previous donations.
      </p>

      <p className="text-red-600 text-sm font-semibold mt-4">
        View History →
      </p>
    </button>


    {/* REWARDS */}
    <button
      type="button"
      onClick={() => setQuickAction("rewards")}
      className="text-left bg-white rounded-2xl p-6 shadow-sm border border-transparent hover:border-yellow-200 hover:shadow-md transition"
    >
      <div className="text-3xl mb-3">🏆</div>

      <h3 className="font-bold text-lg text-gray-800">
        Rewards
      </h3>

      <p className="text-gray-500 text-sm mt-1">
        View your donor badges and rewards.
      </p>

      <p className="text-yellow-600 text-sm font-semibold mt-4">
        View Rewards →
      </p>
    </button>


    {/* PROFILE */}
    <button
      type="button"
      onClick={() => setQuickAction("profile")}
      className="text-left bg-white rounded-2xl p-6 shadow-sm border border-transparent hover:border-blue-200 hover:shadow-md transition"
    >
      <div className="text-3xl mb-3">👤</div>

      <h3 className="font-bold text-lg text-gray-800">
        My Profile
      </h3>

      <p className="text-gray-500 text-sm mt-1">
        Manage your donor information.
      </p>

      <p className="text-blue-600 text-sm font-semibold mt-4">
        View Profile →
      </p>
    </button>

  </div>
</section>


{/* QUICK ACTION MODAL */}
{quickAction && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center px-4 z-50">

    <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">

        <div>

          {quickAction === "history" && (
            <>
              <h2 className="text-2xl font-bold text-gray-800">
                ❤️ Donation History
              </h2>

              <p className="text-gray-500 text-sm mt-1">
                Your RapidRed donation activity
              </p>
            </>
          )}

          {quickAction === "rewards" && (
  <div className="space-y-4">

    {/* BADGE */}
    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6 text-center">

      <div className="text-5xl">
        🏆
      </div>

      <h3 className="text-2xl font-bold text-gray-800 mt-3">
        {rewardBadge}
      </h3>

      <p className="text-gray-500 text-sm mt-1">
        Your RapidRed donor achievements
      </p>

    </div>

    {/* STATS */}
    <div className="grid grid-cols-2 gap-4">

      <div className="bg-red-50 border border-red-100 rounded-xl p-5 text-center">
        <div className="text-3xl">
          ❤️
        </div>

        <p className="text-3xl font-bold text-red-600 mt-2">
          {acceptedDonationCount}
        </p>

        <p className="text-sm text-gray-500">
          Lives Helped
        </p>
      </div>

      <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-5 text-center">
        <div className="text-3xl">
          ⭐
        </div>

        <p className="text-3xl font-bold text-yellow-600 mt-2">
          {rewardPoints}
        </p>

        <p className="text-sm text-gray-500">
          Reward Points
        </p>
      </div>

    </div>

    {/* PROGRESS */}
    <div className="bg-gray-50 rounded-xl p-5">

      <div className="flex justify-between items-center">
        <p className="font-semibold text-gray-700">
          Next Achievement
        </p>

        <p className="text-sm font-bold text-red-600">
          {acceptedDonationCount}/{nextMilestone}
        </p>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-3 mt-3">
        <div
          className="bg-red-600 h-3 rounded-full transition-all duration-500"
          style={{
            width: `${Math.min(
              (acceptedDonationCount / nextMilestone) * 100,
              100
            )}%`,
          }}
        />
      </div>

      {remainingDonations > 0 ? (
        <p className="text-sm text-gray-500 mt-3">
          🩸 {remainingDonations} more accepted donation
          {remainingDonations !== 1 ? "s" : ""} to unlock your next badge.
        </p>
      ) : (
        <p className="text-sm text-green-600 font-semibold mt-3">
          🎉 Achievement unlocked!
        </p>
      )}

    </div>

    {/* POINT SYSTEM */}
    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
      <p className="font-semibold text-green-700">
        🌟 How Rewards Work
      </p>

      <p className="text-sm text-green-600 mt-1">
        Every accepted emergency blood request earns
        <strong> 100 reward points</strong>.
      </p>
    </div>

  </div>
)}

          {quickAction === "profile" && (
            <>
              <h2 className="text-2xl font-bold text-gray-800">
                👤 My Profile
              </h2>

              <p className="text-gray-500 text-sm mt-1">
                Your donor information
              </p>
            </>
          )}

        </div>

        <button
          type="button"
          onClick={() => setQuickAction(null)}
          className="text-gray-400 text-3xl hover:text-red-600"
        >
          ×
        </button>

      </div>


      {/* ============================= */}
      {/* DONATION HISTORY */}
      {/* ============================= */}

      {quickAction === "history" && (

        <div className="space-y-4">

          <div className="bg-red-50 border border-red-100 rounded-xl p-5">

            <p className="text-sm text-gray-500">
              Total Donations
            </p>

            <p className="text-4xl font-bold text-red-600 mt-1">
              {acceptedDonationCount}
            </p>

          </div>

          {acceptedDonationCount === 0 ? (
            <div className="bg-gray-50 rounded-xl p-5 text-center">

              <div className="text-4xl mb-3">
                🩸
              </div>

              <h3 className="font-bold text-gray-700">
                No donation activity yet
              </h3>

              <p className="text-gray-500 text-sm mt-1">
                Your accepted emergency blood requests will appear here.
              </p>

            </div>
          ) : (
            <div className="space-y-3">
              {acceptedRequests.map((item) => {
                const historyRequest = item.request;

                return (
                  <div
                    key={historyRequest?.id}
                    className="border border-green-200 bg-green-50 rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-bold text-gray-800">
                          🩸 {historyRequest?.blood_group || "Blood Request"}
                        </p>

                        <p className="text-sm text-gray-600 mt-1">
                          Hospital:{" "}
                          {historyRequest?.hospital || "Not specified"}
                        </p>

                        <p className="text-sm text-gray-500 mt-1">
                          Request #{historyRequest?.id}
                        </p>
                      </div>

                      <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                        Accepted
                      </span>
                    </div>

                    <p className="text-xs text-gray-500 mt-3">
                      Your accepted emergency request is recorded here.
                      It becomes a completed donation after the donation
                      workflow is completed.
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">

            <p className="text-sm text-blue-700">
              💡 Your accepted emergency requests will become part
              of your donation history after the donation is completed.
            </p>

          </div>

        </div>

      )}


      {/* ============================= */}
      {/* REWARDS */}
      {/* ============================= */}

    


      {/* ============================= */}
      {/* PROFILE */}
      {/* ============================= */}

      {quickAction === "profile" && (

        <div className="space-y-4">

          <div className="flex items-center gap-4 bg-red-50 rounded-xl p-5">

            <div className="w-16 h-16 rounded-full bg-red-600 text-white flex items-center justify-center text-2xl font-bold">
              {user.name?.charAt(0)?.toUpperCase() || "D"}
            </div>

            <div>

              <h3 className="text-xl font-bold text-gray-800">
                {user.name}
              </h3>

              <p className="text-gray-500 text-sm">
                RapidRed Donor
              </p>

            </div>

          </div>


          <div className="space-y-3">

            <div className="flex justify-between p-4 bg-gray-50 rounded-xl">
              <span className="text-gray-500">
                Blood Group
              </span>

              <strong className="text-red-600">
                {user.blood_group || "Not provided"}
              </strong>
            </div>


            <div className="flex justify-between p-4 bg-gray-50 rounded-xl">
              <span className="text-gray-500">
                Phone
              </span>

              <strong className="text-gray-800">
                {user.phone || "Not provided"}
              </strong>
            </div>


            <div className="flex justify-between p-4 bg-gray-50 rounded-xl">
              <span className="text-gray-500">
                Role
              </span>

              <strong className="text-gray-800">
                Donor
              </strong>
            </div>


            <div className="flex justify-between p-4 bg-gray-50 rounded-xl">
              <span className="text-gray-500">
                Eligibility
              </span>

              <strong
                className={
                  eligibilityResult === "eligible"
                    ? "text-green-600"
                    : "text-gray-600"
                }
              >
                {eligibilityResult === "eligible"
                  ? "Eligible"
                  : eligibilityResult || "Not checked"}
              </strong>
            </div>


            <div className="flex justify-between p-4 bg-gray-50 rounded-xl">
              <span className="text-gray-500">
                Availability
              </span>

              <strong
                className={
                  available
                    ? "text-green-600"
                    : "text-gray-500"
                }
              >
                {available
                  ? "Online"
                  : "Offline"}
              </strong>
            </div>

          </div>


          {location.latitude !== null &&
            location.longitude !== null && (

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">

                <p className="font-semibold text-blue-700">
                  📍 Location Sharing
                </p>

                <p className="text-sm text-gray-600 mt-2">
                  Location is available to RapidRed for nearby donor
                  matching.
                </p>

              </div>

            )}

        </div>

      )}


      {/* CLOSE */}
      <button
        type="button"
        onClick={() => setQuickAction(null)}
        className="w-full mt-6 py-3 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50"
      >
        Close
      </button>

    </div>

  </div>
)}

      </main>

      {/* ==========================================
          ELIGIBILITY MODAL
      ========================================== */}

      {showEligibility && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center px-4 z-50">

          <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl p-6">

            <div className="flex justify-between items-center mb-6">

              <div>

                <h2 className="text-2xl font-bold text-gray-800">
                  🩸 Donor Eligibility Test
                </h2>

                <p className="text-gray-500 text-sm mt-1">
                  Preliminary screening — Step{" "}
                  {step} of 3
                </p>

              </div>

              <button
                onClick={
                  closeEligibility
                }
                className="text-gray-500 text-2xl hover:text-red-600"
              >
                ×
              </button>

            </div>

            {/* PROGRESS */}

            <div className="flex gap-2 mb-8">

              {[1, 2, 3].map(
                (number) => (
                  <div
                    key={number}
                    className={
                      step >= number
                        ? "h-2 flex-1 rounded-full bg-red-600"
                        : "h-2 flex-1 rounded-full bg-gray-200"
                    }
                  />
                )
              )}

            </div>

            {/* STEP 1 */}

            {step === 1 && (
              <div className="space-y-6">

                <h3 className="text-xl font-bold">
                  Step 1 — Basic Eligibility
                </h3>

                <NumberQuestion
                  label="Are you 18–65 years old?"
                  name="age"
                  value={
                    eligibility.age
                  }
                  onChange={
                    handleEligibilityChange
                  }
                  placeholder="Enter your age"
                />

                <NumberQuestion
                  label="Is your weight at least 45 kg?"
                  name="weight"
                  value={
                    eligibility.weight
                  }
                  onChange={
                    handleEligibilityChange
                  }
                  placeholder="Enter weight in kg"
                />

                <NumberQuestion
                  label="Is your haemoglobin ≥ 12.5 g/dL?"
                  name="hemoglobin"
                  value={
                    eligibility.hemoglobin
                  }
                  onChange={
                    handleEligibilityChange
                  }
                  placeholder="Enter haemoglobin level"
                />

                <Question
                  name="healthy"
                  value={
                    eligibility.healthy
                  }
                  onChange={
                    handleEligibilityChange
                  }
                  question="Are you currently feeling healthy and well?"
                />

                <button
                  type="button"
                  onClick={() =>
                    setStep(2)
                  }
                  className="w-full py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700"
                >
                  Next
                </button>

              </div>
            )}

            {/* STEP 2 */}

            {step === 2 && (
              <div className="space-y-6">

                <h3 className="text-xl font-bold">
                  Step 2 — Recent Health & Donation History
                </h3>

                <Question
                  name="illness"
                  value={
                    eligibility.illness
                  }
                  onChange={
                    handleEligibilityChange
                  }
                  question="Do you currently have fever, cold, cough, infection, weakness or dizziness?"
                />

                <Question
                  name="recentDonation"
                  value={
                    eligibility.recentDonation
                  }
                  onChange={
                    handleEligibilityChange
                  }
                  question="Have you donated whole blood within the required interval?"
                />

                <Question
                  name="alcohol"
                  value={
                    eligibility.alcohol
                  }
                  onChange={
                    handleEligibilityChange
                  }
                  question="Have you consumed alcohol recently or are you currently under its influence?"
                />

                <Question
                  name="pregnancy"
                  value={
                    eligibility.pregnancy
                  }
                  onChange={
                    handleEligibilityChange
                  }
                  question="Are you pregnant or recently postpartum?"
                />

                <div className="flex gap-3">

                  <button
                    type="button"
                    onClick={() =>
                      setStep(1)
                    }
                    className="w-1/2 py-3 border rounded-xl font-semibold"
                  >
                    Back
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setStep(3)
                    }
                    className="w-1/2 py-3 bg-red-600 text-white rounded-xl font-bold"
                  >
                    Next
                  </button>

                </div>

              </div>
            )}

            {/* STEP 3 */}

            {step === 3 && (
              <div className="space-y-6">

                <h3 className="text-xl font-bold">
                  Step 3 — Medical Review
                </h3>

                <Question
                  name="majorSurgery"
                  value={
                    eligibility.majorSurgery
                  }
                  onChange={
                    handleEligibilityChange
                  }
                  question="Have you recently had major surgery or a major medical procedure?"
                />

                <Question
                  name="tattooPiercing"
                  value={
                    eligibility.tattooPiercing
                  }
                  onChange={
                    handleEligibilityChange
                  }
                  question="Have you recently had a tattoo, piercing or acupuncture?"
                />

                <Question
                  name="medication"
                  value={
                    eligibility.medication
                  }
                  onChange={
                    handleEligibilityChange
                  }
                  question="Are you currently taking medications such as antibiotics?"
                />

                <Question
                  name="medicalCondition"
                  value={
                    eligibility.medicalCondition
                  }
                  onChange={
                    handleEligibilityChange
                  }
                  question="Do you have a medical condition that could make donation unsafe?"
                />

                <div className="flex gap-3">

                  <button
                    type="button"
                    onClick={() =>
                      setStep(2)
                    }
                    className="w-1/2 py-3 border rounded-xl font-semibold"
                  >
                    Back
                  </button>

                  <button
                    type="button"
                    onClick={
                      calculateEligibility
                    }
                    disabled={
                      checkingEligibility
                    }
                    className="w-1/2 py-3 bg-red-600 text-white rounded-xl font-bold disabled:bg-gray-400"
                  >
                    {checkingEligibility
                      ? "Checking..."
                      : "Check Eligibility"}
                  </button>

                </div>

              </div>
            )}

            {/* RESULT */}

            {eligibilityResult && (
              <div className="mt-6">

                {eligibilityResult ===
                  "eligible" && (
                  <div className="p-5 bg-green-50 border border-green-200 rounded-xl">

                    <h3 className="text-xl font-bold text-green-700">
                      🟢 Preliminary Eligible
                    </h3>

                    <p className="text-green-600 mt-2">
                      You appear to meet the basic screening criteria.
                    </p>

                    <p className="text-sm text-green-600 mt-2">
                      Final eligibility must be confirmed by a medical professional.
                    </p>

                  </div>
                )}

                {eligibilityResult ===
                  "deferred" && (
                  <div className="p-5 bg-red-50 border border-red-200 rounded-xl">

                    <h3 className="text-xl font-bold text-red-700">
                      🔴 Temporarily Deferred
                    </h3>

                    <p className="text-red-600 mt-2">
                      Based on your answers, you should not donate at this time.
                    </p>

                  </div>
                )}

                {eligibilityResult ===
                  "review" && (
                  <div className="p-5 bg-orange-50 border border-orange-200 rounded-xl">

                    <h3 className="text-xl font-bold text-orange-700">
                      🟠 Medical Review Required
                    </h3>

                    <p className="text-orange-600 mt-2">
                      One or more answers may require professional assessment.
                    </p>

                  </div>
                )}

                <button
                  type="button"
                  onClick={
                    closeEligibility
                  }
                  className="w-full mt-4 py-3 bg-gray-800 text-white rounded-xl font-semibold"
                >
                  Close
                </button>

              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}

// ==========================================
// NUMBER QUESTION
// ==========================================

function NumberQuestion({
  label,
  name,
  value,
  onChange,
  placeholder,
}) {
  return (
    <div>

      <label className="font-semibold text-gray-700">
        {label}
      </label>

      <input
        type="number"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        min="0"
        step="0.1"
        className="w-full mt-2 border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-red-600 focus:ring-2 focus:ring-red-200"
      />

    </div>
  );
}

// ==========================================
// YES / NO QUESTION
// ==========================================

function Question({
  question,
  name,
  value,
  onChange,
}) {
  return (
    <div className="border border-gray-200 rounded-xl p-4">

      <p className="font-semibold text-gray-700">
        {question}
      </p>

      <div className="flex gap-6 mt-4">

        <label className="flex items-center gap-2">

          <input
            type="radio"
            name={name}
            value="yes"
            checked={
              value === "yes"
            }
            onChange={onChange}
          />

          Yes

        </label>

        <label className="flex items-center gap-2">

          <input
            type="radio"
            name={name}
            value="no"
            checked={
              value === "no"
            }
            onChange={onChange}
          />

          No

        </label>

      </div>

    </div>
  );
}

export default DonorDashboard;
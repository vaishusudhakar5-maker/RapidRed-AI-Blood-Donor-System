import { useEffect, useMemo, useState } from "react";
import axios from "axios";

const API_URL = "http://127.0.0.1:8000";

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  const [requests, setRequests] = useState([]);
  const [donorResponses, setDonorResponses] = useState({});

  const [loading, setLoading] = useState(true);
  const [responsesLoading, setResponsesLoading] = useState(false);

  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  // =========================================================
  // LOAD ACTIVE REQUESTS
  // =========================================================

  const loadRequests = async () => {
    try {
      setError("");

      const response = await axios.get(
        `${API_URL}/blood-requests/active`
      );

      const data = Array.isArray(response.data)
        ? response.data
        : [];

      setRequests(data);
      setLastUpdated(new Date());

      return data;
    } catch (err) {
      console.error(
        "❌ Failed to load admin requests:",
        err
      );

      setError(
        "Unable to load live RapidRed request data."
      );

      return [];
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOAD DONOR RESPONSES
  // =========================================================

  const loadDonorResponses = async (requestList) => {
    if (!requestList.length) {
      setDonorResponses({});
      return;
    }

    setResponsesLoading(true);

    const responseMap = {};

    try {
      await Promise.all(
        requestList.map(async (request) => {
          try {
            const response = await axios.get(
              `${API_URL}/donor-responses/request/${request.id}`
            );

            responseMap[request.id] =
              Array.isArray(response.data)
                ? response.data
                : [];
          } catch (err) {
            console.warn(
              `Could not load donor responses for request ${request.id}`,
              err
            );

            responseMap[request.id] = [];
          }
        })
      );

      setDonorResponses(responseMap);
    } finally {
      setResponsesLoading(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    const initialize = async () => {
      const data = await loadRequests();

      await loadDonorResponses(data);
    };

    initialize();

    const interval = setInterval(async () => {
      const data = await loadRequests();

      await loadDonorResponses(data);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  // =========================================================
  // STATISTICS
  // =========================================================

  const totalRequests = requests.length;

  const criticalRequests = requests.filter(
    (request) =>
      String(request.urgency).toLowerCase() ===
      "critical"
  ).length;

  const mediumRequests = requests.filter(
    (request) =>
      String(request.urgency).toLowerCase() ===
      "medium"
  ).length;

  const hospitals = useMemo(() => {
    return [
      ...new Set(
        requests
          .map((request) => request.hospital)
          .filter(Boolean)
      ),
    ];
  }, [requests]);

  const patients = useMemo(() => {
    return [
      ...new Set(
        requests
          .map((request) => request.patient_id)
          .filter(
            (id) =>
              id !== undefined &&
              id !== null
          )
      ),
    ];
  }, [requests]);

  // =========================================================
  // BLOOD DEMAND
  // =========================================================

  const bloodDemand = useMemo(() => {
    const counts = {};

    requests.forEach((request) => {
      const group =
        request.blood_group || "Unknown";

      counts[group] =
        (counts[group] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([group, count]) => ({
        group,
        count,
      }))
      .sort((a, b) => b.count - a.count);
  }, [requests]);

  const highestDemand =
    bloodDemand.length > 0
      ? bloodDemand[0]
      : null;

  // =========================================================
  // TOTAL DONOR RESPONSES
  // =========================================================

  const totalDonorResponses = Object.values(
    donorResponses
  ).reduce(
    (total, responses) =>
      total + responses.length,
    0
  );

  // =========================================================
  // ACCEPTED DONORS
  // =========================================================

  const acceptedDonors = Object.values(
    donorResponses
  ).reduce((total, responses) => {

    if (!Array.isArray(responses)) {
      return total;
    }

    return (
      total +
      responses.filter((response) => {
        const status = String(
          response.status ||
          response.response ||
          response.result ||
          ""
        ).toLowerCase();

        return (
          status === "accepted" ||
          status === "accept"
        );
      }).length
    );

  }, 0);

  // =========================================================
  // HELPERS
  // =========================================================

  const getUrgencyStyle = (urgency) => {
    const value = String(
      urgency || ""
    ).toLowerCase();

    if (value === "critical") {
      return "bg-red-100 text-red-700";
    }

    if (value === "medium") {
      return "bg-yellow-100 text-yellow-700";
    }

    return "bg-blue-100 text-blue-700";
  };

  const formatUrgency = (urgency) => {
    if (!urgency) {
      return "Unknown";
    }

    return (
      urgency.charAt(0).toUpperCase() +
      urgency.slice(1)
    );
  };

  // =========================================================
  // REFRESH
  // =========================================================

  const refreshDashboard = async () => {
    setLoading(true);

    const data = await loadRequests();

    await loadDonorResponses(data);
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="min-h-screen bg-slate-50">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">

        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          <div className="flex items-center gap-3">

            <div className="w-11 h-11 rounded-xl bg-red-600 flex items-center justify-center shadow-sm">
              <span className="text-2xl">
                🩸
              </span>
            </div>

            <div>

              <h1 className="text-xl font-black text-gray-900">
                Rapid
                <span className="text-red-600">
                  Red
                </span>
              </h1>

              <p className="text-xs text-gray-500">
                Administration Portal
              </p>

            </div>

          </div>

          <div className="flex items-center gap-3">

            <div className="hidden sm:block text-right">

              <p className="text-sm font-semibold text-gray-800">
                Administrator
              </p>

              <p className="text-xs text-green-600">
                ● Live Backend
              </p>

            </div>

            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              🔐
            </div>

          </div>

        </div>

      </header>


      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* TITLE */}

        <div className="mb-8">

          <p className="text-sm font-semibold text-red-600 uppercase tracking-wide">
            Emergency Response System
          </p>

          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mt-1">
            Admin Control Center
          </h2>

          <p className="text-gray-500 mt-2">
            Monitor live emergency activity across the RapidRed network.
          </p>

        </div>


        {/* ERROR */}

        {error && (

          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200">

            <p className="text-sm text-red-700 font-semibold">
              ❌ {error}
            </p>

            <button
              type="button"
              onClick={refreshDashboard}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700"
            >
              Retry
            </button>

          </div>

        )}


        {/* TABS */}

        <div className="flex flex-wrap gap-2 mb-6">

          {[
            "overview",
            "emergency",
            "network",
            "activity",
          ].map((tab) => (

            <button
              key={tab}
              type="button"
              onClick={() =>
                setActiveTab(tab)
              }
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold capitalize transition ${
                activeTab === tab
                  ? "bg-red-600 text-white shadow-sm"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >

              {tab === "overview" && "📊 "}

              {tab === "emergency" && "🚨 "}

              {tab === "network" && "🌐 "}

              {tab === "activity" && "🔔 "}

              {tab}

            </button>

          ))}

        </div>


        {/* =====================================================
            OVERVIEW
        ===================================================== */}

        {activeTab === "overview" && (

          <>

            {/* STAT CARDS */}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

              {/* ACTIVE REQUESTS */}

              <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">

                <div className="flex items-center justify-between">

                  <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center text-xl">
                    🚨
                  </div>

                  <span className="text-xs font-bold text-green-600">
                    LIVE
                  </span>

                </div>

                <p className="text-3xl font-black text-gray-900 mt-5">
                  {loading
                    ? "..."
                    : totalRequests}
                </p>

                <p className="font-semibold text-gray-800">
                  Active Requests
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  Current emergency queue
                </p>

              </div>


              {/* CRITICAL */}

              <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">

                <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center text-xl">
                  🔴
                </div>

                <p className="text-3xl font-black text-gray-900 mt-5">
                  {loading
                    ? "..."
                    : criticalRequests}
                </p>

                <p className="font-semibold text-gray-800">
                  Critical Requests
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  Require immediate attention
                </p>

              </div>


              {/* DONOR RESPONSES */}

              <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">

                <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center text-xl">
                  ❤️
                </div>

                <p className="text-3xl font-black text-gray-900 mt-5">
                  {responsesLoading
                    ? "..."
                    : totalDonorResponses}
                </p>

                <p className="font-semibold text-gray-800">
                  Donor Responses
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  Responses to active requests
                </p>

              </div>


              {/* PATIENTS */}

              <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">

                <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center text-xl">
                  👥
                </div>

                <p className="text-3xl font-black text-gray-900 mt-5">
                  {loading
                    ? "..."
                    : patients.length}
                </p>

                <p className="font-semibold text-gray-800">
                  Patients
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  Patients with active requests
                </p>

              </div>

            </div>


            {/* TWO COLUMNS */}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">

              {/* EMERGENCY REQUESTS */}

              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">

                <div className="p-5 border-b border-gray-100 flex items-center justify-between">

                  <div>

                    <h3 className="font-bold text-gray-900">
                      🚨 Live Emergency Monitor
                    </h3>

                    <p className="text-xs text-gray-500 mt-1">
                      Active requests from FastAPI
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={refreshDashboard}
                    className="text-xs font-semibold text-red-600 hover:underline"
                  >
                    Refresh
                  </button>

                </div>


                <div className="p-5 space-y-3">

                  {loading ? (

                    <div className="py-10 text-center">

                      <div className="w-8 h-8 mx-auto border-4 border-gray-200 border-t-red-600 rounded-full animate-spin" />

                      <p className="text-sm text-gray-500 mt-3">
                        Loading live data...
                      </p>

                    </div>

                  ) : requests.length === 0 ? (

                    <div className="py-10 text-center">

                      <div className="text-4xl">
                        ✅
                      </div>

                      <p className="font-semibold text-gray-800 mt-3">
                        No active emergencies
                      </p>

                    </div>

                  ) : (

                    requests
                      .slice(0, 5)
                      .map((request) => (

                        <div
                          key={request.id}
                          className="border border-gray-100 rounded-xl p-4"
                        >

                          <div className="flex items-center justify-between">

                            <div className="flex items-center gap-3">

                              <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center font-black">
                                {request.blood_group}
                              </div>

                              <div>

                                <p className="font-semibold text-gray-800">
                                  Request #{request.id}
                                </p>

                                <p className="text-xs text-gray-500">
                                  Patient #{request.patient_id}
                                  {" • "}
                                  {request.hospital ||
                                    "Hospital unavailable"}
                                </p>

                              </div>

                            </div>

                            <span
                              className={`text-xs font-bold px-2.5 py-1 rounded-full ${getUrgencyStyle(
                                request.urgency
                              )}`}
                            >
                              {formatUrgency(
                                request.urgency
                              )}
                            </span>

                          </div>

                        </div>

                      ))

                  )}

                </div>

              </div>


              {/* BLOOD DEMAND */}

              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">

                <div className="p-5 border-b border-gray-100">

                  <h3 className="font-bold text-gray-900">
                    🩸 Blood Demand
                  </h3>

                  <p className="text-xs text-gray-500 mt-1">
                    Calculated from live active requests
                  </p>

                </div>

                <div className="p-5 space-y-5">

                  {bloodDemand.length === 0 ? (

                    <div className="py-10 text-center text-gray-500">
                      No demand data available.
                    </div>

                  ) : (

                    bloodDemand.map((item) => {

                      const percentage =
                        highestDemand
                          ? Math.round(
                              (item.count /
                                highestDemand.count) *
                                100
                            )
                          : 0;

                      return (

                        <div key={item.group}>

                          <div className="flex justify-between mb-2">

                            <span className="font-bold text-gray-800">
                              {item.group}
                            </span>

                            <span className="text-xs text-gray-500">
                              {item.count} request
                              {item.count !== 1
                                ? "s"
                                : ""}
                            </span>

                          </div>

                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">

                            <div
                              className="h-full bg-red-600 rounded-full"
                              style={{
                                width: `${percentage}%`,
                              }}
                            />

                          </div>

                        </div>

                      );
                    })

                  )}

                </div>

              </div>

            </div>


            {/* NETWORK SUMMARY */}

            <div className="mt-6 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">

              <h3 className="font-bold text-gray-900">
                🌐 RapidRed Network
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                Derived from the currently active emergency requests.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">

                <div className="border rounded-xl p-5">

                  <p className="text-sm text-gray-500">
                    Hospitals in Queue
                  </p>

                  <p className="text-3xl font-black text-gray-900 mt-2">
                    {hospitals.length}
                  </p>

                </div>

                <div className="border rounded-xl p-5">

                  <p className="text-sm text-gray-500">
                    Patients in Queue
                  </p>

                  <p className="text-3xl font-black text-gray-900 mt-2">
                    {patients.length}
                  </p>

                </div>

                <div className="border rounded-xl p-5">

                  <p className="text-sm text-gray-500">
                    Accepted Responses
                  </p>

                  <p className="text-3xl font-black text-gray-900 mt-2">
                    {acceptedDonors}
                  </p>

                </div>

              </div>

            </div>

          </>

        )}


        {/* =====================================================
            EMERGENCY TAB
        ===================================================== */}

        {activeTab === "emergency" && (

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

            <div className="p-6 border-b flex items-center justify-between">

              <div>

                <h3 className="text-xl font-bold text-gray-900">
                  🚨 Emergency Request Monitor
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  Live requests retrieved from RapidRed.
                </p>

              </div>

              <button
                type="button"
                onClick={refreshDashboard}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700"
              >
                Refresh
              </button>

            </div>


            {loading ? (

              <div className="p-12 text-center text-gray-500">
                Loading...
              </div>

            ) : (

              <div className="overflow-x-auto">

                <table className="w-full">

                  <thead className="bg-gray-50">

                    <tr>

                      <th className="text-left px-6 py-4 text-xs uppercase text-gray-500">
                        Request
                      </th>

                      <th className="text-left px-6 py-4 text-xs uppercase text-gray-500">
                        Blood
                      </th>

                      <th className="text-left px-6 py-4 text-xs uppercase text-gray-500">
                        Urgency
                      </th>

                      <th className="text-left px-6 py-4 text-xs uppercase text-gray-500">
                        Patient
                      </th>

                      <th className="text-left px-6 py-4 text-xs uppercase text-gray-500">
                        Hospital
                      </th>

                      <th className="text-left px-6 py-4 text-xs uppercase text-gray-500">
                        Status
                      </th>

                    </tr>

                  </thead>


                  <tbody className="divide-y divide-gray-100">

                    {requests.map(
                      (request) => (

                        <tr
                          key={request.id}
                          className="hover:bg-gray-50"
                        >

                          <td className="px-6 py-4 font-semibold">
                            #{request.id}
                          </td>

                          <td className="px-6 py-4 font-black text-red-600">
                            {request.blood_group}
                          </td>

                          <td className="px-6 py-4">

                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold ${getUrgencyStyle(
                                request.urgency
                              )}`}
                            >
                              {formatUrgency(
                                request.urgency
                              )}
                            </span>

                          </td>

                          <td className="px-6 py-4 text-sm">
                            #{request.patient_id}
                          </td>

                          <td className="px-6 py-4 text-sm">
                            {request.hospital ||
                              "—"}
                          </td>

                          <td className="px-6 py-4">

                            <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                              ●{" "}
                              {request.status ||
                                "active"}
                            </span>

                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            )}

          </div>

        )}


        {/* =====================================================
            NETWORK TAB
        ===================================================== */}

        {activeTab === "network" && (

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* HOSPITALS */}

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">

              <h3 className="text-xl font-bold text-gray-900">
                🏥 Hospitals in Active Queue
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                Hospitals appearing in active requests.
              </p>

              <div className="mt-6 space-y-3">

                {hospitals.length === 0 ? (

                  <p className="text-gray-500 text-sm">
                    No hospital data available.
                  </p>

                ) : (

                  hospitals.map((hospital) => {

                    const count =
                      requests.filter(
                        (request) =>
                          request.hospital ===
                          hospital
                      ).length;

                    return (

                      <div
                        key={hospital}
                        className="flex items-center justify-between border border-gray-100 rounded-xl p-4"
                      >

                        <div className="flex items-center gap-3">

                          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                            🏥
                          </div>

                          <div>

                            <p className="font-semibold text-gray-800">
                              {hospital}
                            </p>

                            <p className="text-xs text-gray-500">
                              Active requests
                            </p>

                          </div>

                        </div>

                        <span className="font-black text-red-600">
                          {count}
                        </span>

                      </div>

                    );

                  })

                )}

              </div>

            </div>


            {/* BLOOD GROUPS */}

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">

              <h3 className="text-xl font-bold text-gray-900">
                🩸 Blood Demand Summary
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                Current demand by blood group.
              </p>

              <div className="mt-6 space-y-3">

                {bloodDemand.map((item) => (

                  <div
                    key={item.group}
                    className="flex items-center justify-between border border-gray-100 rounded-xl p-4"
                  >

                    <div className="flex items-center gap-3">

                      <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center font-black text-red-600">
                        {item.group}
                      </div>

                      <span className="font-semibold">
                        Active demand
                      </span>

                    </div>

                    <span className="font-black">
                      {item.count}
                    </span>

                  </div>

                ))}

              </div>

            </div>

          </div>

        )}


        {/* =====================================================
            ACTIVITY TAB
        ===================================================== */}

        {activeTab === "activity" && (

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">

            <div className="p-6 border-b">

              <h3 className="text-xl font-bold text-gray-900">
                🔔 Live System Activity
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                Activity derived from current backend data.
              </p>

            </div>

            <div className="divide-y divide-gray-100">

              {requests.length === 0 ? (

                <div className="p-10 text-center text-gray-500">
                  No recent activity available.
                </div>

              ) : (

                requests.map((request) => {

                  const responses =
                    donorResponses[
                      request.id
                    ] || [];

                  return (

                    <div
                      key={request.id}
                      className="p-5 flex gap-4"
                    >

                      <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center">
                        🚨
                      </div>

                      <div className="flex-1">

                        <p className="font-semibold text-gray-800">

                          Active{" "}
                          {request.blood_group}{" "}
                          emergency request #

                          {request.id}

                        </p>

                        <p className="text-xs text-gray-500 mt-1">

                          {formatUrgency(
                            request.urgency
                          )}

                          {" • "}

                          {request.hospital ||
                            "Hospital unavailable"}

                          {" • "}

                          {responses.length} donor
                          response
                          {responses.length !== 1
                            ? "s"
                            : ""}

                        </p>

                      </div>

                    </div>

                  );

                })

              )}

            </div>

          </div>

        )}


        {/* =====================================================
            FOOTER
        ===================================================== */}

        <div className="mt-8 flex flex-col sm:flex-row justify-between gap-2 text-xs text-gray-400">

          <span>
            🟢 Connected to RapidRed FastAPI
          </span>

          <span>
            🔄 Auto-refresh: 15 seconds
          </span>

          <span>
            {lastUpdated
              ? `Updated ${lastUpdated.toLocaleTimeString()}`
              : "Waiting for data"}
          </span>

        </div>

      </main>

    </div>
  );
}

export default AdminDashboard;
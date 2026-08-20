import { useEffect, useMemo, useState } from "react";
import axios from "axios";

const API_URL = "http://127.0.0.1:8000";

function HospitalDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  const [requests, setRequests] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [lastUpdated, setLastUpdated] = useState(null);

  // =========================================================
  // LOAD REAL BLOOD REQUESTS
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

    } catch (err) {
      console.error(
        "❌ Failed to load hospital requests:",
        err
      );

      setError(
        "Unable to load live blood requests from RapidRed."
      );

    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // INITIAL LOAD + AUTO REFRESH
  // =========================================================

  useEffect(() => {
    loadRequests();

    const interval = setInterval(() => {
      loadRequests();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  // =========================================================
  // REAL STATISTICS
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

  const hospitalNames = [
    ...new Set(
      requests
        .map((request) => request.hospital)
        .filter(Boolean)
    ),
  ];

  // =========================================================
  // BLOOD GROUP DEMAND
  // =========================================================

  const bloodDemand = useMemo(() => {
    const counts = {};

    requests.forEach((request) => {
      const group = request.blood_group || "Unknown";

      counts[group] = (counts[group] || 0) + 1;
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
  // STATUS
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
  // DASHBOARD
  // =========================================================

  return (
    <div className="min-h-screen bg-slate-50">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="bg-white border-b border-gray-200">

        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          <div className="flex items-center gap-3">

            <div className="w-11 h-11 rounded-xl bg-red-600 flex items-center justify-center shadow-sm">
              <span className="text-2xl">
                🩸
              </span>
            </div>

            <div>

              <h1 className="text-xl font-black text-gray-900">
                Rapid<span className="text-red-600">
                  Red
                </span>
              </h1>

              <p className="text-xs text-gray-500">
                Hospital Portal
              </p>

            </div>

          </div>

          <div className="flex items-center gap-3">

            <div className="hidden sm:block text-right">

              <p className="font-semibold text-gray-800">
                Hospital Operations
              </p>

              <p className="text-xs text-green-600">
                ● Live Connection
              </p>

            </div>

            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              🏥
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

          <p className="text-sm text-red-600 font-bold uppercase tracking-wide">
            Hospital Operations
          </p>

          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mt-1">
            Emergency Blood Center
          </h2>

          <p className="text-gray-500 mt-2">
            Monitor live emergency blood requests across RapidRed.
          </p>

        </div>


        {/* =====================================================
            ERROR
        ===================================================== */}

        {error && (

          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200">

            <p className="text-sm text-red-700 font-semibold">
              ❌ {error}
            </p>

            <button
              type="button"
              onClick={loadRequests}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700"
            >
              Retry
            </button>

          </div>

        )}


        {/* =====================================================
            TABS
        ===================================================== */}

        <div className="flex flex-wrap gap-2 mb-6">

          {[
            "overview",
            "requests",
            "inventory",
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
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >

              {tab === "overview" && "📊 "}

              {tab === "requests" && "🚨 "}

              {tab === "inventory" && "🩸 "}

              {tab}

            </button>

          ))}

        </div>


        {/* =====================================================
            OVERVIEW
        ===================================================== */}

        {activeTab === "overview" && (

          <>

            {/* ================================================
                STATISTICS
            ================================================= */}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

              {/* ACTIVE REQUESTS */}

              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">

                <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center text-xl">
                  🚨
                </div>

                <p className="text-3xl font-black mt-4 text-gray-900">
                  {loading
                    ? "..."
                    : totalRequests}
                </p>

                <p className="font-semibold text-gray-800">
                  Active Requests
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  Live emergency requests
                </p>

              </div>


              {/* CRITICAL */}

              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">

                <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center text-xl">
                  🔴
                </div>

                <p className="text-3xl font-black mt-4 text-gray-900">
                  {loading
                    ? "..."
                    : criticalRequests}
                </p>

                <p className="font-semibold text-gray-800">
                  Critical Requests
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  Require urgent attention
                </p>

              </div>


              {/* MEDIUM */}

              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">

                <div className="w-11 h-11 rounded-xl bg-yellow-50 flex items-center justify-center text-xl">
                  🟡
                </div>

                <p className="text-3xl font-black mt-4 text-gray-900">
                  {loading
                    ? "..."
                    : mediumRequests}
                </p>

                <p className="font-semibold text-gray-800">
                  Medium Requests
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  Active non-critical requests
                </p>

              </div>


              {/* HOSPITALS */}

              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">

                <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center text-xl">
                  🏥
                </div>

                <p className="text-3xl font-black mt-4 text-gray-900">
                  {hospitalNames.length}
                </p>

                <p className="font-semibold text-gray-800">
                  Hospitals
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  Present in active requests
                </p>

              </div>

            </div>


            {/* ================================================
                REQUESTS + DEMAND
            ================================================= */}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">

              {/* RECENT REQUESTS */}

              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">

                <div className="p-5 border-b border-gray-100 flex items-center justify-between">

                  <div>

                    <h3 className="font-bold text-gray-900">
                      🚨 Live Emergency Requests
                    </h3>

                    <p className="text-xs text-gray-500 mt-1">
                      Retrieved from RapidRed backend
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={loadRequests}
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
                        Loading live requests...
                      </p>

                    </div>

                  ) : requests.length === 0 ? (

                    <div className="py-10 text-center">

                      <div className="text-4xl">
                        ✅
                      </div>

                      <p className="font-semibold text-gray-800 mt-3">
                        No active requests
                      </p>

                      <p className="text-sm text-gray-500 mt-1">
                        The emergency queue is currently clear.
                      </p>

                    </div>

                  ) : (

                    requests
                      .slice(0, 4)
                      .map((request) => (

                        <div
                          key={request.id}
                          className="border border-gray-100 rounded-xl p-4 hover:border-red-100 transition"
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
                                  {formatUrgency(
                                    request.urgency
                                  )}
                                  {" • "}
                                  {request.hospital ||
                                    "Hospital not specified"}
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


                          <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-500">

                            <div>
                              👤 Patient #{request.patient_id}
                            </div>

                            <div>
                              📍 {Number(
                                request.latitude
                              ).toFixed(4)},{" "}
                              {Number(
                                request.longitude
                              ).toFixed(4)}
                            </div>

                          </div>

                        </div>

                      ))

                  )}

                </div>

              </div>


              {/* BLOOD DEMAND */}

              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">

                <div className="p-5 border-b border-gray-100">

                  <h3 className="font-bold text-gray-900">
                    🩸 Live Blood Demand
                  </h3>

                  <p className="text-xs text-gray-500 mt-1">
                    Calculated from active requests
                  </p>

                </div>


                <div className="p-5">

                  {bloodDemand.length === 0 ? (

                    <div className="py-10 text-center text-gray-500">
                      No blood demand data available.
                    </div>

                  ) : (

                    <div className="space-y-5">

                      {bloodDemand.map(
                        (item) => {

                          const percentage =
                            highestDemand
                              ? Math.round(
                                  (item.count /
                                    highestDemand.count) *
                                    100
                                )
                              : 0;

                          return (

                            <div
                              key={item.group}
                            >

                              <div className="flex justify-between mb-2">

                                <span className="font-bold text-gray-800">
                                  {item.group}
                                </span>

                                <span className="text-xs text-gray-500">
                                  {item.count}{" "}
                                  request
                                  {item.count !== 1
                                    ? "s"
                                    : ""}
                                </span>

                              </div>

                              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">

                                <div
                                  className="h-full bg-red-600 rounded-full transition-all"
                                  style={{
                                    width: `${percentage}%`,
                                  }}
                                />

                              </div>

                            </div>

                          );
                        }
                      )}

                    </div>

                  )}

                </div>

              </div>

            </div>


            {/* ================================================
                LAST UPDATED
            ================================================= */}

            <div className="mt-6 flex justify-between items-center text-xs text-gray-400">

              <span>
                🔄 Auto-refreshing every 15 seconds
              </span>

              <span>
                {lastUpdated
                  ? `Last updated ${lastUpdated.toLocaleTimeString()}`
                  : "Waiting for data..."}
              </span>

            </div>

          </>

        )}


        {/* =====================================================
            REQUESTS TAB
        ===================================================== */}

        {activeTab === "requests" && (

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

            <div className="p-6 border-b">

              <div className="flex items-center justify-between">

                <div>

                  <h3 className="text-xl font-bold text-gray-900">
                    🚨 Active Blood Requests
                  </h3>

                  <p className="text-sm text-gray-500 mt-1">
                    Live data from the RapidRed API.
                  </p>

                </div>

                <button
                  type="button"
                  onClick={loadRequests}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700"
                >
                  Refresh
                </button>

              </div>

            </div>


            {loading ? (

              <div className="p-12 text-center">

                <div className="w-9 h-9 mx-auto border-4 border-gray-200 border-t-red-600 rounded-full animate-spin" />

                <p className="mt-3 text-gray-500">
                  Loading requests...
                </p>

              </div>

            ) : requests.length === 0 ? (

              <div className="p-12 text-center">

                <div className="text-5xl">
                  ✅
                </div>

                <h3 className="font-bold text-gray-800 mt-4">
                  No active blood requests
                </h3>

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
                        Hospital
                      </th>

                      <th className="text-left px-6 py-4 text-xs uppercase text-gray-500">
                        Patient
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

                          <td className="px-6 py-4">

                            <span className="font-black text-red-600">
                              {request.blood_group}
                            </span>

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

                          <td className="px-6 py-4 text-sm text-gray-700">
                            {request.hospital ||
                              "—"}
                          </td>

                          <td className="px-6 py-4 text-sm text-gray-600">
                            #{request.patient_id}
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
            INVENTORY TAB
        ===================================================== */}

        {activeTab === "inventory" && (

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">

            <div className="flex items-start gap-4">

              <div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center text-2xl">
                🩸
              </div>

              <div>

                <h3 className="text-xl font-bold text-gray-900">
                  Blood Inventory
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  Inventory integration is not connected to the current RapidRed API yet.
                </p>

              </div>

            </div>


            <div className="mt-6 p-5 rounded-xl bg-blue-50 border border-blue-200">

              <p className="text-sm text-blue-800">

                <strong>Prototype note:</strong>{" "}
                Your current backend provides live blood requests,
                donor matching, donor responses and tracking, but
                there is currently no blood-inventory endpoint in the API.
                We are intentionally not displaying fake inventory
                numbers as real data.

              </p>

            </div>


            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">

              <div className="border border-gray-200 rounded-xl p-5">

                <p className="text-sm text-gray-500">
                  Active Requests
                </p>

                <p className="text-3xl font-black text-red-600 mt-2">
                  {totalRequests}
                </p>

              </div>


              <div className="border border-gray-200 rounded-xl p-5">

                <p className="text-sm text-gray-500">
                  Critical Demand
                </p>

                <p className="text-3xl font-black text-red-600 mt-2">
                  {criticalRequests}
                </p>

              </div>


              <div className="border border-gray-200 rounded-xl p-5">

                <p className="text-sm text-gray-500">
                  Highest Demand
                </p>

                <p className="text-3xl font-black text-red-600 mt-2">
                  {highestDemand
                    ? highestDemand.group
                    : "—"}
                </p>

              </div>

            </div>

          </div>

        )}

        {/* =====================================================
            FOOTER
        ===================================================== */}

        <div className="mt-8 p-4 rounded-xl bg-green-50 border border-green-200">

          <p className="text-sm text-green-800">

            <strong>🟢 Live Backend Connected:</strong>{" "}
            Emergency request data is being retrieved from
            the RapidRed FastAPI server and refreshed automatically.

          </p>

        </div>

      </main>

    </div>
  );
}

export default HospitalDashboard;
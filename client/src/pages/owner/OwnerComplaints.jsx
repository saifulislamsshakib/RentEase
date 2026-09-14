import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { ArrowLeft, RefreshCw, MessageSquare } from "lucide-react";

import api from "../../services/api";

const statusStyles = {
  Pending: "bg-yellow-100 text-yellow-700",
  "In Progress": "bg-blue-100 text-blue-700",
  Resolved: "bg-green-100 text-green-700",
  Closed: "bg-gray-100 text-gray-700",
};

const priorityStyles = {
  Low: "bg-green-100 text-green-700",
  Medium: "bg-yellow-100 text-yellow-700",
  High: "bg-orange-100 text-orange-700",
  Urgent: "bg-red-100 text-red-700",
};

const OwnerComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [updatingId, setUpdatingId] = useState(null);

  const [updates, setUpdates] = useState({});

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/complaint/owner");

      setComplaints(response.data.complaints || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load complaints");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleUpdateChange = (complaintId, field, value) => {
    setUpdates((prev) => ({
      ...prev,
      [complaintId]: {
        ...prev[complaintId],
        [field]: value,
      },
    }));
  };

  const getCurrentValue = (complaint, field) => {
    return updates[complaint._id]?.[field] ?? complaint[field] ?? "";
  };

  const handleUpdateStatus = async (complaintId) => {
    try {
      setUpdatingId(complaintId);
      setError("");
      setSuccess("");

      const complaint = complaints.find((item) => item._id === complaintId);

      if (!complaint) {
        return;
      }

      const status = getCurrentValue(complaint, "status");

      const ownerNote = getCurrentValue(complaint, "ownerNote");

      await api.put(`/complaint/${complaintId}/status`, {
        status,
        ownerNote,
      });

      setSuccess("Complaint updated successfully.");

      await fetchComplaints();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update complaint");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* ================= HEADER ================= */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/owner/dashboard"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100"
            >
              <ArrowLeft size={19} />
            </Link>

            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
                Owner Portal
              </p>

              <h1 className="mt-1 text-3xl font-bold text-slate-900">
                Complaint Management
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Review and manage tenant complaints.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={fetchComplaints}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* ================= ALERTS ================= */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        {/* ================= SUMMARY ================= */}

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Total Complaints</p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {complaints.length}
            </p>
          </div>

          <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-5 shadow-sm">
            <p className="text-sm text-yellow-700">Pending</p>

            <p className="mt-2 text-3xl font-bold text-yellow-800">
              {complaints.filter((item) => item.status === "Pending").length}
            </p>
          </div>

          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 shadow-sm">
            <p className="text-sm text-blue-700">In Progress</p>

            <p className="mt-2 text-3xl font-bold text-blue-800">
              {
                complaints.filter((item) => item.status === "In Progress")
                  .length
              }
            </p>
          </div>

          <div className="rounded-2xl border border-green-200 bg-green-50 p-5 shadow-sm">
            <p className="text-sm text-green-700">Resolved</p>

            <p className="mt-2 text-3xl font-bold text-green-800">
              {
                complaints.filter(
                  (item) =>
                    item.status === "Resolved" || item.status === "Closed",
                ).length
              }
            </p>
          </div>
        </div>

        {/* ================= CONTENT ================= */}

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <RefreshCw
              size={28}
              className="mx-auto animate-spin text-blue-600"
            />

            <p className="mt-4 text-sm text-slate-500">Loading complaints...</p>
          </div>
        ) : complaints.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-14 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
              <MessageSquare size={28} className="text-blue-600" />
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-900">
              No complaints yet
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Tenant complaints will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {complaints.map((complaint) => (
              <div
                key={complaint._id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                {/* ================= TOP ================= */}

                <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-bold text-slate-900">
                        {complaint.subject}
                      </h2>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          priorityStyles[complaint.priority] ||
                          "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {complaint.priority}
                      </span>
                    </div>

                    <p className="mt-2 text-xs text-slate-400">
                      Complaint ID: {complaint._id}
                    </p>
                  </div>

                  <span
                    className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                      statusStyles[complaint.status] ||
                      "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {complaint.status}
                  </span>
                </div>

                {/* ================= DETAILS ================= */}

                <div className="grid gap-5 border-b border-slate-100 py-5 md:grid-cols-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Tenant
                    </p>

                    <p className="mt-1 font-medium text-slate-800">
                      {complaint.tenant?.name || "Unknown"}
                    </p>

                    {complaint.tenant?.email && (
                      <p className="mt-1 text-sm text-slate-500">
                        {complaint.tenant.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Property
                    </p>

                    <p className="mt-1 font-medium text-slate-800">
                      {complaint.property?.title ||
                        complaint.property?.name ||
                        "Property"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Complaint Date
                    </p>

                    <p className="mt-1 font-medium text-slate-800">
                      {complaint.complaintDate
                        ? new Date(complaint.complaintDate).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                </div>

                {/* ================= DESCRIPTION ================= */}

                <div className="py-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Tenant Complaint
                  </p>

                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                    {complaint.description}
                  </p>
                </div>

                {/* ================= UPDATE ================= */}

                <div className="rounded-2xl bg-slate-50 p-5">
                  <h3 className="text-sm font-bold text-slate-800">
                    Update Complaint
                  </h3>

                  <div className="mt-4 grid gap-4 lg:grid-cols-3">
                    {/* Status */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Status
                      </label>

                      <select
                        value={getCurrentValue(complaint, "status")}
                        onChange={(e) =>
                          handleUpdateChange(
                            complaint._id,
                            "status",
                            e.target.value,
                          )
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      >
                        <option value="Pending">Pending</option>

                        <option value="In Progress">In Progress</option>

                        <option value="Resolved">Resolved</option>

                        <option value="Closed">Closed</option>
                      </select>
                    </div>

                    {/* Owner Note */}
                    <div className="lg:col-span-2">
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Owner Response / Note
                      </label>

                      <textarea
                        rows="3"
                        value={getCurrentValue(complaint, "ownerNote")}
                        onChange={(e) =>
                          handleUpdateChange(
                            complaint._id,
                            "ownerNote",
                            e.target.value,
                          )
                        }
                        placeholder="Write a response for the tenant..."
                        className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(complaint._id)}
                      disabled={updatingId === complaint._id}
                      className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {updatingId === complaint._id
                        ? "Updating..."
                        : "Update Complaint"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerComplaints;

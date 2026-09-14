import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Wrench,
  Clock3,
  CheckCircle2,
  AlertCircle,
  XCircle,
  CalendarDays,
  User,
  Building2,
  Loader2,
  RefreshCw,
} from "lucide-react";

import api from "../../services/api";

const OwnerMaintenance = () => {
  const [requests, setRequests] = useState([]);

  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ==================================================
  // FETCH OWNER MAINTENANCE REQUESTS
  // ==================================================

  const fetchMaintenance = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/maintenance/owner");

      const data =
        response.data?.maintenance ||
        response.data?.maintenanceRequests ||
        response.data?.requests ||
        response.data?.data ||
        [];

      setRequests(data);
    } catch (err) {
      console.error("Owner maintenance fetch error:", err);

      setError(
        err.response?.data?.message || "Failed to load maintenance requests.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // LOAD DATA
  // ==================================================

  useEffect(() => {
    fetchMaintenance();
  }, []);

  // ==================================================
  // UPDATE STATUS
  // ==================================================

  const handleStatusUpdate = async (maintenanceId, newStatus) => {
    const statusText = newStatus
      .replace("_", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());

    const confirmed = window.confirm(
      `Are you sure you want to change the status to "${statusText}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setUpdatingId(maintenanceId);
      setError("");
      setSuccess("");

      const response = await api.put(`/maintenance/${maintenanceId}/status`, {
        status: newStatus,
      });

      if (response.data?.success) {
        setSuccess(`Maintenance request status changed to ${statusText}.`);

        await fetchMaintenance();
      } else {
        setError(
          response.data?.message || "Failed to update maintenance status.",
        );
      }
    } catch (err) {
      console.error("Maintenance status update error:", err);

      setError(
        err.response?.data?.message || "Failed to update maintenance status.",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // ==================================================
  // STATUS STYLE
  // ==================================================

  const getStatusStyle = (status) => {
    switch (status) {
      case "In Progress":
      case "in_progress":
        return {
          className: "bg-blue-50 text-blue-700 border-blue-200",
          icon: <Clock3 size={16} />,
          label: "In Progress",
        };

      case "Resolved":
      case "resolved":
        return {
          className: "bg-emerald-50 text-emerald-700 border-emerald-200",
          icon: <CheckCircle2 size={16} />,
          label: "Resolved",
        };

      case "Closed":
      case "closed":
        return {
          className: "bg-slate-100 text-slate-600 border-slate-200",
          icon: <CheckCircle2 size={16} />,
          label: "Closed",
        };

      case "Cancelled":
      case "cancelled":
        return {
          className: "bg-red-50 text-red-700 border-red-200",
          icon: <XCircle size={16} />,
          label: "Cancelled",
        };

      default:
        return {
          className: "bg-amber-50 text-amber-700 border-amber-200",
          icon: <AlertCircle size={16} />,
          label: "Pending",
        };
    }
  };

  // ==================================================
  // DATE FORMAT
  // ==================================================

  const formatDate = (date) => {
    if (!date) {
      return "N/A";
    }

    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ==================================================
  // CATEGORY FORMAT
  // ==================================================

  const formatCategory = (category) => {
    if (!category) {
      return "Other";
    }

    return category
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  // ==================================================
  // LOADING
  // ==================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={40} className="mx-auto animate-spin text-blue-600" />

          <p className="mt-4 text-gray-600">Loading maintenance requests...</p>
        </div>
      </div>
    );
  }

  // ==================================================
  // PAGE
  // ==================================================

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-6xl">
        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              to="/owner/dashboard"
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-blue-600"
            >
              <ArrowLeft size={17} />
              Back to Dashboard
            </Link>

            <div className="mt-5 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-50">
                <Wrench size={25} className="text-cyan-600" />
              </div>

              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  Maintenance Requests
                </h1>

                <p className="mt-1 text-gray-600">
                  Manage maintenance requests submitted by your tenants.
                </p>
              </div>
            </div>
          </div>

          {/* REFRESH */}

          <button
            type="button"
            onClick={fetchMaintenance}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-blue-500 hover:text-blue-600"
          >
            <RefreshCw size={18} />
            Refresh
          </button>
        </div>

        {/* ==================================================
            ERROR
        ================================================== */}

        {error && (
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            <AlertCircle size={20} className="mt-0.5 shrink-0" />

            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* ==================================================
            SUCCESS
        ================================================== */}

        {success && (
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700">
            <CheckCircle2 size={20} className="mt-0.5 shrink-0" />

            <p className="text-sm font-medium">{success}</p>
          </div>
        )}

        {/* ==================================================
            SUMMARY
        ================================================== */}

        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* TOTAL */}

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Total Requests</p>

            <p className="mt-2 text-3xl font-bold text-gray-800">
              {requests.length}
            </p>
          </div>

          {/* PENDING */}

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Pending</p>

            <p className="mt-2 text-3xl font-bold text-amber-600">
              {
                requests.filter(
                  (request) =>
                    request.status === "Pending" ||
                    request.status === "pending",
                ).length
              }
            </p>
          </div>

          {/* IN PROGRESS */}

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">In Progress</p>

            <p className="mt-2 text-3xl font-bold text-blue-600">
              {
                requests.filter(
                  (request) =>
                    request.status === "In Progress" ||
                    request.status === "in_progress",
                ).length
              }
            </p>
          </div>

          {/* RESOLVED */}

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Resolved</p>

            <p className="mt-2 text-3xl font-bold text-emerald-600">
              {
                requests.filter(
                  (request) =>
                    request.status === "Resolved" ||
                    request.status === "resolved" ||
                    request.status === "Closed" ||
                    request.status === "closed",
                ).length
              }
            </p>
          </div>
        </div>

        {/* ==================================================
            REQUEST LIST
        ================================================== */}

        <div className="mt-8">
          <div className="mb-5">
            <h2 className="text-xl font-bold text-gray-800">
              Tenant Maintenance Requests
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Review tenant problems and update their maintenance status.
            </p>
          </div>

          {/* NO REQUEST */}

          {requests.length === 0 ? (
            <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-cyan-50">
                <Wrench size={36} className="text-cyan-600" />
              </div>

              <h3 className="mt-5 text-xl font-bold text-gray-800">
                No Maintenance Requests
              </h3>

              <p className="mx-auto mt-2 max-w-md text-gray-500">
                You don't have any maintenance requests from tenants yet.
              </p>
            </div>
          ) : (
            /* REQUESTS */

            <div className="space-y-6">
              {requests.map((request) => {
                const statusStyle = getStatusStyle(request.status);

                const property = request.property;
                const tenant = request.tenant;

                const isUpdating = updatingId === request._id;

                return (
                  <div
                    key={request._id}
                    className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6"
                  >
                    {/* ==================================================
                        HEADER
                    ================================================== */}

                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="flex gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-50">
                          <Wrench size={23} className="text-cyan-600" />
                        </div>

                        <div>
                          <h3 className="text-lg font-bold text-gray-800">
                            {request.title || "Maintenance Request"}
                          </h3>

                          <p className="mt-1 text-sm text-gray-500">
                            {formatCategory(request.category)}
                          </p>
                        </div>
                      </div>

                      {/* STATUS */}

                      <div
                        className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold ${statusStyle.className}`}
                      >
                        {statusStyle.icon}
                        {statusStyle.label}
                      </div>
                    </div>

                    {/* ==================================================
                        PROPERTY + TENANT
                    ================================================== */}

                    <div className="mt-5 grid gap-4 md:grid-cols-2">
                      {/* PROPERTY */}

                      <div className="rounded-xl bg-gray-50 p-4">
                        <div className="flex items-center gap-2">
                          <Building2 size={18} className="text-blue-600" />

                          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                            Property
                          </p>
                        </div>

                        <p className="mt-2 font-semibold text-gray-800">
                          {property?.title || "Rental Property"}
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                          {property?.address ||
                            property?.location ||
                            "Address unavailable"}
                        </p>

                        <p className="mt-2 break-all text-xs text-gray-400">
                          ID:{" "}
                          {property?._id || property?.id || property || "N/A"}
                        </p>
                      </div>

                      {/* TENANT */}

                      <div className="rounded-xl bg-gray-50 p-4">
                        <div className="flex items-center gap-2">
                          <User size={18} className="text-blue-600" />

                          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                            Tenant
                          </p>
                        </div>

                        <p className="mt-2 font-semibold text-gray-800">
                          {tenant?.name || tenant?.fullName || "Tenant"}
                        </p>

                        {tenant?.email && (
                          <p className="mt-1 text-sm text-gray-500">
                            {tenant.email}
                          </p>
                        )}

                        {tenant?.phone && (
                          <p className="mt-1 text-sm text-gray-500">
                            {tenant.phone}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* ==================================================
                        PROBLEM
                    ================================================== */}

                    <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Problem Description
                      </p>

                      <p className="mt-2 text-sm leading-6 text-gray-700">
                        {request.description || "No description provided."}
                      </p>
                    </div>

                    {/* ==================================================
                        DETAILS
                    ================================================== */}

                    <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {/* CATEGORY */}

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                          Category
                        </p>

                        <p className="mt-1 text-sm font-semibold text-gray-700">
                          {formatCategory(request.category)}
                        </p>
                      </div>

                      {/* ISSUE DATE */}

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                          Issue Date
                        </p>

                        <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-gray-700">
                          <CalendarDays size={16} className="text-blue-600" />

                          {formatDate(
                            request.issueDate ||
                              request.requestDate ||
                              request.createdAt,
                          )}
                        </p>
                      </div>

                      {/* SUBMITTED */}

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                          Submitted
                        </p>

                        <p className="mt-1 text-sm font-semibold text-gray-700">
                          {formatDate(request.createdAt)}
                        </p>
                      </div>
                    </div>

                    {/* ==================================================
                        OWNER NOTE
                    ================================================== */}

                    {request.ownerNote && (
                      <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4">
                        <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
                          Owner Note
                        </p>

                        <p className="mt-2 text-sm leading-6 text-gray-700">
                          {request.ownerNote}
                        </p>
                      </div>
                    )}

                    {/* ==================================================
                        IMAGES
                    ================================================== */}

                    {request.images?.length > 0 && (
                      <div className="mt-5">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                          Attached Images
                        </p>

                        <div className="flex flex-wrap gap-3">
                          {request.images.map((image, index) => (
                            <img
                              key={index}
                              src={image}
                              alt={`Maintenance ${index + 1}`}
                              className="h-24 w-24 rounded-xl border border-gray-200 object-cover"
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ==================================================
                        STATUS ACTIONS
                    ================================================== */}

                    <div className="mt-6 border-t border-gray-200 pt-5">
                      <p className="mb-3 text-sm font-semibold text-gray-700">
                        Update Request Status
                      </p>

                      <div className="flex flex-wrap gap-3">
                        {/* PENDING */}

                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() =>
                            handleStatusUpdate(request._id, "Pending")
                          }
                          className={`rounded-lg border px-4 py-2.5 text-sm font-semibold transition ${
                            request.status === "Pending" ||
                            request.status === "pending"
                              ? "border-amber-400 bg-amber-50 text-amber-700"
                              : "border-gray-300 bg-white text-gray-700 hover:border-amber-400 hover:bg-amber-50"
                          } disabled:cursor-not-allowed disabled:opacity-50`}
                        >
                          Pending
                        </button>

                        {/* IN PROGRESS */}

                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() =>
                            handleStatusUpdate(request._id, "In Progress")
                          }
                          className={`rounded-lg border px-4 py-2.5 text-sm font-semibold transition ${
                            request.status === "In Progress" ||
                            request.status === "in_progress"
                              ? "border-blue-400 bg-blue-50 text-blue-700"
                              : "border-gray-300 bg-white text-gray-700 hover:border-blue-400 hover:bg-blue-50"
                          } disabled:cursor-not-allowed disabled:opacity-50`}
                        >
                          In Progress
                        </button>

                        {/* RESOLVED */}

                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() =>
                            handleStatusUpdate(request._id, "Resolved")
                          }
                          className={`rounded-lg border px-4 py-2.5 text-sm font-semibold transition ${
                            request.status === "Resolved" ||
                            request.status === "resolved"
                              ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                              : "border-gray-300 bg-white text-gray-700 hover:border-emerald-400 hover:bg-emerald-50"
                          } disabled:cursor-not-allowed disabled:opacity-50`}
                        >
                          Resolved
                        </button>

                        {/* CLOSED */}

                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() =>
                            handleStatusUpdate(request._id, "Closed")
                          }
                          className={`rounded-lg border px-4 py-2.5 text-sm font-semibold transition ${
                            request.status === "Closed" ||
                            request.status === "closed"
                              ? "border-slate-400 bg-slate-100 text-slate-700"
                              : "border-gray-300 bg-white text-gray-700 hover:border-slate-400 hover:bg-slate-100"
                          } disabled:cursor-not-allowed disabled:opacity-50`}
                        >
                          Closed
                        </button>

                        {/* LOADING */}

                        {isUpdating && (
                          <div className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-500">
                            <Loader2 size={17} className="animate-spin" />
                            Updating...
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OwnerMaintenance;

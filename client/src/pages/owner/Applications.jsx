import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  CheckCircle,
  XCircle,
  Building2,
  User,
} from "lucide-react";

import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

function OwnerApplications() {
  const { user } = useAuth();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/application/owner/applications");

        setApplications(response.data.applications || []);
      } catch (error) {
        setError(
          error.response?.data?.message || "Failed to load applications.",
        );
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === "owner") {
      fetchApplications();
    } else {
      setLoading(false);
    }
  }, [user]);

  const updateStatus = async (applicationId, status) => {
    const action = status === "approved" ? "approve" : "reject";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} this application?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(applicationId);
      setError("");

      const response = await api.put(`/application/${applicationId}/status`, {
        status,
      });

      const updatedApplication = response.data.application;

      setApplications((prev) =>
        prev.map((application) =>
          application._id === applicationId
            ? updatedApplication || {
                ...application,
                status,
              }
            : application,
        ),
      );
    } catch (error) {
      setError(
        error.response?.data?.message || `Failed to ${action} application.`,
      );
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusClass = (status) => {
    if (status === "approved") {
      return "bg-green-100 text-green-700";
    }

    if (status === "rejected") {
      return "bg-red-100 text-red-700";
    }

    if (status === "cancelled") {
      return "bg-gray-100 text-gray-600";
    }

    return "bg-yellow-100 text-yellow-700";
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-gray-600">Loading applications...</p>
      </div>
    );
  }

  if (!user || user.role !== "owner") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
        <div className="text-center">
          <FileText size={45} className="mx-auto text-gray-400" />

          <h1 className="mt-4 text-2xl font-bold text-gray-800">
            Access Denied
          </h1>

          <p className="mt-2 text-gray-600">
            Only property owners can view applications.
          </p>

          <Link
            to="/login"
            className="mt-5 inline-flex rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link
            to="/owner/dashboard"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:border-blue-500 hover:text-blue-600"
          >
            <ArrowLeft size={17} />
            Back to Dashboard
          </Link>

          <Link to="/" className="text-2xl font-bold text-blue-600">
            RentEase
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* Heading */}
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50">
            <FileText size={24} className="text-blue-600" />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Property Applications
            </h1>

            <p className="mt-1 text-gray-600">
              Review applications from tenants.
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Empty */}
        {applications.length === 0 ? (
          <div className="mt-7 rounded-xl bg-white p-10 text-center shadow-sm">
            <FileText size={45} className="mx-auto text-gray-300" />

            <h2 className="mt-4 text-xl font-semibold text-gray-800">
              No Applications
            </h2>

            <p className="mt-2 text-gray-500">
              No tenants have applied to your properties yet.
            </p>
          </div>
        ) : (
          <div className="mt-7 space-y-5">
            {applications.map((application) => (
              <div
                key={application._id}
                className="rounded-xl bg-white p-6 shadow-sm"
              >
                {/* Top */}
                <div className="flex flex-col justify-between gap-4 sm:flex-row">
                  <div className="flex gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-50">
                      <User size={23} className="text-blue-600" />
                    </div>

                    <div>
                      <h2 className="text-lg font-semibold text-gray-800">
                        {application.tenant?.name || "Tenant"}
                      </h2>

                      <p className="mt-1 text-sm text-gray-500">
                        {application.tenant?.email || "Email unavailable"}
                      </p>

                      {application.tenant?.phone && (
                        <p className="mt-1 text-sm text-gray-500">
                          Phone: {application.tenant.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  <span
                    className={`h-fit w-fit rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusClass(
                      application.status,
                    )}`}
                  >
                    {application.status || "pending"}
                  </span>
                </div>

                {/* Property */}
                <div className="mt-5 rounded-lg bg-gray-50 p-4">
                  <div className="flex items-start gap-3">
                    <Building2 size={21} className="mt-0.5 text-blue-600" />

                    <div>
                      <p className="font-semibold text-gray-800">
                        {application.property?.title || "Property"}
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        {application.property?.address || "Address unavailable"}

                        {application.property?.city &&
                          `, ${application.property.city}`}
                      </p>

                      {application.property?.rent && (
                        <p className="mt-2 text-sm font-semibold text-blue-600">
                          Rent: ৳{application.property.rent}
                          /month
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Application Message */}
                <div className="mt-5">
                  <p className="text-sm font-semibold text-gray-700">
                    Tenant Message
                  </p>

                  <p className="mt-2 rounded-lg border border-gray-100 bg-white text-sm leading-6 text-gray-600">
                    {application.message || "No message provided."}
                  </p>
                </div>

                {/* Applied Date */}
                {application.createdAt && (
                  <p className="mt-4 text-xs text-gray-400">
                    Applied on{" "}
                    {new Date(application.createdAt).toLocaleString()}
                  </p>
                )}

                {/* Actions */}
                {application.status === "pending" && (
                  <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => updateStatus(application._id, "approved")}
                      disabled={actionLoading === application._id}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <CheckCircle size={18} />

                      {actionLoading === application._id
                        ? "Updating..."
                        : "Approve"}
                    </button>

                    <button
                      type="button"
                      onClick={() => updateStatus(application._id, "rejected")}
                      disabled={actionLoading === application._id}
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-300 px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <XCircle size={18} />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default OwnerApplications;

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  Building2,
  Clock,
  CheckCircle,
  XCircle,
  Ban,
  RefreshCw,
} from "lucide-react";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function MyApplications() {
  const { user } = useAuth();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/application/my-applications");

      setApplications(response.data.applications || []);
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to load your applications.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchApplications();
    }
  }, [user]);

  // =========================
  // Status Style
  // =========================
  const getStatusStyle = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-700";

      case "rejected":
        return "bg-red-100 text-red-700";

      case "cancelled":
        return "bg-gray-100 text-gray-600";

      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return <CheckCircle size={16} />;

      case "rejected":
        return <XCircle size={16} />;

      case "cancelled":
        return <Ban size={16} />;

      default:
        return <Clock size={16} />;
    }
  };

  const formatStatus = (status) => {
    if (!status) return "Pending";

    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // =========================
  // Login Check
  // =========================
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
        <div className="text-center">
          <FileText size={45} className="mx-auto text-gray-400" />

          <h1 className="mt-4 text-2xl font-bold text-gray-800">
            Login Required
          </h1>

          <p className="mt-2 text-gray-600">
            Please login to view your applications.
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

  // =========================
  // Tenant Check
  // =========================
  if (user.role !== "tenant") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
        <div className="text-center">
          <FileText size={45} className="mx-auto text-gray-400" />

          <h1 className="mt-4 text-2xl font-bold text-gray-800">
            Access Denied
          </h1>

          <p className="mt-2 text-gray-600">
            Only tenants can view their applications.
          </p>

          <Link
            to="/"
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            <ArrowLeft size={17} />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // =========================
  // Loading
  // =========================
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="flex items-center gap-3 text-gray-600">
          <RefreshCw size={20} className="animate-spin" />
          Loading applications...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link
            to="/dashboard"
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

      {/* Main */}
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Heading */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
              <FileText size={25} className="text-blue-600" />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                My Applications
              </h1>

              <p className="mt-1 text-gray-500">
                Track all your property applications.
              </p>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Empty State */}
        {!error && applications.length === 0 && (
          <div className="rounded-xl bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <FileText size={30} className="text-gray-400" />
            </div>

            <h2 className="mt-5 text-xl font-semibold text-gray-800">
              No Applications Yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-gray-500">
              You have not submitted any property applications yet.
            </p>

            <Link
              to="/properties"
              className="mt-6 inline-flex rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              Browse Properties
            </Link>
          </div>
        )}

        {/* Applications */}
        {applications.length > 0 && (
          <div className="space-y-5">
            {applications.map((application) => {
              const property = application.property;

              return (
                <div
                  key={application._id}
                  className="overflow-hidden rounded-xl bg-white shadow-sm transition hover:shadow-md"
                >
                  <div className="p-5 sm:p-6">
                    <div className="flex flex-col gap-5 md:flex-row">
                      {/* Property Image */}
                      <div className="shrink-0">
                        {property?.images?.length > 0 ? (
                          <img
                            src={property.images[0]}
                            alt={property.title}
                            className="h-40 w-full rounded-lg object-cover md:h-32 md:w-44"
                          />
                        ) : (
                          <div className="flex h-40 w-full items-center justify-center rounded-lg bg-gray-100 md:h-32 md:w-44">
                            <Building2 size={38} className="text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col justify-between gap-3 sm:flex-row">
                          <div>
                            <h2 className="text-xl font-bold text-gray-800">
                              {property?.title || "Property"}
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                              {property?.address || ""}
                              {property?.city ? `, ${property.city}` : ""}
                            </p>
                          </div>

                          {/* Status */}
                          <div
                            className={`inline-flex h-fit items-center gap-2 self-start rounded-full px-3 py-1.5 text-sm font-semibold ${getStatusStyle(
                              application.status,
                            )}`}
                          >
                            {getStatusIcon(application.status)}

                            {formatStatus(application.status)}
                          </div>
                        </div>

                        {/* Rent */}
                        {property?.rent !== undefined && (
                          <p className="mt-3 font-semibold text-blue-600">
                            ৳{property.rent} / month
                          </p>
                        )}

                        {/* Message */}
                        <div className="mt-4 rounded-lg bg-gray-50 p-4">
                          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                            Your Message
                          </p>

                          <p className="mt-1 text-sm leading-6 text-gray-600">
                            {application.message || "No message provided."}
                          </p>
                        </div>

                        {/* Date */}
                        <p className="mt-4 text-xs text-gray-400">
                          Applied on:{" "}
                          {application.createdAt
                            ? new Date(
                                application.createdAt,
                              ).toLocaleDateString()
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default MyApplications;

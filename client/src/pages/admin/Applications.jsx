import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  User,
  Building2,
  Mail,
  Phone,
  MapPin,
  CalendarDays,
  Eye,
} from "lucide-react";

import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

function AdminApplications() {
  const { user } = useAuth();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/application/admin/applications");

        setApplications(response.data.applications || []);
      } catch (error) {
        setError(
          error.response?.data?.message || "Failed to load applications.",
        );
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === "admin") {
      fetchApplications();
    } else {
      setLoading(false);
    }
  }, [user]);

  const getStatusClass = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-700";

      case "rejected":
        return "bg-red-100 text-red-700";

      case "cancelled":
        return "bg-gray-100 text-gray-600";

      case "pending":
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>

          <p className="mt-4 text-gray-600">Loading applications...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
        <div className="w-full max-w-md rounded-xl bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
            <FileText size={28} className="text-red-500" />
          </div>

          <h1 className="mt-5 text-2xl font-bold text-gray-800">
            Access Denied
          </h1>

          <p className="mt-2 text-gray-600">
            Only administrators can view all applications.
          </p>

          <Link
            to="/login"
            className="mt-6 inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
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
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link
            to="/admin/dashboard"
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
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Heading */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
              <FileText size={25} className="text-blue-600" />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                All Applications
              </h1>

              <p className="mt-1 text-gray-600">
                Monitor all rental applications.
              </p>
            </div>
          </div>

          <div className="rounded-lg bg-white px-5 py-3 shadow-sm">
            <p className="text-xs text-gray-500">Total Applications</p>

            <p className="mt-1 text-xl font-bold text-blue-600">
              {applications.length}
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Empty */}
        {applications.length === 0 ? (
          <div className="mt-7 rounded-xl bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-50">
              <FileText size={30} className="text-gray-300" />
            </div>

            <h2 className="mt-5 text-xl font-semibold text-gray-800">
              No Applications
            </h2>

            <p className="mt-2 text-gray-500">
              There are no rental applications yet.
            </p>
          </div>
        ) : (
          <div className="mt-7 space-y-5">
            {applications.map((application) => (
              <div
                key={application._id}
                className="overflow-hidden rounded-xl bg-white shadow-sm"
              >
                {/* Application Header */}
                <div className="border-b px-5 py-5 sm:px-6">
                  <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-50">
                        <FileText size={23} className="text-blue-600" />
                      </div>

                      <div>
                        <p className="text-xs text-gray-400">Application ID</p>

                        <p className="mt-1 break-all text-sm font-medium text-gray-700">
                          {application._id}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`w-fit rounded-full px-4 py-1.5 text-xs font-semibold capitalize ${getStatusClass(
                        application.status,
                      )}`}
                    >
                      {application.status || "pending"}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-2">
                  {/* Tenant */}
                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-5">
                    <div className="mb-4 flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100">
                        <User size={19} className="text-blue-600" />
                      </div>

                      <h2 className="font-semibold text-gray-800">
                        Tenant Information
                      </h2>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-400">Name</p>

                        <p className="mt-1 font-medium text-gray-800">
                          {application.tenant?.name || "Not available"}
                        </p>
                      </div>

                      <div className="flex items-start gap-2">
                        <Mail size={16} className="mt-0.5 text-gray-400" />

                        <div>
                          <p className="text-xs text-gray-400">Email</p>

                          <p className="text-sm text-gray-700">
                            {application.tenant?.email || "Not available"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <Phone size={16} className="mt-0.5 text-gray-400" />

                        <div>
                          <p className="text-xs text-gray-400">Phone</p>

                          <p className="text-sm text-gray-700">
                            {application.tenant?.phone || "Not available"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Property */}
                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-5">
                    <div className="mb-4 flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100">
                        <Building2 size={19} className="text-blue-600" />
                      </div>

                      <h2 className="font-semibold text-gray-800">
                        Property Information
                      </h2>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-400">Property</p>

                        <p className="mt-1 font-medium text-gray-800">
                          {application.property?.title || "Not available"}
                        </p>
                      </div>

                      <div className="flex items-start gap-2">
                        <MapPin size={16} className="mt-0.5 text-gray-400" />

                        <div>
                          <p className="text-xs text-gray-400">Location</p>

                          <p className="text-sm text-gray-700">
                            {application.property?.address || "Not available"}

                            {application.property?.city &&
                              `, ${application.property.city}`}
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-gray-400">Monthly Rent</p>

                        <p className="mt-1 font-semibold text-blue-600">
                          {application.property?.rent
                            ? `৳${application.property.rent}`
                            : "Not available"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Message */}
                <div className="px-5 pb-5 sm:px-6">
                  <div className="rounded-xl border border-gray-100 p-5">
                    <p className="text-sm font-semibold text-gray-700">
                      Tenant Message
                    </p>

                    <p className="mt-2 leading-6 text-gray-600">
                      {application.message || "No message provided."}
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex flex-col justify-between gap-4 border-t bg-gray-50 px-5 py-4 sm:flex-row sm:items-center sm:px-6">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <CalendarDays size={16} />

                    <span>
                      Applied:{" "}
                      {application.createdAt
                        ? new Date(application.createdAt).toLocaleString()
                        : "N/A"}
                    </span>
                  </div>

                  {application.property?._id && (
                    <Link
                      to={`/properties/${application.property._id}`}
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:border-blue-500 hover:text-blue-600"
                    >
                      <Eye size={17} />
                      View Property
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminApplications;

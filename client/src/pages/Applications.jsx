import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, FileText, User, Building2 } from "lucide-react";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";

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

        const response = await api.get("/application/admin/all");

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

  if (!user || user.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
        <div className="text-center">
          <FileText size={45} className="mx-auto text-gray-400" />

          <h1 className="mt-4 text-2xl font-bold text-gray-800">
            Access Denied
          </h1>

          <p className="mt-2 text-gray-600">
            Only admins can view all applications.
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
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <Link
            to="/admin/dashboard"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:border-blue-500 hover:text-blue-600"
          >
            <ArrowLeft size={17} />
            Back to Dashboard
          </Link>

          <Link to="/" className="text-2xl font-bold text-blue-600">
            RentEase
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50">
            <FileText size={24} className="text-blue-600" />
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

        {error && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {applications.length === 0 ? (
          <div className="mt-7 rounded-xl bg-white p-10 text-center shadow-sm">
            <FileText size={45} className="mx-auto text-gray-300" />

            <h2 className="mt-4 text-xl font-semibold text-gray-800">
              No Applications
            </h2>

            <p className="mt-2 text-gray-500">There are no applications yet.</p>
          </div>
        ) : (
          <div className="mt-7 overflow-hidden rounded-xl bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Tenant
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Property
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Rent
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Status
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Applied
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {applications.map((application) => (
                    <tr key={application._id} className="hover:bg-gray-50">
                      {/* Tenant */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50">
                            <User size={19} className="text-blue-600" />
                          </div>

                          <div>
                            <p className="font-semibold text-gray-800">
                              {application.tenant?.name || "Unknown"}
                            </p>

                            <p className="text-sm text-gray-500">
                              {application.tenant?.email || "No email"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Property */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <Building2 size={19} className="text-gray-400" />

                          <div>
                            <p className="font-medium text-gray-800">
                              {application.property?.title ||
                                "Unknown property"}
                            </p>

                            <p className="text-sm text-gray-500">
                              {application.property?.city || "Unknown city"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Rent */}
                      <td className="px-6 py-5">
                        <span className="font-semibold text-blue-600">
                          ৳{application.property?.rent || "N/A"}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-5">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusClass(
                            application.status,
                          )}`}
                        >
                          {application.status || "pending"}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-5 text-sm text-gray-500">
                        {application.createdAt
                          ? new Date(application.createdAt).toLocaleDateString()
                          : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminApplications;

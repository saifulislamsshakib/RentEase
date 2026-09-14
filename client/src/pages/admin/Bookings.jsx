import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CalendarDays } from "lucide-react";

import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

function Bookings() {
  const { user } = useAuth();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/booking/admin/bookings");

        setBookings(response.data.bookings || []);
      } catch (error) {
        setError(error.response?.data?.message || "Failed to load bookings.");
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === "admin") {
      fetchBookings();
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

    if (status === "completed") {
      return "bg-blue-100 text-blue-700";
    }

    return "bg-yellow-100 text-yellow-700";
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-gray-600">Loading bookings...</p>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">Access Denied</h1>

          <p className="mt-2 text-gray-600">
            Only administrators can view bookings.
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
    <div className="min-h-screen bg-gray-100 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-6xl">
        {/* Back */}
        <Link
          to="/admin/dashboard"
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:border-blue-500 hover:text-blue-600"
        >
          <ArrowLeft size={17} />
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="mt-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50">
            <CalendarDays size={24} className="text-blue-600" />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Booking Management
            </h1>

            <p className="mt-1 text-gray-600">
              Monitor all property visit bookings.
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">
            {error}
          </div>
        )}

        {/* Empty */}
        {bookings.length === 0 ? (
          <div className="mt-7 rounded-xl bg-white p-10 text-center shadow-sm">
            <CalendarDays size={40} className="mx-auto text-gray-400" />

            <h2 className="mt-4 text-xl font-semibold text-gray-800">
              No Bookings Found
            </h2>

            <p className="mt-2 text-gray-500">
              There are currently no property visit bookings.
            </p>
          </div>
        ) : (
          <div className="mt-7 space-y-5">
            {bookings.map((booking) => (
              <div
                key={booking._id}
                className="rounded-xl bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col justify-between gap-5 md:flex-row">
                  {/* Booking Information */}
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-gray-800">
                      {booking.property?.title || "Property"}
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      {booking.property?.address || "Address unavailable"}

                      {booking.property?.city && `, ${booking.property.city}`}
                    </p>

                    {/* Tenant */}
                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                      <div className="rounded-lg bg-gray-50 p-4">
                        <p className="text-xs text-gray-500">Tenant</p>

                        <p className="mt-1 font-semibold text-gray-800">
                          {booking.tenant?.name || "Unknown Tenant"}
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                          {booking.tenant?.email || "No email"}
                        </p>

                        {booking.tenant?.phone && (
                          <p className="mt-1 text-sm text-gray-500">
                            {booking.tenant.phone}
                          </p>
                        )}
                      </div>

                      {/* Visit Date */}
                      <div className="rounded-lg bg-gray-50 p-4">
                        <p className="text-xs text-gray-500">
                          Visit Date & Time
                        </p>

                        <p className="mt-1 font-semibold text-gray-800">
                          {booking.visitDate
                            ? new Date(booking.visitDate).toLocaleString()
                            : "Not specified"}
                        </p>
                      </div>
                    </div>

                    {/* Message */}
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700">
                        Message
                      </p>

                      <p className="mt-1 text-gray-600">
                        {booking.message || "No message provided."}
                      </p>
                    </div>

                    {/* Created */}
                    <p className="mt-4 text-xs text-gray-400">
                      Booked on{" "}
                      {booking.createdAt
                        ? new Date(booking.createdAt).toLocaleString()
                        : "Unknown"}
                    </p>
                  </div>

                  {/* Status */}
                  <div>
                    <span
                      className={`inline-block rounded-full px-4 py-2 text-sm font-semibold capitalize ${getStatusClass(
                        booking.status,
                      )}`}
                    >
                      {booking.status || "pending"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Bookings;

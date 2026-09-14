import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Building2,
  User,
  CheckCircle,
  XCircle,
} from "lucide-react";

import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

function OwnerBookings() {
  const { user } = useAuth();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/booking/owner/bookings");

        setBookings(response.data.bookings || []);
      } catch (error) {
        setError(error.response?.data?.message || "Failed to load bookings.");
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === "owner") {
      fetchBookings();
    } else {
      setLoading(false);
    }
  }, [user]);

  const updateBookingStatus = async (bookingId, status) => {
    const action = status === "approved" ? "approve" : "reject";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} this visit booking?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(bookingId);
      setError("");

      const response = await api.put(`/booking/${bookingId}/status`, {
        status,
      });

      setBookings((prev) =>
        prev.map((booking) =>
          booking._id === bookingId
            ? response.data.booking || {
                ...booking,
                status,
              }
            : booking,
        ),
      );
    } catch (error) {
      setError(error.response?.data?.message || `Failed to ${action} booking.`);
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

  if (!user || user.role !== "owner") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
        <div className="text-center">
          <CalendarDays size={45} className="mx-auto text-gray-400" />

          <h1 className="mt-4 text-2xl font-bold text-gray-800">
            Access Denied
          </h1>

          <p className="mt-2 text-gray-600">
            Only property owners can view bookings.
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
            <CalendarDays size={24} className="text-blue-600" />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-gray-800">Visit Bookings</h1>

            <p className="mt-1 text-gray-600">
              Manage tenant property visit requests.
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
        {bookings.length === 0 ? (
          <div className="mt-7 rounded-xl bg-white p-10 text-center shadow-sm">
            <CalendarDays size={45} className="mx-auto text-gray-300" />

            <h2 className="mt-4 text-xl font-semibold text-gray-800">
              No Visit Bookings
            </h2>

            <p className="mt-2 text-gray-500">
              No tenants have requested a property visit yet.
            </p>
          </div>
        ) : (
          <div className="mt-7 space-y-5">
            {bookings.map((booking) => (
              <div
                key={booking._id}
                className="rounded-xl bg-white p-6 shadow-sm"
              >
                {/* Top Section */}
                <div className="flex flex-col justify-between gap-4 sm:flex-row">
                  {/* Tenant */}
                  <div className="flex gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-50">
                      <User size={23} className="text-blue-600" />
                    </div>

                    <div>
                      <h2 className="text-lg font-semibold text-gray-800">
                        {booking.tenant?.name || "Tenant"}
                      </h2>

                      <p className="mt-1 text-sm text-gray-500">
                        {booking.tenant?.email || "Email unavailable"}
                      </p>

                      {booking.tenant?.phone && (
                        <p className="mt-1 text-sm text-gray-500">
                          Phone: {booking.tenant.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Status */}
                  <span
                    className={`h-fit w-fit rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusClass(
                      booking.status,
                    )}`}
                  >
                    {booking.status || "pending"}
                  </span>
                </div>

                {/* Property */}
                <div className="mt-5 rounded-lg bg-gray-50 p-4">
                  <div className="flex items-start gap-3">
                    <Building2 size={21} className="mt-0.5 text-blue-600" />

                    <div>
                      <p className="font-semibold text-gray-800">
                        {booking.property?.title || "Property"}
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        {booking.property?.address || "Address unavailable"}

                        {booking.property?.city && `, ${booking.property.city}`}
                      </p>

                      {booking.property?.rent && (
                        <p className="mt-2 text-sm font-semibold text-blue-600">
                          Rent: ৳{booking.property.rent}
                          /month
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Visit Date */}
                <div className="mt-5 rounded-lg border border-blue-100 bg-blue-50 p-4">
                  <div className="flex items-center gap-3">
                    <CalendarDays size={22} className="text-blue-600" />

                    <div>
                      <p className="text-xs font-medium text-blue-600">
                        Requested Visit Date
                      </p>

                      <p className="mt-1 font-semibold text-gray-800">
                        {booking.visitDate
                          ? new Date(booking.visitDate).toLocaleString()
                          : "Date unavailable"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tenant Message */}
                <div className="mt-5">
                  <p className="text-sm font-semibold text-gray-700">
                    Tenant Message
                  </p>

                  <p className="mt-2 rounded-lg bg-gray-50 p-4 text-sm leading-6 text-gray-600">
                    {booking.message || "No message provided."}
                  </p>
                </div>

                {/* Created */}
                {booking.createdAt && (
                  <p className="mt-4 text-xs text-gray-400">
                    Requested on {new Date(booking.createdAt).toLocaleString()}
                  </p>
                )}

                {/* Actions */}
                {booking.status === "pending" && (
                  <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={() =>
                        updateBookingStatus(booking._id, "approved")
                      }
                      disabled={actionLoading === booking._id}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <CheckCircle size={18} />

                      {actionLoading === booking._id
                        ? "Updating..."
                        : "Approve Visit"}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        updateBookingStatus(booking._id, "rejected")
                      }
                      disabled={actionLoading === booking._id}
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-300 px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <XCircle size={18} />
                      Reject Visit
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

export default OwnerBookings;

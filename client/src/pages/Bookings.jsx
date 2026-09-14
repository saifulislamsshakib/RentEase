import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CalendarDays, Building2, XCircle } from "lucide-react";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function Bookings() {
  const { user } = useAuth();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/booking/my-bookings");

        setBookings(response.data.bookings || []);
      } catch (error) {
        setError(error.response?.data?.message || "Failed to load bookings.");
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === "tenant") {
      fetchBookings();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleCancel = async (bookingId) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this booking?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setCancelLoading(bookingId);
      setError("");

      await api.put(`/booking/${bookingId}/cancel`);

      setBookings((prev) =>
        prev.map((booking) =>
          booking._id === bookingId
            ? {
                ...booking,
                status: "cancelled",
              }
            : booking,
        ),
      );
    } catch (error) {
      setError(error.response?.data?.message || "Failed to cancel booking.");
    } finally {
      setCancelLoading(null);
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

  if (!user || user.role !== "tenant") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
        <div className="text-center">
          <CalendarDays size={45} className="mx-auto text-gray-400" />

          <h1 className="mt-4 text-2xl font-bold text-gray-800">
            Access Denied
          </h1>

          <p className="mt-2 text-gray-600">Only tenants can view bookings.</p>

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

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* Heading */}
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50">
            <CalendarDays size={24} className="text-blue-600" />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-gray-800">My Bookings</h1>

            <p className="mt-1 text-gray-600">
              Manage your property visit bookings.
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
            <CalendarDays size={42} className="mx-auto text-gray-400" />

            <h2 className="mt-4 text-xl font-semibold text-gray-800">
              No Bookings Yet
            </h2>

            <p className="mt-2 text-gray-500">
              You haven't booked any property visit yet.
            </p>

            <Link
              to="/properties"
              className="mt-6 inline-flex rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              Browse Properties
            </Link>
          </div>
        ) : (
          <div className="mt-7 space-y-5">
            {bookings.map((booking) => (
              <div
                key={booking._id}
                className="rounded-xl bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-5 md:flex-row">
                  {/* Property Image */}
                  {booking.property?.images?.length > 0 ? (
                    <img
                      src={booking.property.images[0]}
                      alt={booking.property.title}
                      className="h-44 w-full rounded-lg object-cover md:h-36 md:w-52"
                    />
                  ) : (
                    <div className="flex h-44 w-full shrink-0 items-center justify-center rounded-lg bg-gray-200 md:h-36 md:w-52">
                      <Building2 size={40} className="text-gray-400" />
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex flex-col justify-between gap-3 sm:flex-row">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-800">
                          {booking.property?.title || "Property"}
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                          {booking.property?.address || "Address unavailable"}

                          {booking.property?.city &&
                            `, ${booking.property.city}`}
                        </p>
                      </div>

                      <span
                        className={`h-fit w-fit rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusClass(
                          booking.status,
                        )}`}
                      >
                        {booking.status || "pending"}
                      </span>
                    </div>

                    {/* Visit Date */}
                    <div className="mt-5 rounded-lg bg-blue-50 p-4">
                      <p className="text-xs font-medium text-blue-600">
                        Visit Date & Time
                      </p>

                      <p className="mt-1 font-semibold text-gray-800">
                        {booking.visitDate
                          ? new Date(booking.visitDate).toLocaleString()
                          : "Not specified"}
                      </p>
                    </div>

                    {/* Rent */}
                    <p className="mt-4 text-sm font-semibold text-blue-600">
                      Monthly Rent: ৳{booking.property?.rent || "N/A"}
                    </p>

                    {/* Message */}
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700">
                        Your Message
                      </p>

                      <p className="mt-1 text-sm leading-6 text-gray-600">
                        {booking.message || "No message provided."}
                      </p>
                    </div>

                    {/* Created */}
                    <p className="mt-3 text-xs text-gray-400">
                      Booked on{" "}
                      {booking.createdAt
                        ? new Date(booking.createdAt).toLocaleString()
                        : "Unknown"}
                    </p>

                    {/* Actions */}
                    <div className="mt-5 flex flex-wrap gap-3">
                      {booking.property?._id && (
                        <Link
                          to={`/properties/${booking.property._id}`}
                          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-blue-500 hover:text-blue-600"
                        >
                          View Property
                        </Link>
                      )}

                      {booking.status === "pending" && (
                        <button
                          type="button"
                          onClick={() => handleCancel(booking._id)}
                          disabled={cancelLoading === booking._id}
                          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 transition hover:border-red-400 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <XCircle size={17} />

                          {cancelLoading === booking._id
                            ? "Cancelling..."
                            : "Cancel Booking"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Bookings;

import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Building2, CalendarDays } from "lucide-react";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function CreateBooking() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const propertyId = searchParams.get("propertyId");

  const [property, setProperty] = useState(null);
  const [visitDate, setVisitDate] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchProperty = async () => {
      if (!propertyId) {
        setError("Property ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/property/${propertyId}`);

        setProperty(response.data.property);
      } catch (error) {
        setError(error.response?.data?.message || "Failed to load property.");
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [propertyId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!visitDate) {
      setError("Please select a visit date and time.");
      return;
    }

    const selectedDate = new Date(visitDate);

    if (selectedDate <= new Date()) {
      setError("Visit date must be in the future.");
      return;
    }

    try {
      setSubmitting(true);

      const response = await api.post(`/booking/create/${propertyId}`, {
        visitDate: selectedDate.toISOString(),
        message: message.trim(),
      });

      setSuccess(
        response.data.message || "Property visit booking created successfully.",
      );

      setTimeout(() => {
        navigate("/bookings");
      }, 1200);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to create booking.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">Login Required</h1>

          <p className="mt-2 text-gray-600">
            Please login as a tenant to book a property visit.
          </p>

          <Link
            to="/login"
            className="mt-5 inline-flex rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (user.role !== "tenant") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">Access Denied</h1>

          <p className="mt-2 text-gray-600">
            Only tenants can book property visits.
          </p>

          <Link
            to="/properties"
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            <ArrowLeft size={17} />
            Back to Properties
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-gray-600">Loading property...</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
        <div className="text-center">
          <Building2 size={45} className="mx-auto text-gray-400" />

          <h1 className="mt-4 text-2xl font-bold text-gray-800">
            Property Not Found
          </h1>

          <Link
            to="/properties"
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            <ArrowLeft size={17} />
            Back to Properties
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 sm:px-6">
          <Link
            to={`/properties/${propertyId}`}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:border-blue-500 hover:text-blue-600"
          >
            <ArrowLeft size={17} />
            Back
          </Link>

          <Link to="/" className="text-2xl font-bold text-blue-600">
            RentEase
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <div className="rounded-xl bg-white p-6 shadow-sm sm:p-8">
          {/* Heading */}
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50">
              <CalendarDays size={23} className="text-blue-600" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Book a Property Visit
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Choose a convenient date and time.
              </p>
            </div>
          </div>

          {/* Property */}
          <div className="mt-7 rounded-lg bg-gray-50 p-5">
            <div className="flex gap-4">
              {property.images?.length > 0 ? (
                <img
                  src={property.images[0]}
                  alt={property.title}
                  className="h-24 w-28 rounded-lg object-cover"
                />
              ) : (
                <div className="flex h-24 w-28 shrink-0 items-center justify-center rounded-lg bg-gray-200">
                  <Building2 size={28} className="text-gray-400" />
                </div>
              )}

              <div>
                <h2 className="font-semibold text-gray-800">
                  {property.title}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {property.address}, {property.city}
                </p>

                <p className="mt-2 font-semibold text-blue-600">
                  ৳{property.rent} / month
                </p>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="mt-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-600">
              {success}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            {/* Date */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Visit Date & Time
              </label>

              <input
                type="datetime-local"
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
                min={new Date(Date.now() + 60000).toISOString().slice(0, 16)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              />

              <p className="mt-2 text-xs text-gray-400">
                Please select a future date and time.
              </p>
            </div>

            {/* Message */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Message
                <span className="font-normal text-gray-400"> (Optional)</span>
              </label>

              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows="5"
                placeholder="Write a message to the property owner..."
                className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-blue-600 px-5 py-3.5 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Booking Visit..." : "Book Visit"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default CreateBooking;

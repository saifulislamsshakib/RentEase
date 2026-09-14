import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import {
  ArrowLeft,
  Building2,
  FileText,
  CheckCircle,
  CalendarDays,
} from "lucide-react";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function CreateApplication() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const propertyId = searchParams.get("propertyId");

  const [property, setProperty] = useState(null);

  // New application fields
  const [preferredStartDate, setPreferredStartDate] = useState("");

  const [rentalDuration, setRentalDuration] = useState("12");

  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // =====================================================
  // Fetch Property
  // =====================================================

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

  // =====================================================
  // Submit Application
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    // Validate start date
    if (!preferredStartDate) {
      setError("Please select your preferred start date.");
      return;
    }

    // Validate duration
    const duration = Number(rentalDuration);

    if (!Number.isInteger(duration) || duration < 1 || duration > 120) {
      setError("Rental duration must be between 1 and 120 months.");
      return;
    }

    try {
      setSubmitting(true);

      await api.post(`/application/create/${propertyId}`, {
        preferredStartDate,
        rentalDuration: duration,
        message: message.trim(),
      });

      // Show success message
      setSuccess(true);

      // Clear form
      setMessage("");

      // Redirect to My Applications
      setTimeout(() => {
        navigate("/my-applications");
      }, 2000);
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to submit application.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =====================================================
  // Login Required
  // =====================================================

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">Login Required</h1>

          <p className="mt-2 text-gray-600">
            Please login as a tenant to apply for a property.
          </p>

          <Link
            to="/login"
            className="mt-5 inline-flex rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  // =====================================================
  // Tenant Only
  // =====================================================

  if (user.role !== "tenant") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">Access Denied</h1>

          <p className="mt-2 text-gray-600">
            Only tenants can apply for properties.
          </p>

          <Link
            to="/properties"
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            <ArrowLeft size={17} />
            Back to Properties
          </Link>
        </div>
      </div>
    );
  }

  // =====================================================
  // Loading
  // =====================================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-gray-600">Loading property...</p>
      </div>
    );
  }

  // =====================================================
  // Property Not Found
  // =====================================================

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
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            <ArrowLeft size={17} />
            Back to Properties
          </Link>
        </div>
      </div>
    );
  }

  // =====================================================
  // Main Page
  // =====================================================

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6">
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

      {/* Main */}
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <div className="rounded-xl bg-white p-6 shadow-sm sm:p-8">
          {/* =================================================
              Success Message
          ================================================= */}

          {success && (
            <div className="mb-6 flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-4">
              <CheckCircle
                size={25}
                className="mt-0.5 shrink-0 text-green-600"
              />

              <div>
                <p className="font-semibold text-green-700">
                  Application submitted successfully.
                </p>

                <p className="mt-1 text-sm text-green-600">
                  Your application has been sent to the property owner.
                </p>

                <p className="mt-1 text-xs text-green-500">
                  Redirecting to your applications...
                </p>
              </div>
            </div>
          )}

          {/* =================================================
              Heading
          ================================================= */}

          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50">
              <FileText size={23} className="text-blue-600" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Apply for Property
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Provide your rental preferences to the property owner.
              </p>
            </div>
          </div>

          {/* =================================================
              Property Summary
          ================================================= */}

          <div className="mt-7 rounded-lg bg-gray-50 p-5">
            <div className="flex gap-4">
              {property.images?.length > 0 ? (
                <img
                  src={property.images[0]}
                  alt={property.title}
                  className="h-24 w-28 shrink-0 rounded-lg object-cover"
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

          {/* =================================================
              Error
          ================================================= */}

          {error && (
            <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* =================================================
              Application Form
          ================================================= */}

          <form onSubmit={handleSubmit} className="mt-7 space-y-6">
            {/* =========================
                Preferred Start Date
            ========================= */}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Preferred Rental Start Date
              </label>

              <div className="relative">
                <CalendarDays
                  size={19}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="date"
                  value={preferredStartDate}
                  onChange={(e) => setPreferredStartDate(e.target.value)}
                  disabled={submitting || success}
                  className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-4 text-gray-700 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
                />
              </div>

              <p className="mt-2 text-xs text-gray-400">
                Select the date you want to start renting this property.
              </p>
            </div>

            {/* =========================
                Rental Duration
            ========================= */}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Rental Duration
              </label>

              <select
                value={rentalDuration}
                onChange={(e) => setRentalDuration(e.target.value)}
                disabled={submitting || success}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-700 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
              >
                <option value="1">1 Month</option>

                <option value="3">3 Months</option>

                <option value="6">6 Months</option>

                <option value="12">12 Months</option>

                <option value="24">24 Months</option>

                <option value="36">36 Months</option>
              </select>

              <p className="mt-2 text-xs text-gray-400">
                Select how long you want to rent the property.
              </p>
            </div>

            {/* =========================
                Message
            ========================= */}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Message to Owner
                <span className="ml-1 text-gray-400">(Optional)</span>
              </label>

              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows="6"
                disabled={submitting || success}
                placeholder="Tell the owner a little about yourself and why you are interested in this property..."
                className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-gray-700 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
              />

              <p className="mt-2 text-xs text-gray-400">
                You can add any additional information for the property owner.
              </p>
            </div>

            {/* =========================
                Summary
            ========================= */}

            {preferredStartDate && (
              <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
                <h3 className="text-sm font-semibold text-blue-800">
                  Rental Preference Summary
                </h3>

                <div className="mt-3 space-y-2 text-sm text-blue-700">
                  <p>
                    <span className="font-medium">Start Date:</span>{" "}
                    {new Date(
                      `${preferredStartDate}T00:00:00`,
                    ).toLocaleDateString()}
                  </p>

                  <p>
                    <span className="font-medium">Duration:</span>{" "}
                    {rentalDuration}{" "}
                    {Number(rentalDuration) === 1 ? "Month" : "Months"}
                  </p>

                  <p>
                    <span className="font-medium">Monthly Rent:</span> ৳
                    {property.rent}
                  </p>
                </div>
              </div>
            )}

            {/* =========================
                Submit Button
            ========================= */}

            <button
              type="submit"
              disabled={submitting || success}
              className="w-full rounded-lg bg-blue-600 px-5 py-3.5 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting
                ? "Submitting Application..."
                : success
                  ? "Application Submitted"
                  : "Submit Application"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default CreateApplication;

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  ArrowLeft,
  Building2,
  Plus,
  Pencil,
  Trash2,
  FileText,
  CalendarDays,
  MessageSquare,
  User,
  DollarSign,
  Wrench,
} from "lucide-react";

import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

function OwnerDashboard() {
  const { user } = useAuth();

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(null);

  // ==================================================
  // FETCH OWNER PROPERTIES
  // ==================================================

  useEffect(() => {
    const fetchMyProperties = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/property/my-properties");

        setProperties(response.data.properties || []);
      } catch (error) {
        setError(
          error.response?.data?.message || "Failed to load your properties.",
        );
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === "owner") {
      fetchMyProperties();
    } else {
      setLoading(false);
    }
  }, [user]);

  // ==================================================
  // DELETE PROPERTY
  // ==================================================

  const handleDelete = async (propertyId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this property?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleteLoading(propertyId);
      setError("");

      await api.delete(`/property/${propertyId}`);

      setProperties((prev) =>
        prev.filter((property) => property._id !== propertyId),
      );
    } catch (error) {
      setError(error.response?.data?.message || "Failed to delete property.");
    } finally {
      setDeleteLoading(null);
    }
  };

  // ==================================================
  // LOADING
  // ==================================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  // ==================================================
  // ACCESS DENIED
  // ==================================================

  if (!user || user.role !== "owner") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">Access Denied</h1>

          <p className="mt-2 text-gray-600">
            Only property owners can access this dashboard.
          </p>

          <Link
            to="/login"
            className="mt-5 inline-flex rounded-lg bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700"
          >
            Login
          </Link>
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
            TOP NAVIGATION
        ================================================== */}

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          {/* BACK HOME */}

          <Link
            to="/"
            className="inline-flex w-fit items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:border-blue-500 hover:text-blue-600"
          >
            <ArrowLeft size={17} />
            Back Home
          </Link>

          {/* NAVIGATION */}

          <div className="flex flex-wrap gap-3">
            {/* APPLICATIONS */}

            <Link
              to="/owner/applications"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-blue-500 hover:text-blue-600"
            >
              <FileText size={18} />
              Applications
            </Link>

            {/* BOOKINGS */}

            <Link
              to="/owner/bookings"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-blue-500 hover:text-blue-600"
            >
              <CalendarDays size={18} />
              Bookings
            </Link>

            {/* COMPLAINTS */}

            <Link
              to="/owner/complaints"
              className="inline-flex items-center gap-2 rounded-lg border border-orange-300 bg-orange-50 px-4 py-2.5 text-sm font-semibold text-orange-700 shadow-sm transition hover:border-orange-500 hover:bg-orange-100"
            >
              <MessageSquare size={18} />
              Complaints
            </Link>

            {/* MAINTENANCE */}

            <Link
              to="/owner/maintenance"
              className="inline-flex items-center gap-2 rounded-lg border border-cyan-300 bg-cyan-50 px-4 py-2.5 text-sm font-semibold text-cyan-700 shadow-sm transition hover:border-cyan-500 hover:bg-cyan-100"
            >
              <Wrench size={18} />
              Maintenance
            </Link>

            {/* ADD PROPERTY */}

            <Link
              to="/owner/properties/create"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              <Plus size={18} />
              Add Property
            </Link>

            {/* RENTAL CONTRACTS */}

            <Link
              to="/owner/contracts"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Rental Contracts
            </Link>

            {/* CREATE CONTRACT */}

            <Link
              to="/owner/contracts/create"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Create Contract
            </Link>

            {/* PAYMENTS */}

            <Link
              to="/owner/properties"
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            >
              <DollarSign size={18} />
              Payments
            </Link>

            {/* PROFILE */}

            <Link
              to="/owner/profile"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-blue-500 hover:text-blue-600"
            >
              <User size={18} />
              Profile
            </Link>
          </div>
        </div>

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="mt-7 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50">
            <Building2 size={26} className="text-blue-600" />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Owner Dashboard
            </h1>

            <p className="mt-1 text-gray-600">Welcome, {user.name}</p>
          </div>
        </div>

        {/* ==================================================
            ERROR
        ================================================== */}

        {error && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">
            {error}
          </div>
        )}

        {/* ==================================================
            SUMMARY CARDS
        ================================================== */}

        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* TOTAL PROPERTIES */}

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Total Properties</p>

            <p className="mt-2 text-3xl font-bold text-gray-800">
              {properties.length}
            </p>
          </div>

          {/* APPLICATIONS */}

          <Link
            to="/owner/applications"
            className="rounded-xl bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                <FileText size={21} className="text-blue-600" />
              </div>

              <div>
                <p className="font-semibold text-gray-800">Applications</p>

                <p className="text-sm text-gray-500">
                  View tenant applications
                </p>
              </div>
            </div>
          </Link>

          {/* BOOKINGS */}

          <Link
            to="/owner/bookings"
            className="rounded-xl bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                <CalendarDays size={21} className="text-blue-600" />
              </div>

              <div>
                <p className="font-semibold text-gray-800">Visit Bookings</p>

                <p className="text-sm text-gray-500">Manage property visits</p>
              </div>
            </div>
          </Link>

          {/* COMPLAINTS */}

          <Link
            to="/owner/complaints"
            className="rounded-xl bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50">
                <MessageSquare size={21} className="text-orange-600" />
              </div>

              <div>
                <p className="font-semibold text-gray-800">Complaints</p>

                <p className="text-sm text-gray-500">
                  Manage tenant complaints
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* ==================================================
            MAINTENANCE CARD
        ================================================== */}

        <div className="mt-6">
          <Link
            to="/owner/maintenance"
            className="block rounded-xl border border-cyan-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-50">
                  <Wrench size={25} className="text-cyan-600" />
                </div>

                <div>
                  <p className="text-lg font-semibold text-gray-800">
                    Maintenance Requests
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    View tenant maintenance requests and update their status.
                  </p>
                </div>
              </div>

              <span className="inline-flex w-fit items-center rounded-lg border border-cyan-200 bg-cyan-50 px-5 py-2.5 text-sm font-semibold text-cyan-700 transition hover:border-cyan-400 hover:bg-cyan-100">
                View Maintenance
              </span>
            </div>
          </Link>
        </div>

        {/* ==================================================
            PAYMENTS CARD
        ================================================== */}

        <div className="mt-6">
          <Link
            to="/owner/properties"
            className="block rounded-xl bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
                  <DollarSign size={25} className="text-emerald-600" />
                </div>

                <div>
                  <p className="text-lg font-semibold text-gray-800">
                    Rent Payments
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    Manage rent payments and confirm security deposits.
                  </p>
                </div>
              </div>

              <span className="inline-flex w-fit items-center rounded-lg border border-emerald-200 bg-emerald-50 px-5 py-2.5 text-sm font-semibold text-emerald-700 transition hover:border-emerald-400 hover:bg-emerald-100">
                View Payments
              </span>
            </div>
          </Link>
        </div>

        {/* ==================================================
            PROPERTIES
        ================================================== */}

        <div className="mt-8">
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-gray-800">
              My Properties
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Manage the properties you have listed.
            </p>
          </div>

          {/* NO PROPERTIES */}

          {properties.length === 0 ? (
            <div className="rounded-xl bg-white p-10 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                <Building2 size={28} className="text-gray-400" />
              </div>

              <h3 className="mt-5 text-xl font-semibold text-gray-800">
                No Properties Yet
              </h3>

              <p className="mt-2 text-gray-500">
                You haven't added any properties yet.
              </p>

              <Link
                to="/owner/properties/create"
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
              >
                <Plus size={18} />
                Add Your First Property
              </Link>
            </div>
          ) : (
            /* PROPERTY LIST */

            <div className="grid gap-6 md:grid-cols-2">
              {properties.map((property) => (
                <div
                  key={property._id}
                  className="overflow-hidden rounded-xl bg-white shadow-sm"
                >
                  {/* IMAGE */}

                  {property.images?.length > 0 ? (
                    <img
                      src={property.images[0]}
                      alt={property.title}
                      className="h-56 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-56 items-center justify-center bg-gray-200 text-gray-400">
                      No Image Available
                    </div>
                  )}

                  {/* CONTENT */}

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800">
                          {property.title}
                        </h3>

                        <p className="mt-1 text-sm text-gray-500">
                          {property.address}, {property.city}
                        </p>
                      </div>

                      {/* AVAILABILITY */}

                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                          property.isAvailable
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {property.isAvailable ? "Available" : "Unavailable"}
                      </span>
                    </div>

                    {/* RENT */}

                    <p className="mt-4 text-lg font-bold text-blue-600">
                      ৳{property.rent} / month
                    </p>

                    {/* BEDROOMS / BATHROOMS */}

                    <div className="mt-3 flex gap-4 text-sm text-gray-600">
                      <span>{property.bedrooms} Bedrooms</span>

                      <span>{property.bathrooms} Bathrooms</span>
                    </div>

                    {/* ACTIONS */}

                    <div className="mt-5 flex gap-3">
                      {/* VIEW */}

                      <Link
                        to={`/properties/${property._id}`}
                        className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-center text-sm font-semibold text-gray-700 transition hover:border-blue-500 hover:text-blue-600"
                      >
                        View
                      </Link>

                      {/* EDIT */}

                      <Link
                        to={`/owner/properties/edit/${property._id}`}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-blue-500 hover:bg-gray-50"
                      >
                        <Pencil size={17} />
                        Edit
                      </Link>

                      {/* DELETE */}

                      <button
                        type="button"
                        onClick={() => handleDelete(property._id)}
                        disabled={deleteLoading === property._id}
                        title="Delete property"
                        className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-4 py-2.5 text-gray-600 transition hover:border-red-400 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default OwnerDashboard;

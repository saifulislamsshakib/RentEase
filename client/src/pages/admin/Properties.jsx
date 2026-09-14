import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  MapPin,
  User,
  Mail,
  Eye,
  Image as ImageIcon,
} from "lucide-react";

import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

function AdminProperties() {
  const { user } = useAuth();

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/property/admin/all");

        setProperties(response.data.properties || []);
      } catch (error) {
        setError(error.response?.data?.message || "Failed to load properties.");
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === "admin") {
      fetchProperties();
    } else {
      setLoading(false);
    }
  }, [user]);

  const formatRent = (rent) => {
    if (!rent) {
      return "N/A";
    }

    return `৳${Number(rent).toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>

          <p className="mt-4 text-gray-600">Loading properties...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
        <div className="w-full max-w-md rounded-xl bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
            <Building2 size={28} className="text-red-500" />
          </div>

          <h1 className="mt-5 text-2xl font-bold text-gray-800">
            Access Denied
          </h1>

          <p className="mt-2 text-gray-600">
            Only administrators can view all properties.
          </p>

          <Link
            to="/login"
            className="mt-6 inline-flex rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
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
        {/* Heading */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
              <Building2 size={25} className="text-blue-600" />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                All Properties
              </h1>

              <p className="mt-1 text-gray-600">
                Monitor all rental properties on RentEase.
              </p>
            </div>
          </div>

          <div className="rounded-lg bg-white px-5 py-3 shadow-sm">
            <p className="text-xs text-gray-500">Total Properties</p>

            <p className="mt-1 text-xl font-bold text-blue-600">
              {properties.length}
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
        {properties.length === 0 ? (
          <div className="mt-7 rounded-xl bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-50">
              <Building2 size={30} className="text-gray-300" />
            </div>

            <h2 className="mt-5 text-xl font-semibold text-gray-800">
              No Properties
            </h2>

            <p className="mt-2 text-gray-500">
              There are no properties available yet.
            </p>
          </div>
        ) : (
          <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {properties.map((property) => (
              <div
                key={property._id}
                className="overflow-hidden rounded-xl bg-white shadow-sm transition hover:shadow-md"
              >
                {/* Image */}
                <div className="relative h-52 bg-gray-100">
                  {property.images?.length > 0 ? (
                    <img
                      src={property.images[0]}
                      alt={property.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <div className="text-center">
                        <ImageIcon
                          size={38}
                          className="mx-auto text-gray-300"
                        />

                        <p className="mt-2 text-sm text-gray-400">No image</p>
                      </div>
                    </div>
                  )}

                  {/* Availability */}
                  <div className="absolute right-3 top-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        property.isAvailable
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {property.isAvailable ? "Available" : "Unavailable"}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="line-clamp-2 text-lg font-bold text-gray-800">
                        {property.title || "Untitled Property"}
                      </h2>

                      <p className="mt-1 text-sm capitalize text-gray-500">
                        {property.propertyType || "Property"}
                      </p>
                    </div>

                    <p className="shrink-0 font-bold text-blue-600">
                      {formatRent(property.rent)}
                    </p>
                  </div>

                  {/* Location */}
                  <div className="mt-4 flex items-start gap-2">
                    <MapPin
                      size={17}
                      className="mt-0.5 shrink-0 text-gray-400"
                    />

                    <p className="text-sm text-gray-600">
                      {property.address || "Address unavailable"}

                      {property.city && `, ${property.city}`}
                    </p>
                  </div>

                  {/* Details */}
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-gray-50 p-3">
                      <p className="text-xs text-gray-400">Bedrooms</p>

                      <p className="mt-1 font-semibold text-gray-700">
                        {property.bedrooms ?? "N/A"}
                      </p>
                    </div>

                    <div className="rounded-lg bg-gray-50 p-3">
                      <p className="text-xs text-gray-400">Bathrooms</p>

                      <p className="mt-1 font-semibold text-gray-700">
                        {property.bathrooms ?? "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* Owner */}
                  <div className="mt-4 border-t pt-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Property Owner
                    </p>

                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50">
                        <User size={17} className="text-blue-600" />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-800">
                          {property.owner?.name || "Unknown Owner"}
                        </p>

                        <div className="flex items-center gap-1">
                          <Mail size={13} className="text-gray-400" />

                          <p className="truncate text-xs text-gray-500">
                            {property.owner?.email || "Email unavailable"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-5">
                    <Link
                      to={`/properties/${property._id}`}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-blue-500 hover:text-blue-600"
                    >
                      <Eye size={17} />
                      View Property
                    </Link>
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

export default AdminProperties;

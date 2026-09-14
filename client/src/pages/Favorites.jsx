import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Heart, Building2, MapPin, Trash2 } from "lucide-react";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function Favorites() {
  const { user } = useAuth();

  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removeLoading, setRemoveLoading] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/favorite");

        setFavorites(response.data.favorites || []);
      } catch (error) {
        setError(error.response?.data?.message || "Failed to load favorites.");
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === "tenant") {
      fetchFavorites();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleRemove = async (propertyId) => {
    const confirmed = window.confirm("Remove this property from favorites?");

    if (!confirmed) {
      return;
    }

    try {
      setRemoveLoading(propertyId);
      setError("");

      await api.delete(`/favorite/${propertyId}`);

      setFavorites((prev) =>
        prev.filter((favorite) => favorite.property?._id !== propertyId),
      );
    } catch (error) {
      setError(error.response?.data?.message || "Failed to remove favorite.");
    } finally {
      setRemoveLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-gray-600">Loading favorites...</p>
      </div>
    );
  }

  if (!user || user.role !== "tenant") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
        <div className="text-center">
          <Heart size={45} className="mx-auto text-gray-400" />

          <h1 className="mt-4 text-2xl font-bold text-gray-800">
            Access Denied
          </h1>

          <p className="mt-2 text-gray-600">Only tenants can view favorites.</p>

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
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-red-50">
            <Heart size={24} className="text-red-500" fill="currentColor" />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-gray-800">My Favorites</h1>

            <p className="mt-1 text-gray-600">Properties you have saved.</p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Empty */}
        {favorites.length === 0 ? (
          <div className="mt-7 rounded-xl bg-white p-10 text-center shadow-sm">
            <Heart size={45} className="mx-auto text-gray-300" />

            <h2 className="mt-4 text-xl font-semibold text-gray-800">
              No Favorite Properties
            </h2>

            <p className="mt-2 text-gray-500">
              You haven't saved any property yet.
            </p>

            <Link
              to="/properties"
              className="mt-6 inline-flex rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              Browse Properties
            </Link>
          </div>
        ) : (
          <div className="mt-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {favorites.map((favorite) => {
              const property = favorite.property;

              if (!property) {
                return null;
              }

              return (
                <div
                  key={favorite._id}
                  className="overflow-hidden rounded-xl bg-white shadow-sm transition hover:shadow-md"
                >
                  {/* Image */}
                  {property.images?.length > 0 ? (
                    <img
                      src={property.images[0]}
                      alt={property.title}
                      className="h-52 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-52 items-center justify-center bg-gray-200">
                      <Building2 size={42} className="text-gray-400" />
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="line-clamp-2 text-lg font-semibold text-gray-800">
                        {property.title}
                      </h2>

                      <Heart
                        size={20}
                        className="shrink-0 text-red-500"
                        fill="currentColor"
                      />
                    </div>

                    {/* Location */}
                    <div className="mt-2 flex items-center gap-1.5 text-sm text-gray-500">
                      <MapPin size={16} />

                      <span>
                        {property.address}, {property.city}
                      </span>
                    </div>

                    {/* Rent */}
                    <p className="mt-4 text-xl font-bold text-blue-600">
                      ৳{property.rent}
                      <span className="ml-1 text-sm font-normal text-gray-500">
                        / month
                      </span>
                    </p>

                    {/* Details */}
                    <div className="mt-3 flex gap-4 text-sm text-gray-600">
                      <span>{property.bedrooms || 0} Beds</span>

                      <span>{property.bathrooms || 0} Baths</span>

                      <span className="capitalize">
                        {property.propertyType}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="mt-5 flex gap-3">
                      <Link
                        to={`/properties/${property._id}`}
                        className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-blue-700"
                      >
                        View Details
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleRemove(property._id)}
                        disabled={removeLoading === property._id}
                        className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-3 py-2.5 text-gray-600 transition hover:border-red-400 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                        title="Remove from favorites"
                      >
                        <Trash2 size={18} />
                      </button>
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

export default Favorites;

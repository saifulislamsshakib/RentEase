import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Building2, Search, MapPin } from "lucide-react";

import api from "../services/api";

function Properties() {
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [propertyType, setPropertyType] = useState("");

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/property");

        const data = response.data.properties || [];

        setProperties(data);
        setFilteredProperties(data);
      } catch (error) {
        setError(error.response?.data?.message || "Failed to load properties.");
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  useEffect(() => {
    let result = [...properties];

    // Only available properties
    result = result.filter((property) => property.isAvailable);

    // Search
    if (search.trim()) {
      const searchText = search.toLowerCase();

      result = result.filter((property) => {
        return (
          property.title?.toLowerCase().includes(searchText) ||
          property.address?.toLowerCase().includes(searchText) ||
          property.city?.toLowerCase().includes(searchText)
        );
      });
    }

    // City filter
    if (city) {
      result = result.filter(
        (property) => property.city?.toLowerCase() === city.toLowerCase(),
      );
    }

    // Property type filter
    if (propertyType) {
      result = result.filter(
        (property) => property.propertyType === propertyType,
      );
    }

    setFilteredProperties(result);
  }, [properties, search, city, propertyType]);

  const cities = [
    ...new Set(properties.map((property) => property.city).filter(Boolean)),
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-gray-600">Loading properties...</p>
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
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-blue-500 hover:text-blue-600"
          >
            <ArrowLeft size={17} />
            Back
          </Link>

          <Link to="/" className="text-2xl font-bold text-blue-600">
            RentEase
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* Title */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Find a Property</h1>

          <p className="mt-2 text-gray-600">
            Browse available rental properties.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="mt-7 rounded-xl bg-white p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-3">
            {/* Search */}
            <div className="relative">
              <Search
                size={19}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                placeholder="Search property..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 outline-none focus:border-blue-500"
              />
            </div>

            {/* City */}
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
            >
              <option value="">All Cities</option>

              {cities.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            {/* Type */}
            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
            >
              <option value="">All Property Types</option>

              <option value="apartment">Apartment</option>

              <option value="house">House</option>

              <option value="room">Room</option>

              <option value="studio">Studio</option>
            </select>
          </div>

          {/* Result count */}
          <div className="mt-4 text-sm text-gray-500">
            {filteredProperties.length}{" "}
            {filteredProperties.length === 1 ? "property" : "properties"}{" "}
            available
          </div>
        </div>

        {/* Properties */}
        {filteredProperties.length === 0 ? (
          <div className="mt-7 rounded-xl bg-white p-10 text-center shadow-sm">
            <Building2 size={42} className="mx-auto text-gray-400" />

            <h2 className="mt-4 text-xl font-semibold text-gray-800">
              No Properties Found
            </h2>

            <p className="mt-2 text-gray-500">
              Try changing your search or filters.
            </p>
          </div>
        ) : (
          <div className="mt-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProperties.map((property) => (
              <div
                key={property._id}
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

                    <span className="shrink-0 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
                      Available
                    </span>
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

                    <span className="capitalize">{property.propertyType}</span>
                  </div>

                  {/* Button */}
                  <Link
                    to={`/properties/${property._id}`}
                    className="mt-5 block rounded-lg bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Properties;

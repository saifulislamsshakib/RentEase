import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  MapPin,
  BedDouble,
  Bath,
  Heart,
  ArrowRight,
  Building2,
  ShieldCheck,
  Users,
  Star,
} from "lucide-react";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function Home() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");

  const [favorites, setFavorites] = useState([]);
  const [favoriteLoading, setFavoriteLoading] = useState(null);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);

        const response = await api.get("/property");

        setProperties(response.data.properties || []);
      } catch (error) {
        console.log("Home properties error:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  useEffect(() => {
    const fetchFavorites = async () => {
      // Only tenants should access favorites
      if (!user || user.role !== "tenant") {
        setFavorites([]);
        return;
      }

      const token = localStorage.getItem("token");

      // No token = do not call protected API
      if (!token) {
        setFavorites([]);
        return;
      }

      try {
        const response = await api.get("/favorite");

        const favoriteList = response.data?.favorites || [];

        setFavorites(
          favoriteList.map((item) => item.property?._id).filter(Boolean),
        );
      } catch (error) {
        // 401 means the session/token is no longer valid.
        // Don't show an unnecessary console error on Home.
        if (error.response?.status === 401) {
          setFavorites([]);
          return;
        }

        console.error(
          "Home favorites error:",
          error.response?.data?.message || error.message,
        );
      }
    };

    fetchFavorites();
  }, [user]);

  const handleSearch = (event) => {
    event.preventDefault();

    const params = new URLSearchParams();

    if (search.trim()) {
      params.set("search", search.trim());
    }

    if (location.trim()) {
      params.set("city", location.trim());
    }

    navigate(`/properties${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const handleFavorite = async (propertyId) => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role !== "tenant") {
      return;
    }

    try {
      setFavoriteLoading(propertyId);

      const isFavorite = favorites.includes(propertyId);

      if (isFavorite) {
        await api.delete(`/favorite/${propertyId}`);

        setFavorites((prev) => prev.filter((id) => id !== propertyId));
      } else {
        await api.post(`/favorite/${propertyId}`);

        setFavorites((prev) => [...prev, propertyId]);
      }
    } catch (error) {
      console.log("Favorite error:", error.message);
    } finally {
      setFavoriteLoading(null);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const displayedProperties = properties
    .filter((property) => property.isAvailable !== false)
    .slice(0, 6);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="text-2xl font-bold text-blue-600">
            RentEase
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            {user && (
              <>
                <Link
                  to={
                    user.role === "admin"
                      ? "/admin/dashboard"
                      : user.role === "owner"
                        ? "/owner/dashboard"
                        : "/dashboard"
                  }
                  className="text-sm font-medium text-gray-600 transition hover:text-blue-600"
                >
                  Dashboard
                </Link>
              </>
            )}
          </nav>

          {/* User / Auth */}
          <div className="flex items-center gap-2">
            {!user ? (
              <>
                <Link
                  to="/login"
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  Register
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-3">
                {/* User information */}
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-semibold text-gray-800">
                    {user.name || "User"}
                  </p>

                  <p className="text-xs capitalize text-gray-500">
                    {user.role}
                  </p>
                </div>

                {/* Avatar */}
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                  {user.name?.charAt(0)?.toUpperCase() || "U"}
                </div>

                {/* Logout */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 pb-16 pt-16 sm:px-6 lg:px-8 lg:pb-20 lg:pt-20">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Hero Text */}
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600">
                <ShieldCheck size={16} />
                Trusted Rental Platform
              </span>

              <h1 className="mt-5 text-4xl font-extrabold leading-tight text-gray-900 sm:text-5xl lg:text-6xl">
                Find a place you’ll{" "}
                <span className="text-blue-600">love to call home.</span>
              </h1>

              <p className="mt-5 max-w-xl text-lg leading-8 text-gray-600">
                Discover quality rental properties, connect with property owners
                and find your perfect home with RentEase.
              </p>

              {/* Search */}
              <form
                onSubmit={handleSearch}
                className="mt-8 rounded-2xl border bg-white p-3 shadow-lg"
              >
                <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                  {/* Property Search */}
                  <div className="flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3">
                    <Search size={19} className="shrink-0 text-gray-400" />

                    <input
                      type="text"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search property..."
                      className="w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
                    />
                  </div>

                  <div className="flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3">
                    <MapPin size={19} className="shrink-0 text-gray-400" />

                    <input
                      type="text"
                      value={location}
                      onChange={(event) => setLocation(event.target.value)}
                      placeholder="City or location"
                      className="w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
                    />
                  </div>

                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
                  >
                    <Search size={18} />
                    Search
                  </button>
                </div>
              </form>
            </div>

            <div className="relative">
              <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-blue-100 to-gray-100 p-8">
                <div className="rounded-2xl bg-white p-6 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                        <Building2 size={25} className="text-blue-600" />
                      </div>

                      <div>
                        <p className="font-bold text-gray-800">
                          Find Your Home
                        </p>

                        <p className="text-sm text-gray-500">
                          Simple. Fast. Reliable.
                        </p>
                      </div>
                    </div>

                    <Star
                      size={22}
                      fill="currentColor"
                      className="text-yellow-500"
                    />
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl bg-gray-50 p-4">
                      <p className="text-xs text-gray-400">Properties</p>

                      <p className="mt-1 text-2xl font-bold text-gray-800">
                        {properties.length}
                      </p>
                    </div>

                    <div className="rounded-xl bg-gray-50 p-4">
                      <p className="text-xs text-gray-400">Available</p>

                      <p className="mt-1 text-2xl font-bold text-blue-600">
                        {
                          properties.filter(
                            (item) => item.isAvailable !== false,
                          ).length
                        }
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl bg-blue-600 p-5 text-white">
                    <p className="text-sm opacity-80">
                      Your next home is waiting
                    </p>

                    <p className="mt-1 text-xl font-bold">
                      Start exploring today.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y bg-gray-50">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:grid-cols-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
              <Building2 size={23} className="text-blue-600" />
            </div>

            <div>
              <p className="text-2xl font-bold text-gray-800">
                {properties.length}+
              </p>

              <p className="text-sm text-gray-500">Properties Listed</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
              <Users size={23} className="text-blue-600" />
            </div>

            <div>
              <p className="text-2xl font-bold text-gray-800">Easy</p>

              <p className="text-sm text-gray-500">Tenant & Owner Connection</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
              <ShieldCheck size={23} className="text-blue-600" />
            </div>

            <div>
              <p className="text-2xl font-bold text-gray-800">Secure</p>

              <p className="text-sm text-gray-500">Protected User Accounts</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold text-blue-600">EXPLORE</p>

            <h2 className="mt-1 text-3xl font-bold text-gray-800">
              Featured Properties
            </h2>

            <p className="mt-2 text-gray-500">
              Explore some of the latest available rental homes.
            </p>
          </div>

          <Link
            to="/properties"
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            View All Properties
            <ArrowRight size={17} />
          </Link>
        </div>

        {loading ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="overflow-hidden rounded-xl bg-white shadow-sm"
              >
                <div className="h-56 animate-pulse bg-gray-200"></div>

                <div className="space-y-3 p-5">
                  <div className="h-5 animate-pulse rounded bg-gray-200"></div>

                  <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200"></div>

                  <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200"></div>
                </div>
              </div>
            ))}
          </div>
        ) : displayedProperties.length === 0 ? (
          /* No Properties */
          <div className="mt-8 rounded-xl bg-white p-10 text-center shadow-sm">
            <Building2 size={45} className="mx-auto text-gray-300" />

            <h3 className="mt-4 text-xl font-semibold text-gray-800">
              No Properties Available
            </h3>

            <p className="mt-2 text-gray-500">
              Check back later for new rental properties.
            </p>

            <Link
              to="/properties"
              className="mt-5 inline-flex rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Browse Properties
            </Link>
          </div>
        ) : (
          /* Property Cards */
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {displayedProperties.map((property) => {
              const isFavorite = favorites.includes(property._id);

              return (
                <div
                  key={property._id}
                  className="overflow-hidden rounded-xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  {/* Image */}
                  <div className="relative h-56 bg-gray-100">
                    {property.images?.length > 0 ? (
                      <img
                        src={property.images[0]}
                        alt={property.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Building2 size={45} className="text-gray-300" />
                      </div>
                    )}

                    {/* Favorite */}
                    <button
                      type="button"
                      onClick={() => handleFavorite(property._id)}
                      disabled={favoriteLoading === property._id}
                      className={`absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm transition ${
                        isFavorite
                          ? "text-red-500"
                          : "text-gray-500 hover:text-red-500"
                      } disabled:opacity-60`}
                    >
                      <Heart
                        size={19}
                        fill={isFavorite ? "currentColor" : "none"}
                      />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="line-clamp-1 text-lg font-bold text-gray-800">
                          {property.title || "Untitled Property"}
                        </h3>

                        <div className="mt-2 flex items-center gap-1.5 text-sm text-gray-500">
                          <MapPin size={15} />

                          <span className="truncate">
                            {property.city ||
                              property.address ||
                              "Location unavailable"}
                          </span>
                        </div>
                      </div>

                      <p className="shrink-0 font-bold text-blue-600">
                        ৳
                        {property.rent
                          ? Number(property.rent).toLocaleString()
                          : "N/A"}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center gap-5 text-sm text-gray-500">
                      <span className="inline-flex items-center gap-1.5">
                        <BedDouble size={17} />
                        {property.bedrooms || 0} Beds
                      </span>

                      <span className="inline-flex items-center gap-1.5">
                        <Bath size={17} />
                        {property.bathrooms || 0} Baths
                      </span>
                    </div>

                    <Link
                      to={`/properties/${property._id}`}
                      className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                      View Property
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="bg-blue-600">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-7 md:flex-row md:items-center">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold text-white">
                Have a property to rent?
              </h2>

              <p className="mt-3 leading-7 text-blue-100">
                List your property on RentEase and connect with tenants looking
                for their next home.
              </p>
            </div>

            <Link
              to={user?.role === "owner" ? "/owner/dashboard" : "/register"}
              className="inline-flex w-fit items-center gap-2 rounded-lg bg-white px-6 py-3 font-semibold text-blue-600 transition hover:bg-gray-100"
            >
              {user?.role === "owner" ? "Owner Dashboard" : "Become an Owner"}

              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row">
            <div>
              <Link to="/" className="text-2xl font-bold text-white">
                RentEase
              </Link>

              <p className="mt-2 max-w-md text-sm leading-6 text-gray-400">
                A simple platform for finding and managing rental properties.
              </p>
            </div>

            <div className="flex flex-wrap gap-5">
              <Link
                to="/properties"
                className="text-sm text-gray-400 transition hover:text-white"
              >
                Properties
              </Link>

              {!user && (
                <>
                  <Link
                    to="/login"
                    className="text-sm text-gray-400 transition hover:text-white"
                  >
                    Login
                  </Link>

                  <Link
                    to="/register"
                    className="text-sm text-gray-400 transition hover:text-white"
                  >
                    Register
                  </Link>
                </>
              )}

              {user && (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-sm text-gray-400 transition hover:text-white"
                >
                  Logout
                </button>
              )}
            </div>
          </div>

          <div className="mt-8 border-t border-gray-800 pt-6">
            <p className="text-center text-sm text-gray-500">
              © {new Date().getFullYear()} RentEase. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;

import { Link, useNavigate } from "react-router-dom";

import {
  Building2,
  Heart,
  FileText,
  CalendarDays,
  Bell,
  Search,
  LogOut,
  ScrollText,
  MessageSquare,
  Wrench,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ================= HEADER ================= */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/" className="text-2xl font-bold text-blue-600">
            RentEase
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-red-400 hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={17} />
            Logout
          </button>
        </div>
      </header>

      {/* ================= MAIN ================= */}
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* ================= WELCOME ================= */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome, {user?.name || "Tenant"}
          </h1>

          <p className="mt-2 text-gray-600">
            Find and manage your rental properties from here.
          </p>
        </div>

        {/* ================= SEARCH PROPERTY ================= */}
        <Link
          to="/properties"
          className="mt-7 flex items-center gap-4 rounded-xl bg-blue-600 p-5 text-white shadow-sm transition hover:bg-blue-700"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/15">
            <Search size={24} />
          </div>

          <div>
            <h2 className="font-semibold">Find a Property</h2>

            <p className="mt-1 text-sm text-blue-100">
              Browse available rental properties
            </p>
          </div>
        </Link>

        {/* ================= FEATURE CARDS ================= */}
        <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {/* ================= PROPERTIES ================= */}
          <Link
            to="/properties"
            className="rounded-xl bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50">
              <Building2 size={23} className="text-blue-600" />
            </div>

            <h3 className="mt-5 font-semibold text-gray-800">Properties</h3>

            <p className="mt-1 text-sm text-gray-500">
              Browse rental properties
            </p>

            <span className="mt-4 inline-block text-sm font-semibold text-blue-600">
              Browse →
            </span>
          </Link>

          {/* ================= FAVORITES ================= */}
          <Link
            to="/favorites"
            className="rounded-xl bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-red-50">
              <Heart size={23} className="text-red-500" />
            </div>

            <h3 className="mt-5 font-semibold text-gray-800">Favorites</h3>

            <p className="mt-1 text-sm text-gray-500">
              View your saved properties
            </p>

            <span className="mt-4 inline-block text-sm font-semibold text-blue-600">
              View Favorites →
            </span>
          </Link>

          {/* ================= MY APPLICATIONS ================= */}
          <Link
            to="/my-applications"
            className="rounded-xl bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-green-50">
              <FileText size={23} className="text-green-600" />
            </div>

            <h3 className="mt-5 font-semibold text-gray-800">
              My Applications
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Track your rental applications
            </p>

            <span className="mt-4 inline-block text-sm font-semibold text-blue-600">
              View Applications →
            </span>
          </Link>

          {/* ================= BOOKINGS ================= */}
          <Link
            to="/bookings"
            className="rounded-xl bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-purple-50">
              <CalendarDays size={23} className="text-purple-600" />
            </div>

            <h3 className="mt-5 font-semibold text-gray-800">Visit Bookings</h3>

            <p className="mt-1 text-sm text-gray-500">
              Manage your property visits
            </p>

            <span className="mt-4 inline-block text-sm font-semibold text-blue-600">
              View Bookings →
            </span>
          </Link>

          {/* ================= MY CONTRACTS ================= */}
          <Link
            to="/contracts"
            className="rounded-xl bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50">
              <ScrollText size={23} className="text-indigo-600" />
            </div>

            <h3 className="mt-5 font-semibold text-gray-800">My Contracts</h3>

            <p className="mt-1 text-sm text-gray-500">
              View your rental contracts and terms
            </p>

            <span className="mt-4 inline-block text-sm font-semibold text-blue-600">
              View Contracts →
            </span>
          </Link>

          {/* ================= RENT PAYMENT ================= */}
          <Link
            to="/payments"
            className="rounded-xl bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50">
              <DollarSignIcon />
            </div>

            <h3 className="mt-5 font-semibold text-gray-800">Rent Payments</h3>

            <p className="mt-1 text-sm text-gray-500">
              View rent dues and payment history
            </p>

            <span className="mt-4 inline-block text-sm font-semibold text-blue-600">
              View Payments →
            </span>
          </Link>
          {/* ================= MAINTENANCE ================= */}
          <Link
            to="/maintenance"
            className="rounded-xl bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-cyan-50">
              <Wrench size={23} className="text-cyan-600" />
            </div>

            <h3 className="mt-5 font-semibold text-gray-800">Maintenance</h3>

            <p className="mt-1 text-sm text-gray-500">
              Report and track property maintenance issues
            </p>

            <span className="mt-4 inline-block text-sm font-semibold text-blue-600">
              View Maintenance →
            </span>
          </Link>

          {/* ================= COMPLAINTS ================= */}
          <Link
            to="/complaints"
            className="rounded-xl bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-orange-50">
              <MessageSquare size={23} className="text-orange-600" />
            </div>

            <h3 className="mt-5 font-semibold text-gray-800">Complaints</h3>

            <p className="mt-1 text-sm text-gray-500">
              Submit and track your rental complaints
            </p>

            <span className="mt-4 inline-block text-sm font-semibold text-blue-600">
              View Complaints →
            </span>
          </Link>
        </div>

        {/* ================= NOTIFICATIONS ================= */}
        <Link
          to="/notifications"
          className="mt-7 flex items-center justify-between rounded-xl bg-white p-5 shadow-sm transition hover:shadow-md"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-yellow-50">
              <Bell size={23} className="text-yellow-600" />
            </div>

            <div>
              <h2 className="font-semibold text-gray-800">Notifications</h2>

              <p className="mt-1 text-sm text-gray-500">
                Check updates about your applications, bookings and rental
                activities.
              </p>
            </div>
          </div>

          <span className="text-sm font-semibold text-blue-600">View →</span>
        </Link>
      </main>
    </div>
  );
}

/* ================= RENT / PAYMENT ICON ================= */

function DollarSignIcon() {
  return (
    <div className="flex h-full w-full items-center justify-center text-emerald-600">
      <span className="text-xl font-bold">৳</span>
    </div>
  );
}

export default Dashboard;

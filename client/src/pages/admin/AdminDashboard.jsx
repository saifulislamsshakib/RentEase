import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Users,
  Building2,
  FileText,
  UserCheck,
  Clock,
  CheckCircle,
  ArrowRight,
  ShieldCheck,
  Home,
  BarChart3,
  LogOut,
  RefreshCw,
} from "lucide-react";

import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [stats, setStats] = useState({
    users: 0,
    properties: 0,
    applications: 0,
    owners: 0,
    tenants: 0,
    pendingApplications: 0,
    approvedApplications: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // FETCH ADMIN DASHBOARD DATA
  // =====================================================

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const [usersResponse, propertiesResponse, applicationsResponse] =
        await Promise.all([
          api.get("/admin/users"),
          api.get("/admin/properties"),
          api.get("/admin/applications"),
        ]);

      const users = usersResponse.data?.users || [];
      const properties = propertiesResponse.data?.properties || [];
      const applications = applicationsResponse.data?.applications || [];

      const owners = users.filter((item) => item.role === "owner").length;

      const tenants = users.filter((item) => item.role === "tenant").length;

      const pendingApplications = applications.filter(
        (item) => item.status === "pending",
      ).length;

      const approvedApplications = applications.filter(
        (item) => item.status === "approved",
      ).length;

      setStats({
        users: users.length,
        properties: properties.length,
        applications: applications.length,
        owners,
        tenants,
        pendingApplications,
        approvedApplications,
      });
    } catch (err) {
      console.error("Admin dashboard error:", err);

      setError(err.response?.data?.message || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // =====================================================
  // STAT CARD
  // =====================================================

  const StatCard = ({
    title,
    value,
    icon: Icon,
    iconBg = "bg-blue-50",
    iconColor = "text-blue-600",
  }) => {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>

            <h3 className="text-3xl font-bold text-gray-900 mt-2">{value}</h3>
          </div>

          <div
            className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center`}
          >
            <Icon className={`w-6 h-6 ${iconColor}`} />
          </div>
        </div>
      </div>
    );
  };

  // =====================================================
  // MANAGEMENT CARD
  // =====================================================

  const ManagementCard = ({ title, description, icon: Icon, link }) => {
    return (
      <Link
        to={link}
        className="group bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg hover:border-blue-300 transition"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
              <Icon className="w-6 h-6 text-blue-600" />
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>

              <p className="text-sm text-gray-500 mt-1">{description}</p>
            </div>
          </div>

          <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition" />
        </div>
      </Link>
    );
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="flex justify-center">
              <RefreshCw className="w-10 h-10 text-blue-600 animate-spin" />
            </div>

            <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-10 text-center">
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto">
              <ShieldCheck className="w-7 h-7 text-red-600" />
            </div>

            <h2 className="text-xl font-bold text-gray-900 mt-4">
              Unable to Load Dashboard
            </h2>

            <p className="text-red-600 mt-2">{error}</p>

            <button
              onClick={fetchDashboardData}
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // DASHBOARD
  // =====================================================

  return (
    <div className="min-h-screen bg-gray-50">
      {/* =================================================
          HEADER
      ================================================= */}

      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Admin Dashboard
                </h1>

                <p className="text-sm text-gray-500 mt-1">
                  Welcome back, {user?.name || "Administrator"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchDashboardData}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>

              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* PAGE INTRO */}

        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900">System Overview</h2>

          <p className="text-gray-500 mt-1">
            Monitor users, properties, applications and overall platform
            activity.
          </p>
        </div>

        {/* =================================================
            STAT CARDS
        ================================================= */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatCard
            title="Total Users"
            value={stats.users}
            icon={Users}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
          />

          <StatCard
            title="Property Owners"
            value={stats.owners}
            icon={UserCheck}
            iconBg="bg-purple-50"
            iconColor="text-purple-600"
          />

          <StatCard
            title="Tenants"
            value={stats.tenants}
            icon={Users}
            iconBg="bg-green-50"
            iconColor="text-green-600"
          />

          <StatCard
            title="Properties"
            value={stats.properties}
            icon={Building2}
            iconBg="bg-orange-50"
            iconColor="text-orange-600"
          />

          <StatCard
            title="Applications"
            value={stats.applications}
            icon={FileText}
            iconBg="bg-indigo-50"
            iconColor="text-indigo-600"
          />

          <StatCard
            title="Pending Applications"
            value={stats.pendingApplications}
            icon={Clock}
            iconBg="bg-yellow-50"
            iconColor="text-yellow-600"
          />

          <StatCard
            title="Approved Applications"
            value={stats.approvedApplications}
            icon={CheckCircle}
            iconBg="bg-green-50"
            iconColor="text-green-600"
          />

          <StatCard
            title="System Status"
            value="Active"
            icon={ShieldCheck}
            iconBg="bg-green-50"
            iconColor="text-green-600"
          />
        </div>

        {/* =================================================
            MANAGEMENT SECTION
        ================================================= */}

        <div className="mb-8">
          <div className="mb-5">
            <h2 className="text-xl font-bold text-gray-900">Management</h2>

            <p className="text-sm text-gray-500 mt-1">
              Manage different areas of the RentEase system.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <ManagementCard
              title="Users"
              description="View and manage system users"
              icon={Users}
              link="/admin/users"
            />

            <ManagementCard
              title="Properties"
              description="View and manage all properties"
              icon={Building2}
              link="/admin/properties"
            />

            <ManagementCard
              title="Applications"
              description="Monitor rental applications"
              icon={FileText}
              link="/admin/applications"
            />

            <ManagementCard
              title="Bookings"
              description="View and manage property bookings"
              icon={Home}
              link="/admin/bookings"
            />

            {/* =================================================
                REPORTS & ANALYTICS
            ================================================= */}

            <ManagementCard
              title="Reports & Analytics"
              description="View system statistics and reports"
              icon={BarChart3}
              link="/admin/reports"
            />
          </div>
        </div>

        {/* =================================================
            QUICK SUMMARY
        ================================================= */}

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Quick Summary</h2>

              <p className="text-sm text-gray-500 mt-1">
                Current rental application overview
              </p>
            </div>

            <Link
              to="/admin/reports"
              className="inline-flex items-center gap-2 text-blue-600 font-medium hover:text-blue-700"
            >
              View Full Reports
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* APPLICATION SUMMARY */}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* TOTAL */}

            <div className="rounded-xl bg-gray-50 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Applications</p>

                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stats.applications}
                  </p>
                </div>

                <div className="w-11 h-11 rounded-lg bg-blue-100 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </div>

            {/* PENDING */}

            <div className="rounded-xl bg-yellow-50 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-700">
                    Pending Applications
                  </p>

                  <p className="text-3xl font-bold text-yellow-800 mt-2">
                    {stats.pendingApplications}
                  </p>
                </div>

                <div className="w-11 h-11 rounded-lg bg-yellow-100 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
              </div>
            </div>

            {/* APPROVED */}

            <div className="rounded-xl bg-green-50 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700">
                    Approved Applications
                  </p>

                  <p className="text-3xl font-bold text-green-800 mt-2">
                    {stats.approvedApplications}
                  </p>
                </div>

                <div className="w-11 h-11 rounded-lg bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =================================================
            REPORTS SHORTCUT
        ================================================= */}

        <div className="mt-6">
          <Link
            to="/admin/reports"
            className="group block bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-sm hover:shadow-lg transition"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
                  <BarChart3 className="w-7 h-7 text-white" />
                </div>

                <div>
                  <h2 className="text-xl font-bold">Reports & Analytics</h2>

                  <p className="text-blue-100 mt-1">
                    View users, properties, contracts, payments, maintenance and
                    complaints statistics.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 font-semibold">
                Open Reports
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
              </div>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;

import React, { useEffect, useState } from "react";
import {
  Users,
  Building2,
  FileText,
  FileSignature,
  CreditCard,
  Wrench,
  MessageSquareWarning,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  ArrowLeft,
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../services/api";

const AdminReports = () => {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/reports");

      if (response.data?.success) {
        setReports(response.data);
      } else {
        setError("Failed to load reports.");
      }
    } catch (err) {
      console.error("Admin reports error:", err);
      setError(err.response?.data?.message || "Failed to load reports.");
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, description }) => (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <h3 className="text-3xl font-bold text-gray-900 mt-2">{value}</h3>
          {description && (
            <p className="text-xs text-gray-500 mt-2">{description}</p>
          )}
        </div>

        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
      </div>
    </div>
  );

  const ProgressBar = ({ label, value, total }) => {
    const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

    return (
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-700">{label}</span>
          <span className="font-semibold text-gray-900">{value}</span>
        </div>

        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 rounded-full"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
            <div className="animate-spin w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto" />

            <p className="mt-4 text-gray-600">Loading reports...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />

            <h2 className="text-xl font-bold text-gray-900 mt-4">
              Unable to Load Reports
            </h2>

            <p className="text-red-600 mt-2">{error}</p>

            <button
              onClick={fetchReports}
              className="mt-5 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!reports) return null;

  const {
    users,
    properties,
    applications,
    contracts,
    payments,
    maintenance,
    complaints,
  } = reports;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <Link
                to="/admin/dashboard"
                className="w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-100"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>

              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Reports & Analytics
                </h1>

                <p className="text-gray-500 mt-1">
                  System-wide statistics and performance overview
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={fetchReports}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Refresh Reports
          </button>
        </div>

        {/* TOP SUMMARY */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatCard
            title="Total Users"
            value={users.total}
            icon={Users}
            description={`${users.active} active users`}
          />

          <StatCard
            title="Total Properties"
            value={properties.total}
            icon={Building2}
            description={`${properties.available} available`}
          />

          <StatCard
            title="Total Applications"
            value={applications.total}
            icon={FileText}
            description={`${applications.pending} pending`}
          />

          <StatCard
            title="Active Contracts"
            value={contracts.active}
            icon={FileSignature}
            description={`${contracts.total} total contracts`}
          />
        </div>

        {/* USER REPORT */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <Users className="w-6 h-6 text-blue-600" />

              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  User Overview
                </h2>

                <p className="text-sm text-gray-500">
                  User distribution across the system
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-500">Owners</p>

                <p className="text-2xl font-bold mt-1">{users.owners}</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-500">Tenants</p>

                <p className="text-2xl font-bold mt-1">{users.tenants}</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-500">Active</p>

                <p className="text-2xl font-bold mt-1">{users.active}</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-500">Inactive</p>

                <p className="text-2xl font-bold mt-1">{users.inactive}</p>
              </div>
            </div>

            <ProgressBar
              label="Owners"
              value={users.owners}
              total={users.total}
            />

            <ProgressBar
              label="Tenants"
              value={users.tenants}
              total={users.total}
            />
          </div>

          {/* PROPERTY REPORT */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <Building2 className="w-6 h-6 text-blue-600" />

              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Property Overview
                </h2>

                <p className="text-sm text-gray-500">
                  Property availability statistics
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-500">Total</p>

                <p className="text-2xl font-bold mt-1">{properties.total}</p>
              </div>

              <div className="bg-green-50 rounded-xl p-4">
                <p className="text-sm text-green-700">Available</p>

                <p className="text-2xl font-bold text-green-700 mt-1">
                  {properties.available}
                </p>
              </div>

              <div className="bg-orange-50 rounded-xl p-4">
                <p className="text-sm text-orange-700">Occupied</p>

                <p className="text-2xl font-bold text-orange-700 mt-1">
                  {properties.occupied}
                </p>
              </div>
            </div>

            <ProgressBar
              label="Available Properties"
              value={properties.available}
              total={properties.total}
            />

            <ProgressBar
              label="Occupied Properties"
              value={properties.occupied}
              total={properties.total}
            />
          </div>
        </div>

        {/* APPLICATION + CONTRACT */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* APPLICATIONS */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <FileText className="w-6 h-6 text-blue-600" />

              <div>
                <h2 className="text-xl font-bold">Application Overview</h2>

                <p className="text-sm text-gray-500">
                  Rental application status
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <StatCard
                title="Pending"
                value={applications.pending}
                icon={Clock}
              />

              <StatCard
                title="Approved"
                value={applications.approved}
                icon={CheckCircle}
              />

              <StatCard
                title="Rejected"
                value={applications.rejected}
                icon={XCircle}
              />

              <StatCard
                title="Cancelled"
                value={applications.cancelled}
                icon={XCircle}
              />
            </div>
          </div>

          {/* CONTRACTS */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <FileSignature className="w-6 h-6 text-blue-600" />

              <div>
                <h2 className="text-xl font-bold">Contract Overview</h2>

                <p className="text-sm text-gray-500">
                  Rental contract statistics
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <StatCard
                title="Pending Deposit"
                value={contracts.pendingDeposit}
                icon={Clock}
              />

              <StatCard
                title="Active"
                value={contracts.active}
                icon={CheckCircle}
              />

              <StatCard
                title="Expired"
                value={contracts.expired}
                icon={AlertCircle}
              />

              <StatCard
                title="Terminated"
                value={contracts.terminated}
                icon={XCircle}
              />
            </div>
          </div>
        </div>

        {/* PAYMENT REPORT */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mb-6">
          <div className="flex items-center gap-3 mb-6">
            <CreditCard className="w-6 h-6 text-blue-600" />

            <div>
              <h2 className="text-xl font-bold">Payment Overview</h2>

              <p className="text-sm text-gray-500">
                Payment collection and outstanding amounts
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard
              title="Total Payments"
              value={payments.total}
              icon={CreditCard}
            />

            <StatCard title="Paid" value={payments.paid} icon={CheckCircle} />

            <StatCard title="Pending" value={payments.pending} icon={Clock} />

            <StatCard
              title="Overdue"
              value={payments.overdue}
              icon={AlertCircle}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 rounded-xl p-5">
              <p className="text-sm text-green-700">Paid Amount</p>

              <p className="text-2xl font-bold text-green-700 mt-1">
                ৳ {Number(payments.amounts.paid || 0).toLocaleString()}
              </p>
            </div>

            <div className="bg-yellow-50 rounded-xl p-5">
              <p className="text-sm text-yellow-700">Pending Amount</p>

              <p className="text-2xl font-bold text-yellow-700 mt-1">
                ৳ {Number(payments.amounts.pending || 0).toLocaleString()}
              </p>
            </div>

            <div className="bg-red-50 rounded-xl p-5">
              <p className="text-sm text-red-700">Overdue Amount</p>

              <p className="text-2xl font-bold text-red-700 mt-1">
                ৳ {Number(payments.amounts.overdue || 0).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-500">Security Deposits</p>

              <p className="text-2xl font-bold mt-1">
                {payments.securityDeposit}
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-500">Rent Payments</p>

              <p className="text-2xl font-bold mt-1">{payments.rent}</p>
            </div>
          </div>
        </div>

        {/* MAINTENANCE + COMPLAINTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* MAINTENANCE */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <Wrench className="w-6 h-6 text-blue-600" />

              <div>
                <h2 className="text-xl font-bold">Maintenance Overview</h2>

                <p className="text-sm text-gray-500">
                  Maintenance request status
                </p>
              </div>
            </div>

            <ProgressBar
              label="Pending"
              value={maintenance.pending}
              total={maintenance.total}
            />

            <ProgressBar
              label="In Progress"
              value={maintenance.inProgress}
              total={maintenance.total}
            />

            <ProgressBar
              label="Resolved"
              value={maintenance.resolved}
              total={maintenance.total}
            />

            <ProgressBar
              label="Closed"
              value={maintenance.closed}
              total={maintenance.total}
            />

            <div className="mt-5 bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-500">
                Total Maintenance Requests
              </p>

              <p className="text-2xl font-bold mt-1">{maintenance.total}</p>
            </div>
          </div>

          {/* COMPLAINTS */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <MessageSquareWarning className="w-6 h-6 text-blue-600" />

              <div>
                <h2 className="text-xl font-bold">Complaint Overview</h2>

                <p className="text-sm text-gray-500">Complaint status</p>
              </div>
            </div>

            <ProgressBar
              label="Pending"
              value={complaints.pending}
              total={complaints.total}
            />

            <ProgressBar
              label="In Progress"
              value={complaints.inProgress}
              total={complaints.total}
            />

            <ProgressBar
              label="Resolved"
              value={complaints.resolved}
              total={complaints.total}
            />

            <ProgressBar
              label="Closed"
              value={complaints.closed}
              total={complaints.total}
            />

            <div className="mt-5 bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-500">Total Complaints</p>

              <p className="text-2xl font-bold mt-1">{complaints.total}</p>
            </div>
          </div>
        </div>

        {/* FOOTER SUMMARY */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <TrendingUp className="w-6 h-6 text-blue-600" />

            <div>
              <h2 className="text-xl font-bold">System Summary</h2>

              <p className="text-sm text-gray-500">Overall platform activity</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            <div>
              <p className="text-sm text-gray-500">Users</p>

              <p className="text-2xl font-bold">{users.total}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Properties</p>

              <p className="text-2xl font-bold">{properties.total}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Contracts</p>

              <p className="text-2xl font-bold">{contracts.total}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Complaints</p>

              <p className="text-2xl font-bold">{complaints.total}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;

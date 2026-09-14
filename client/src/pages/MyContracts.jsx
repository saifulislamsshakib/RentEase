import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  Building2,
  User,
  Calendar,
  DollarSign,
  Eye,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

import api from "../services/api";

function MyContracts() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchContracts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/contract/my-contracts");

      setContracts(response.data?.contracts || []);
    } catch (error) {
      console.error("My contracts error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to load your rental contracts.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-700";

      case "Expired":
        return "bg-gray-100 text-gray-700";

      case "Renewed":
        return "bg-blue-100 text-blue-700";

      case "Terminated":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className="flex h-10 w-10 items-center justify-center rounded-lg border text-gray-600 transition hover:bg-gray-50"
            >
              <ArrowLeft size={19} />
            </Link>

            <div>
              <h1 className="text-xl font-bold text-gray-800">
                My Rental Contracts
              </h1>

              <p className="text-sm text-gray-500">
                View and manage your rental contracts
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={fetchContracts}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Summary */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50">
                <FileText size={21} className="text-blue-600" />
              </div>

              <div>
                <p className="text-sm text-gray-500">Total Contracts</p>

                <p className="text-2xl font-bold text-gray-800">
                  {contracts.length}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-green-50">
                <FileText size={21} className="text-green-600" />
              </div>

              <div>
                <p className="text-sm text-gray-500">Active Contracts</p>

                <p className="text-2xl font-bold text-gray-800">
                  {
                    contracts.filter((contract) => contract.status === "Active")
                      .length
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50">
                <RefreshCw size={21} className="text-blue-600" />
              </div>

              <div>
                <p className="text-sm text-gray-500">Renewed</p>

                <p className="text-2xl font-bold text-gray-800">
                  {
                    contracts.filter(
                      (contract) => contract.status === "Renewed",
                    ).length
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-red-50">
                <AlertCircle size={21} className="text-red-600" />
              </div>

              <div>
                <p className="text-sm text-gray-500">Terminated</p>

                <p className="text-2xl font-bold text-gray-800">
                  {
                    contracts.filter(
                      (contract) => contract.status === "Terminated",
                    ).length
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            <AlertCircle size={19} />
            <span>{error}</span>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="grid gap-6 lg:grid-cols-2">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="rounded-xl bg-white p-6 shadow-sm">
                <div className="h-6 w-1/2 animate-pulse rounded bg-gray-200" />
                <div className="mt-4 h-4 w-2/3 animate-pulse rounded bg-gray-200" />
                <div className="mt-3 h-4 w-1/2 animate-pulse rounded bg-gray-200" />
                <div className="mt-6 h-10 animate-pulse rounded bg-gray-200" />
              </div>
            ))}
          </div>
        ) : contracts.length === 0 ? (
          <div className="rounded-xl bg-white p-12 text-center shadow-sm">
            <FileText size={52} className="mx-auto text-gray-300" />

            <h2 className="mt-4 text-xl font-bold text-gray-800">
              No Rental Contracts
            </h2>

            <p className="mt-2 text-gray-500">
              You don't have any rental contracts yet.
            </p>

            <Link
              to="/properties"
              className="mt-6 inline-flex rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Browse Properties
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {contracts.map((contract) => (
              <div
                key={contract._id}
                className="overflow-hidden rounded-xl bg-white shadow-sm"
              >
                {/* Header */}
                <div className="flex items-start justify-between border-b p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50">
                      <FileText size={21} className="text-blue-600" />
                    </div>

                    <div>
                      <h2 className="font-bold text-gray-800">
                        Rental Contract
                      </h2>

                      <p className="text-xs text-gray-400">
                        Contract ID: {contract._id}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                      contract.status,
                    )}`}
                  >
                    {contract.status}
                  </span>
                </div>

                {/* Body */}
                <div className="p-5">
                  {/* Property */}
                  <div className="rounded-lg bg-gray-50 p-4">
                    <div className="flex gap-3">
                      <Building2 size={20} className="mt-0.5 text-blue-600" />

                      <div>
                        <p className="text-xs text-gray-500">Property</p>

                        <p className="font-semibold text-gray-800">
                          {contract.property?.title || "Property"}
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                          {contract.property?.city ||
                            contract.property?.address ||
                            "Location unavailable"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Owner */}
                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100">
                      <User size={17} className="text-blue-600" />
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">Property Owner</p>

                      <p className="font-semibold text-gray-800">
                        {contract.owner?.name || "Owner"}
                      </p>

                      <p className="text-xs text-gray-500">
                        {contract.owner?.email || ""}
                      </p>
                    </div>
                  </div>

                  {/* Information */}
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-lg border p-3">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-gray-500" />

                        <span className="text-xs text-gray-500">
                          Start Date
                        </span>
                      </div>

                      <p className="mt-1 font-semibold text-gray-800">
                        {formatDate(contract.startDate)}
                      </p>
                    </div>

                    <div className="rounded-lg border p-3">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-gray-500" />

                        <span className="text-xs text-gray-500">End Date</span>
                      </div>

                      <p className="mt-1 font-semibold text-gray-800">
                        {formatDate(contract.endDate)}
                      </p>
                    </div>

                    <div className="rounded-lg border p-3">
                      <div className="flex items-center gap-2">
                        <DollarSign size={16} className="text-gray-500" />

                        <span className="text-xs text-gray-500">
                          Monthly Rent
                        </span>
                      </div>

                      <p className="mt-1 font-semibold text-gray-800">
                        ৳{Number(contract.monthlyRent || 0).toLocaleString()}
                      </p>
                    </div>

                    <div className="rounded-lg border p-3">
                      <div className="flex items-center gap-2">
                        <DollarSign size={16} className="text-gray-500" />

                        <span className="text-xs text-gray-500">
                          Security Deposit
                        </span>
                      </div>

                      <p className="mt-1 font-semibold text-gray-800">
                        ৳
                        {Number(contract.securityDeposit || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Due Date */}
                  <div className="mt-4 rounded-lg bg-blue-50 p-3">
                    <p className="text-xs text-blue-600">
                      Monthly Rent Due Date
                    </p>

                    <p className="mt-1 font-semibold text-blue-800">
                      Every month on day {contract.dueDate}
                    </p>
                  </div>

                  {/* View */}
                  <Link
                    to={`/contracts/${contract._id}`}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    <Eye size={17} />
                    View Contract Details
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

export default MyContracts;

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  Calendar,
  User,
  Building2,
  DollarSign,
  RefreshCw,
  Eye,
  AlertCircle,
} from "lucide-react";

import api from "../../services/api";

function OwnerContracts() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(null);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/contract/owner/contracts");

      setContracts(response.data?.contracts || []);
    } catch (error) {
      console.error("Owner contracts error:", error);

      setError(
        error.response?.data?.message || "Failed to load rental contracts.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  const updateStatus = async (contractId, status) => {
    try {
      setUpdating(contractId);

      await api.put(`/contract/${contractId}/status`, {
        status,
      });

      setContracts((prev) =>
        prev.map((contract) =>
          contract._id === contractId ? { ...contract, status } : contract,
        ),
      );
    } catch (error) {
      console.error("Update contract status error:", error);

      alert(
        error.response?.data?.message || "Failed to update contract status.",
      );
    } finally {
      setUpdating(null);
    }
  };

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
              to="/owner/dashboard"
              className="flex h-10 w-10 items-center justify-center rounded-lg border bg-white text-gray-600 transition hover:bg-gray-50"
            >
              <ArrowLeft size={19} />
            </Link>

            <div>
              <h1 className="text-xl font-bold text-gray-800">
                Rental Contracts
              </h1>

              <p className="text-sm text-gray-500">
                Manage your tenant rental contracts
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
                <FileText className="text-blue-600" size={21} />
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
                <FileText className="text-green-600" size={21} />
              </div>

              <div>
                <p className="text-sm text-gray-500">Active</p>

                <p className="text-2xl font-bold text-gray-800">
                  {contracts.filter((item) => item.status === "Active").length}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50">
                <RefreshCw className="text-blue-600" size={21} />
              </div>

              <div>
                <p className="text-sm text-gray-500">Renewed</p>

                <p className="text-2xl font-bold text-gray-800">
                  {contracts.filter((item) => item.status === "Renewed").length}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-red-50">
                <AlertCircle className="text-red-600" size={21} />
              </div>

              <div>
                <p className="text-sm text-gray-500">Terminated</p>

                <p className="text-2xl font-bold text-gray-800">
                  {
                    contracts.filter((item) => item.status === "Terminated")
                      .length
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            <div className="flex items-center gap-2">
              <AlertCircle size={19} />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="grid gap-6 lg:grid-cols-2">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="overflow-hidden rounded-xl bg-white p-6 shadow-sm"
              >
                <div className="h-5 w-1/2 animate-pulse rounded bg-gray-200" />
                <div className="mt-4 h-4 w-2/3 animate-pulse rounded bg-gray-200" />
                <div className="mt-3 h-4 w-1/2 animate-pulse rounded bg-gray-200" />
                <div className="mt-6 h-10 animate-pulse rounded bg-gray-200" />
              </div>
            ))}
          </div>
        ) : contracts.length === 0 ? (
          <div className="rounded-xl bg-white p-12 text-center shadow-sm">
            <FileText size={50} className="mx-auto text-gray-300" />

            <h2 className="mt-4 text-xl font-bold text-gray-800">
              No Rental Contracts
            </h2>

            <p className="mt-2 text-gray-500">
              You don't have any rental contracts yet.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {contracts.map((contract) => (
              <div
                key={contract._id}
                className="overflow-hidden rounded-xl bg-white shadow-sm"
              >
                {/* Card Header */}
                <div className="border-b p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50">
                        <FileText size={21} className="text-blue-600" />
                      </div>

                      <div>
                        <h2 className="font-bold text-gray-800">
                          Rental Contract
                        </h2>

                        <p className="text-xs text-gray-400">
                          ID: {contract._id}
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
                </div>

                {/* Property */}
                <div className="p-5">
                  <div className="rounded-lg bg-gray-50 p-4">
                    <div className="flex items-start gap-3">
                      <Building2 size={19} className="mt-0.5 text-blue-600" />

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

                  {/* Tenant */}
                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100">
                      <User size={17} className="text-blue-600" />
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">Tenant</p>

                      <p className="font-semibold text-gray-800">
                        {contract.tenant?.name || "Unknown Tenant"}
                      </p>

                      <p className="text-xs text-gray-500">
                        {contract.tenant?.email || ""}
                      </p>
                    </div>
                  </div>

                  {/* Contract Information */}
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
                  <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 p-3">
                    <p className="text-xs text-blue-600">
                      Monthly Rent Due Date
                    </p>

                    <p className="mt-1 font-semibold text-blue-800">
                      Every month on day {contract.dueDate}
                    </p>
                  </div>

                  {/* Terms */}
                  {contract.termsAndConditions && (
                    <div className="mt-4">
                      <p className="text-xs font-semibold text-gray-500">
                        Terms & Conditions
                      </p>

                      <p className="mt-1 line-clamp-3 text-sm leading-6 text-gray-600">
                        {contract.termsAndConditions}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-5 flex flex-wrap gap-2">
                    <Link
                      to={`/owner/contracts/${contract._id}`}
                      className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                    >
                      <Eye size={16} />
                      View
                    </Link>

                    {contract.status === "Active" && (
                      <>
                        <button
                          type="button"
                          onClick={() => updateStatus(contract._id, "Renewed")}
                          disabled={updating === contract._id}
                          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
                        >
                          Renew
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            updateStatus(contract._id, "Terminated")
                          }
                          disabled={updating === contract._id}
                          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
                        >
                          Terminate
                        </button>
                      </>
                    )}

                    {contract.status === "Renewed" && (
                      <button
                        type="button"
                        onClick={() => updateStatus(contract._id, "Active")}
                        disabled={updating === contract._id}
                        className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-60"
                      >
                        Set Active
                      </button>
                    )}
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

export default OwnerContracts;

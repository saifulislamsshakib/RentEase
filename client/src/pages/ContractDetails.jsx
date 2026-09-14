import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  User,
  Building2,
  Calendar,
  DollarSign,
  Clock,
  AlertCircle,
} from "lucide-react";

import api from "../services/api";

function ContractDetails() {
  const { contractId } = useParams();

  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchContract = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/contract/${contractId}`);

        setContract(response.data?.contract || null);
      } catch (error) {
        console.error("Contract details error:", error);

        setError(
          error.response?.data?.message || "Failed to load contract details.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchContract();
  }, [contractId]);

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-4xl px-4 py-10">
          <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />

          <div className="mt-8 rounded-xl bg-white p-8 shadow-sm">
            <div className="h-6 w-1/3 animate-pulse rounded bg-gray-200" />
            <div className="mt-5 h-4 w-2/3 animate-pulse rounded bg-gray-200" />
            <div className="mt-3 h-4 w-1/2 animate-pulse rounded bg-gray-200" />

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <div className="h-24 animate-pulse rounded bg-gray-200" />
              <div className="h-24 animate-pulse rounded bg-gray-200" />
              <div className="h-24 animate-pulse rounded bg-gray-200" />
              <div className="h-24 animate-pulse rounded bg-gray-200" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-4xl px-4 py-10">
          <Link
            to="/contracts"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-blue-600"
          >
            <ArrowLeft size={17} />
            Back to Contracts
          </Link>

          <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-8 text-center">
            <AlertCircle size={45} className="mx-auto text-red-500" />

            <h2 className="mt-4 text-xl font-bold text-red-800">
              Contract Not Found
            </h2>

            <p className="mt-2 text-red-700">
              {error || "The requested contract could not be found."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-4xl items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link
            to="/contracts"
            className="flex h-10 w-10 items-center justify-center rounded-lg border text-gray-600 transition hover:bg-gray-50"
          >
            <ArrowLeft size={19} />
          </Link>

          <div>
            <h1 className="text-xl font-bold text-gray-800">Rental Contract</h1>

            <p className="text-sm text-gray-500">
              Contract details and rental terms
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Contract Header */}
        <div className="rounded-xl bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-4 border-b p-6 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                <FileText size={24} className="text-blue-600" />
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Rental Agreement
                </h2>

                <p className="mt-1 text-xs text-gray-400">
                  Contract ID: {contract._id}
                </p>
              </div>
            </div>

            <span
              className={`w-fit rounded-full px-4 py-2 text-sm font-semibold ${getStatusClass(
                contract.status,
              )}`}
            >
              {contract.status}
            </span>
          </div>

          {/* Property */}
          <div className="border-b p-6">
            <h3 className="mb-4 text-lg font-bold text-gray-800">
              Property Information
            </h3>

            <div className="rounded-xl bg-gray-50 p-5">
              <div className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-100">
                  <Building2 size={21} className="text-blue-600" />
                </div>

                <div>
                  <p className="text-xs text-gray-500">Property</p>

                  <p className="text-lg font-bold text-gray-800">
                    {contract.property?.title || "Property"}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    {contract.property?.address ||
                      contract.property?.city ||
                      "Address unavailable"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Parties */}
          <div className="border-b p-6">
            <h3 className="mb-4 text-lg font-bold text-gray-800">
              Contract Parties
            </h3>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="rounded-xl border p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                    <User size={19} className="text-blue-600" />
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Tenant</p>

                    <p className="font-bold text-gray-800">
                      {contract.tenant?.name || "Tenant"}
                    </p>

                    <p className="text-sm text-gray-500">
                      {contract.tenant?.email || ""}
                    </p>

                    {contract.tenant?.phone && (
                      <p className="text-sm text-gray-500">
                        {contract.tenant.phone}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                    <User size={19} className="text-green-600" />
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Property Owner</p>

                    <p className="font-bold text-gray-800">
                      {contract.owner?.name || "Owner"}
                    </p>

                    <p className="text-sm text-gray-500">
                      {contract.owner?.email || ""}
                    </p>

                    {contract.owner?.phone && (
                      <p className="text-sm text-gray-500">
                        {contract.owner.phone}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contract Period */}
          <div className="border-b p-6">
            <h3 className="mb-4 text-lg font-bold text-gray-800">
              Contract Period
            </h3>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="rounded-xl border p-5">
                <div className="flex items-center gap-3">
                  <Calendar size={20} className="text-blue-600" />

                  <div>
                    <p className="text-xs text-gray-500">Start Date</p>

                    <p className="mt-1 font-bold text-gray-800">
                      {formatDate(contract.startDate)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border p-5">
                <div className="flex items-center gap-3">
                  <Calendar size={20} className="text-red-500" />

                  <div>
                    <p className="text-xs text-gray-500">End Date</p>

                    <p className="mt-1 font-bold text-gray-800">
                      {formatDate(contract.endDate)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Financial */}
          <div className="border-b p-6">
            <h3 className="mb-4 text-lg font-bold text-gray-800">
              Rent & Payment Information
            </h3>

            <div className="grid gap-5 sm:grid-cols-3">
              <div className="rounded-xl bg-blue-50 p-5">
                <DollarSign size={20} className="text-blue-600" />

                <p className="mt-3 text-xs text-gray-500">Monthly Rent</p>

                <p className="mt-1 text-xl font-bold text-gray-800">
                  ৳{Number(contract.monthlyRent || 0).toLocaleString()}
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 p-5">
                <DollarSign size={20} className="text-gray-600" />

                <p className="mt-3 text-xs text-gray-500">Security Deposit</p>

                <p className="mt-1 text-xl font-bold text-gray-800">
                  ৳{Number(contract.securityDeposit || 0).toLocaleString()}
                </p>
              </div>

              <div className="rounded-xl bg-yellow-50 p-5">
                <Clock size={20} className="text-yellow-600" />

                <p className="mt-3 text-xs text-gray-500">Rent Due Day</p>

                <p className="mt-1 text-xl font-bold text-gray-800">
                  Day {contract.dueDate}
                </p>
              </div>
            </div>
          </div>

          {/* Terms */}
          <div className="p-6">
            <h3 className="text-lg font-bold text-gray-800">
              Terms & Conditions
            </h3>

            <div className="mt-4 rounded-xl bg-gray-50 p-5">
              {contract.termsAndConditions ? (
                <p className="whitespace-pre-wrap text-sm leading-7 text-gray-600">
                  {contract.termsAndConditions}
                </p>
              ) : (
                <p className="text-sm text-gray-500">
                  No additional terms and conditions were provided.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Back */}
        <div className="mt-6">
          <Link
            to="/contracts"
            className="inline-flex items-center gap-2 rounded-lg border bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            <ArrowLeft size={17} />
            Back to My Contracts
          </Link>
        </div>
      </main>
    </div>
  );
}

export default ContractDetails;

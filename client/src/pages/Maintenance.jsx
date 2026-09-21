import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Wrench,
  Plus,
  Clock3,
  CheckCircle2,
  AlertCircle,
  XCircle,
  CalendarDays,
  Building2,
  Loader2,
} from "lucide-react";

import api from "../services/api";

const Maintenance = () => {
  const [contracts, setContracts] = useState([]);
  const [requests, setRequests] = useState([]);

  const [selectedContract, setSelectedContract] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    category: "other",
    description: "",
    issueDate: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [contractResponse, maintenanceResponse] = await Promise.all([
        api.get("/contract/my-contracts"),
        api.get("/maintenance/my"),
      ]);

      const contractsData =
        contractResponse.data?.contracts || contractResponse.data?.data || [];

      const activeContracts = contractsData.filter(
        (contract) =>
          contract.status === "Active" || contract.contractStatus === "Active",
      );

      setContracts(activeContracts);

      if (activeContracts.length > 0) {
        setSelectedContract(activeContracts[0]);
      } else {
        setSelectedContract(null);
      }

      const maintenanceData =
        maintenanceResponse.data?.maintenance ||
        maintenanceResponse.data?.maintenanceRequests ||
        maintenanceResponse.data?.requests ||
        maintenanceResponse.data?.data ||
        [];

      setRequests(maintenanceData);
    } catch (err) {
      console.error("Maintenance fetch error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load maintenance information.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const handleOpenForm = () => {
    setError("");
    setSuccess("");

    if (!selectedContract && contracts.length > 0) {
      setSelectedContract(contracts[0]);
    }

    setFormData({
      title: "",
      category: "other",
      description: "",
      issueDate: new Date().toISOString().split("T")[0],
    });

    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!selectedContract) {
      setError("You do not have an active rental contract.");
      return;
    }

    const propertyId =
      selectedContract.property?._id ||
      selectedContract.property?.id ||
      selectedContract.property;

    if (!propertyId) {
      setError(
        "Property information could not be found from your rental contract.",
      );
      return;
    }

    if (!formData.title.trim()) {
      setError("Please enter a maintenance title.");
      return;
    }

    if (!formData.description.trim()) {
      setError("Please describe the maintenance problem.");
      return;
    }

    try {
      setSubmitting(true);

      const response = await api.post(`/maintenance/create/${propertyId}`, {
        title: formData.title.trim(),

        category: formData.category,

        description: formData.description.trim(),

        issueDate: formData.issueDate || new Date().toISOString().split("T")[0],
      });

      if (response.data?.success) {
        setSuccess("Maintenance request submitted successfully.");

        // Reset form
        setFormData({
          title: "",
          category: "other",
          description: "",
          issueDate: new Date().toISOString().split("T")[0],
        });

        setShowForm(false);

        // Reload maintenance requests
        await fetchData();
      } else {
        setError(
          response.data?.message || "Failed to submit maintenance request.",
        );
      }
    } catch (err) {
      console.error("Maintenance submit error:", err);

      setError(
        err.response?.data?.message || "Failed to submit maintenance request.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "In Progress":
      case "in_progress":
        return {
          className: "bg-blue-50 text-blue-700 border-blue-200",
          icon: <Clock3 size={16} />,
          label: "In Progress",
        };

      case "Resolved":
      case "resolved":
        return {
          className: "bg-emerald-50 text-emerald-700 border-emerald-200",
          icon: <CheckCircle2 size={16} />,
          label: "Resolved",
        };

      case "Closed":
      case "closed":
        return {
          className: "bg-slate-100 text-slate-600 border-slate-200",
          icon: <CheckCircle2 size={16} />,
          label: "Closed",
        };

      case "Cancelled":
      case "cancelled":
        return {
          className: "bg-red-50 text-red-700 border-red-200",
          icon: <XCircle size={16} />,
          label: "Cancelled",
        };

      default:
        return {
          className: "bg-amber-50 text-amber-700 border-amber-200",
          icon: <AlertCircle size={16} />,
          label: "Pending",
        };
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={40} className="mx-auto animate-spin text-blue-600" />

          <p className="mt-4 text-gray-600">
            Loading maintenance information...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-blue-600"
            >
              <ArrowLeft size={17} />
              Back to Dashboard
            </Link>

            <div className="mt-5 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-50">
                <Wrench size={25} className="text-cyan-600" />
              </div>

              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  Maintenance
                </h1>

                <p className="mt-1 text-gray-600">
                  Report and track your property maintenance issues.
                </p>
              </div>
            </div>
          </div>

          {/* NEW REQUEST BUTTON */}

          {contracts.length > 0 && (
            <button
              type="button"
              onClick={handleOpenForm}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              <Plus size={19} />
              New Maintenance Request
            </button>
          )}
        </div>

        {error && (
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            <AlertCircle size={20} className="mt-0.5 shrink-0" />

            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {success && (
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700">
            <CheckCircle2 size={20} className="mt-0.5 shrink-0" />

            <p className="text-sm font-medium">{success}</p>
          </div>
        )}

        {selectedContract && (
          <div className="mt-7 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
                <Building2 size={22} className="text-blue-600" />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Current Rental Property
                </p>

                <h2 className="mt-1 text-lg font-bold text-gray-800">
                  {selectedContract.property?.title || "Rental Property"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {selectedContract.property?.address ||
                    selectedContract.property?.location ||
                    "Address unavailable"}
                </p>
              </div>
            </div>

            {/* PROPERTY ID */}

            <div className="mt-4 rounded-lg bg-gray-50 p-3">
              <p className="text-xs font-semibold text-gray-400">Property ID</p>

              <p className="mt-1 break-all text-sm font-medium text-gray-700">
                {selectedContract.property?._id ||
                  selectedContract.property?.id ||
                  selectedContract.property}
              </p>
            </div>
          </div>
        )}

        {contracts.length === 0 && (
          <div className="mt-7 rounded-2xl bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-cyan-50">
              <Wrench size={30} className="text-cyan-600" />
            </div>

            <h2 className="mt-5 text-xl font-bold text-gray-800">
              No Active Rental Contract
            </h2>

            <p className="mx-auto mt-2 max-w-md text-gray-500">
              You need an active rental contract before submitting a maintenance
              request.
            </p>

            <Link
              to="/contracts"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
            >
              <Building2 size={18} />
              View My Contracts
            </Link>
          </div>
        )}

        {showForm && selectedContract && (
          <div className="mt-7 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
            {/* FORM HEADER */}

            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Submit Maintenance Request
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Property information is automatically taken from your active
                  contract.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseForm}
                className="rounded-lg px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100"
              >
                Cancel
              </button>
            </div>

            {/* FORM */}

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Property
                </label>

                <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                  <p className="font-semibold text-gray-800">
                    {selectedContract.property?.title || "Rental Property"}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    {selectedContract.property?.address ||
                      selectedContract.property?.location ||
                      "Address unavailable"}
                  </p>
                </div>
              </div>

              <div>
                <label
                  htmlFor="title"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Problem Title *
                </label>

                <input
                  id="title"
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Example: Bathroom light is not working"
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                <p className="mt-1 text-xs text-gray-400">
                  Give a short title for the maintenance problem.
                </p>
              </div>

              <div>
                <label
                  htmlFor="category"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Category
                </label>

                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="plumbing">Plumbing</option>

                  <option value="electrical">Electrical</option>

                  <option value="appliance">Appliance</option>

                  <option value="heating_cooling">Heating / Cooling</option>

                  <option value="structural">Structural</option>

                  <option value="cleaning">Cleaning</option>

                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="issueDate"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Issue Date
                </label>

                <div className="relative">
                  <CalendarDays
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    id="issueDate"
                    type="date"
                    name="issueDate"
                    value={formData.issueDate}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 pl-10 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Description *
                </label>

                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={6}
                  placeholder="Describe the maintenance problem clearly..."
                  className="w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                <p className="mt-1 text-xs text-gray-400">
                  Example: Bathroom light is not working. I tried switching it
                  on several times but there is no light.
                </p>
              </div>

              <div className="flex flex-col gap-3 border-t border-gray-200 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="rounded-xl border border-gray-300 px-5 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Wrench size={18} />
                      Submit Request
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="mt-8">
          <div className="mb-5">
            <h2 className="text-xl font-bold text-gray-800">
              My Maintenance Requests
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Track the status of your submitted maintenance requests.
            </p>
          </div>

          {requests.length === 0 ? (
            <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <Wrench size={30} className="text-gray-400" />
              </div>

              <h3 className="mt-5 text-lg font-bold text-gray-800">
                No Maintenance Requests
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                You haven't submitted any maintenance requests yet.
              </p>

              {contracts.length > 0 && (
                <button
                  type="button"
                  onClick={handleOpenForm}
                  className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
                >
                  <Plus size={18} />
                  Report a Problem
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-5">
              {requests.map((request) => {
                const statusStyle = getStatusStyle(request.status);

                const property = request.property;

                return (
                  <div
                    key={request._id}
                    className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6"
                  >
                    {/* TOP */}

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-50">
                          <Wrench size={22} className="text-cyan-600" />
                        </div>

                        <div>
                          {/* TITLE */}

                          <h3 className="font-bold text-gray-800">
                            {request.title || "Maintenance Request"}
                          </h3>

                          {/* PROPERTY */}

                          <p className="mt-1 text-sm text-gray-500">
                            {property?.title || "Rental Property"}
                          </p>
                        </div>
                      </div>

                      {/* STATUS */}

                      <div
                        className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold ${statusStyle.className}`}
                      >
                        {statusStyle.icon}
                        {statusStyle.label}
                      </div>
                    </div>

                    {/* DESCRIPTION */}

                    <div className="mt-5 rounded-xl bg-gray-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Problem
                      </p>

                      <p className="mt-2 text-sm leading-6 text-gray-700">
                        {request.description || "No description provided."}
                      </p>
                    </div>

                    {/* DETAILS */}

                    <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      {/* ISSUE DATE */}

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                          Issue Date
                        </p>

                        <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-gray-700">
                          <CalendarDays size={16} className="text-blue-600" />

                          {formatDate(
                            request.issueDate ||
                              request.requestDate ||
                              request.createdAt,
                          )}
                        </p>
                      </div>

                      {/* SUBMITTED */}

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                          Submitted
                        </p>

                        <p className="mt-1 text-sm font-semibold text-gray-700">
                          {formatDate(request.createdAt)}
                        </p>
                      </div>

                      {/* CATEGORY */}

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                          Category
                        </p>

                        <p className="mt-1 text-sm font-semibold capitalize text-gray-700">
                          {request.category
                            ? request.category.replaceAll("_", " ")
                            : "Other"}
                        </p>
                      </div>

                      {/* PROPERTY */}

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                          Property
                        </p>

                        <p className="mt-1 text-sm font-semibold text-gray-700">
                          {property?.title || "Rental Property"}
                        </p>
                      </div>
                    </div>

                    {/* OWNER NOTE */}

                    {request.ownerNote && (
                      <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4">
                        <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
                          Owner Note
                        </p>

                        <p className="mt-2 text-sm leading-6 text-gray-700">
                          {request.ownerNote}
                        </p>
                      </div>
                    )}

                    {/* IMAGES */}

                    {request.images?.length > 0 && (
                      <div className="mt-5">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                          Attached Images
                        </p>

                        <div className="flex flex-wrap gap-3">
                          {request.images.map((image, index) => (
                            <img
                              key={index}
                              src={image}
                              alt={`Maintenance ${index + 1}`}
                              className="h-20 w-20 rounded-xl border border-gray-200 object-cover"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Maintenance;

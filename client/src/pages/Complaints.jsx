import { useEffect, useState } from "react";
import api from "../services/api";

const priorities = ["Low", "Medium", "High", "Urgent"];

const statusStyles = {
  Pending: "bg-yellow-100 text-yellow-700",
  "In Progress": "bg-blue-100 text-blue-700",
  Resolved: "bg-green-100 text-green-700",
  Closed: "bg-gray-100 text-gray-700",
};

const priorityStyles = {
  Low: "bg-green-100 text-green-700",
  Medium: "bg-yellow-100 text-yellow-700",
  High: "bg-orange-100 text-orange-700",
  Urgent: "bg-red-100 text-red-700",
};

const Complaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [contracts, setContracts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingContracts, setLoadingContracts] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    propertyId: "",
    subject: "",
    description: "",
    complaintDate: new Date().toISOString().split("T")[0],
    priority: "Medium",
  });

  const fetchContracts = async () => {
    try {
      setLoadingContracts(true);

      const response = await api.get("/contract/my-contracts");

      const allContracts = response.data.contracts || [];

      // Only active contracts
      const activeContracts = allContracts.filter(
        (contract) => contract.status === "Active",
      );

      setContracts(activeContracts);

      // Automatically select first property
      if (activeContracts.length > 0 && !form.propertyId) {
        const firstProperty = activeContracts[0].property;

        const firstPropertyId =
          typeof firstProperty === "object" ? firstProperty._id : firstProperty;

        setForm((prev) => ({
          ...prev,
          propertyId: firstPropertyId,
        }));
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load your active contracts.",
      );
    } finally {
      setLoadingContracts(false);
    }
  };

  const fetchComplaints = async () => {
    try {
      setLoading(true);

      const response = await api.get("/complaint/my");

      setComplaints(response.data.complaints || []);

      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load complaints.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
    fetchComplaints();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!form.propertyId) {
      setError("Please select a property.");
      return;
    }

    if (!form.subject.trim()) {
      setError("Please enter a complaint subject.");
      return;
    }

    if (!form.description.trim()) {
      setError("Please describe your complaint.");
      return;
    }

    try {
      setSubmitting(true);

      const response = await api.post(`/complaint/create/${form.propertyId}`, {
        subject: form.subject,
        description: form.description,
        complaintDate: form.complaintDate,
        priority: form.priority,
      });

      setSuccess(response.data.message || "Complaint submitted successfully.");

      // Reset form
      setForm((prev) => ({
        ...prev,
        subject: "",
        description: "",
        priority: "Medium",
        complaintDate: new Date().toISOString().split("T")[0],
      }));

      await fetchComplaints();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit complaint.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            Tenant Portal
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">Complaints</h1>

          <p className="mt-2 text-slate-500">
            Submit and track your rental-related complaints.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-1">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900">
                Submit Complaint
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Tell your property owner about an issue.
              </p>
            </div>

            {loadingContracts ? (
              <div className="rounded-xl bg-slate-50 p-5 text-center">
                <p className="text-sm text-slate-500">
                  Loading your rental properties...
                </p>
              </div>
            ) : contracts.length === 0 ? (
              <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-5">
                <p className="text-sm font-semibold text-yellow-800">
                  No Active Rental Contract
                </p>

                <p className="mt-2 text-sm leading-6 text-yellow-700">
                  You need an active rental contract before submitting a
                  complaint.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Select Property
                  </label>

                  <select
                    name="propertyId"
                    value={form.propertyId}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">Select your property</option>

                    {contracts.map((contract) => {
                      const property = contract.property;

                      const propertyId =
                        typeof property === "object" ? property?._id : property;

                      const propertyTitle =
                        typeof property === "object"
                          ? property?.title ||
                            property?.name ||
                            "Rental Property"
                          : "Rental Property";

                      const propertyAddress =
                        typeof property === "object" ? property?.address : "";

                      return (
                        <option key={contract._id} value={propertyId}>
                          {propertyTitle}
                          {propertyAddress ? ` - ${propertyAddress}` : ""}
                        </option>
                      );
                    })}
                  </select>

                  <p className="mt-1 text-xs text-slate-400">
                    Only properties with an active contract are shown.
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Subject
                  </label>

                  <input
                    type="text"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    placeholder="e.g. Water leakage"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Description
                  </label>

                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows="5"
                    placeholder="Describe your complaint..."
                    className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Complaint Date
                  </label>

                  <input
                    type="date"
                    name="complaintDate"
                    value={form.complaintDate}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Priority
                  </label>

                  <select
                    name="priority"
                    value={form.priority}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    {priorities.map((priority) => (
                      <option key={priority} value={priority}>
                        {priority}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? "Submitting..." : "Submit Complaint"}
                </button>
              </form>
            )}
          </div>

          <div className="lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  My Complaints
                </h2>

                <p className="text-sm text-slate-500">
                  Track the progress of your complaints.
                </p>
              </div>

              <button
                onClick={fetchComplaints}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
                <p className="text-slate-500">Loading complaints...</p>
              </div>
            ) : complaints.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-2xl">
                  💬
                </div>

                <h3 className="text-lg font-semibold text-slate-900">
                  No complaints yet
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Your submitted complaints will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {complaints.map((complaint) => (
                  <div
                    key={complaint._id}
                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">
                          {complaint.subject}
                        </h3>

                        <p className="mt-1 text-xs text-slate-400">
                          Complaint ID: {complaint._id}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            statusStyles[complaint.status] ||
                            "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {complaint.status}
                        </span>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            priorityStyles[complaint.priority] ||
                            "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {complaint.priority}
                        </span>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-4 border-y border-slate-100 py-5 sm:grid-cols-2">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                          Property
                        </p>

                        <p className="mt-1 font-medium text-slate-800">
                          {complaint.property?.title ||
                            complaint.property?.name ||
                            "Property"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                          Complaint Date
                        </p>

                        <p className="mt-1 font-medium text-slate-800">
                          {complaint.complaintDate
                            ? new Date(
                                complaint.complaintDate,
                              ).toLocaleDateString()
                            : "N/A"}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Description
                      </p>

                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                        {complaint.description}
                      </p>
                    </div>

                    {complaint.ownerNote && (
                      <div className="mt-5 rounded-xl bg-blue-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                          Owner Response
                        </p>

                        <p className="mt-2 text-sm leading-6 text-blue-900">
                          {complaint.ownerNote}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Complaints;

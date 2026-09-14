import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  User,
  Building2,
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

import api from "../../services/api";

function CreateContract() {
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [loadingApplications, setLoadingApplications] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    tenant: "",
    property: "",
    application: "",
    booking: "",

    startDate: "",
    endDate: "",
    rentalDuration: "",

    monthlyRent: "",
    securityDeposit: "",
    dueDate: "1",
    termsAndConditions: "",
  });

  // =====================================================
  // GET OWNER APPLICATIONS
  // =====================================================

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoadingApplications(true);
        setError("");

        const response = await api.get("/application/owner/applications");

        const data = response.data?.applications || [];

        // Only approved applications
        const approvedApplications = data.filter(
          (application) => application.status === "approved",
        );

        setApplications(approvedApplications);
      } catch (error) {
        console.error("Applications error:", error);

        setError(
          error.response?.data?.message ||
            "Failed to load approved applications.",
        );
      } finally {
        setLoadingApplications(false);
      }
    };

    fetchApplications();
  }, []);

  // =====================================================
  // FORMAT DATE FOR INPUT
  // =====================================================

  const formatDateForInput = (date) => {
    if (!date) return "";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    const year = parsedDate.getFullYear();
    const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
    const day = String(parsedDate.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  // =====================================================
  // CALCULATE END DATE
  // =====================================================

  const calculateEndDate = (startDate, duration) => {
    if (!startDate || !duration) {
      return "";
    }

    const months = Number(duration);

    if (!Number.isInteger(months) || months < 1) {
      return "";
    }

    const date = new Date(`${startDate}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    /*
      Example:

      Start: 01/10/2026
      Duration: 12 months

      End: 30/09/2027
    */

    date.setMonth(date.getMonth() + months);

    date.setDate(date.getDate() - 1);

    return formatDateForInput(date);
  };

  // =====================================================
  // INPUT CHANGE
  // =====================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =====================================================
  // SELECT APPROVED APPLICATION
  // =====================================================

  const handleApplicationChange = (event) => {
    const applicationId = event.target.value;

    const selectedApplication = applications.find(
      (item) => item._id === applicationId,
    );

    // Reset
    if (!selectedApplication) {
      setFormData((prev) => ({
        ...prev,
        tenant: "",
        property: "",
        application: "",
        booking: "",
        startDate: "",
        endDate: "",
        rentalDuration: "",
        monthlyRent: "",
      }));

      return;
    }

    // -------------------------------------------------
    // Application data
    // -------------------------------------------------

    const startDate = formatDateForInput(
      selectedApplication.preferredStartDate,
    );

    const duration = Number(selectedApplication.rentalDuration);

    const endDate = calculateEndDate(startDate, duration);

    const tenantId =
      selectedApplication.tenant?._id ||
      selectedApplication.user?._id ||
      selectedApplication.applicant?._id ||
      "";

    const propertyId = selectedApplication.property?._id || "";

    const monthlyRent =
      selectedApplication.property?.rent || selectedApplication.rent || "";

    // -------------------------------------------------
    // Auto-fill contract
    // -------------------------------------------------

    setFormData((prev) => ({
      ...prev,

      tenant: tenantId,

      property: propertyId,

      application: selectedApplication._id,

      booking: selectedApplication.booking?._id || "",

      startDate,

      rentalDuration: duration || "",

      endDate,

      monthlyRent,
    }));
  };

  // =====================================================
  // CREATE CONTRACT
  // =====================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    // -------------------------------------------------
    // Application
    // -------------------------------------------------

    if (!formData.application) {
      setError("Please select an approved application.");
      return;
    }

    // -------------------------------------------------
    // Tenant
    // -------------------------------------------------

    if (!formData.tenant) {
      setError("Tenant information is missing.");
      return;
    }

    // -------------------------------------------------
    // Property
    // -------------------------------------------------

    if (!formData.property) {
      setError("Property information is missing.");
      return;
    }

    // -------------------------------------------------
    // Start Date
    // -------------------------------------------------

    if (!formData.startDate) {
      setError("Start date is missing.");
      return;
    }

    // -------------------------------------------------
    // End Date
    // -------------------------------------------------

    if (!formData.endDate) {
      setError("End date is missing.");
      return;
    }

    // -------------------------------------------------
    // Date validation
    // -------------------------------------------------

    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      setError("End date must be after start date.");
      return;
    }

    // -------------------------------------------------
    // Monthly Rent
    // -------------------------------------------------

    if (!formData.monthlyRent || Number(formData.monthlyRent) <= 0) {
      setError("Please enter a valid monthly rent.");
      return;
    }

    // -------------------------------------------------
    // Due Date
    // -------------------------------------------------

    if (!formData.dueDate) {
      setError("Please select a rent due date.");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        tenant: formData.tenant,

        property: formData.property,

        application: formData.application || null,

        booking: formData.booking || null,

        startDate: formData.startDate,

        endDate: formData.endDate,

        monthlyRent: Number(formData.monthlyRent),

        securityDeposit: Number(formData.securityDeposit || 0),

        dueDate: Number(formData.dueDate),

        termsAndConditions: formData.termsAndConditions.trim(),
      };

      await api.post("/contract/create", payload);

      setSuccess("Rental contract created successfully.");

      setTimeout(() => {
        navigate("/owner/contracts");
      }, 1200);
    } catch (error) {
      console.error("Create contract error:", error);

      setError(
        error.response?.data?.message || "Failed to create rental contract.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =====================================================
  // SELECTED APPLICATION
  // =====================================================

  const selectedApplication = applications.find(
    (application) => application._id === formData.application,
  );

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="min-h-screen bg-gray-50">
      {/* =================================================
          HEADER
      ================================================= */}

      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link
            to="/owner/contracts"
            className="flex h-10 w-10 items-center justify-center rounded-lg border text-gray-600 hover:bg-gray-50"
          >
            <ArrowLeft size={19} />
          </Link>

          <div>
            <h1 className="text-xl font-bold text-gray-800">
              Create Rental Contract
            </h1>

            <p className="text-sm text-gray-500">
              Create a contract for an approved tenant
            </p>
          </div>
        </div>
      </header>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Error */}

        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            <AlertCircle size={19} />

            <span>{error}</span>
          </div>
        )}

        {/* Success */}

        {success && (
          <div className="mb-6 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-4 text-green-700">
            <CheckCircle size={19} />

            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* =================================================
              APPROVED APPLICATION
          ================================================= */}

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                <FileText size={20} className="text-blue-600" />
              </div>

              <div>
                <h2 className="font-bold text-gray-800">
                  Approved Application
                </h2>

                <p className="text-sm text-gray-500">
                  Select an approved tenant application.
                </p>
              </div>
            </div>

            {loadingApplications ? (
              <div className="h-12 animate-pulse rounded-lg bg-gray-200" />
            ) : applications.length === 0 ? (
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
                No approved applications are available for contract creation.
              </div>
            ) : (
              <select
                value={formData.application}
                onChange={handleApplicationChange}
                className="w-full rounded-lg border px-4 py-3 text-sm outline-none focus:border-blue-500"
                required
              >
                <option value="">Select an approved application</option>

                {applications.map((application) => (
                  <option key={application._id} value={application._id}>
                    {application.tenant?.name ||
                      application.user?.name ||
                      application.applicant?.name ||
                      "Tenant"}{" "}
                    — {application.property?.title || "Property"}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* =================================================
              SELECTED APPLICATION SUMMARY
          ================================================= */}

          {selectedApplication && (
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-6">
              <h2 className="mb-5 font-bold text-blue-800">
                Application Information
              </h2>

              <div className="grid gap-5 md:grid-cols-2">
                {/* Tenant */}

                <div className="rounded-lg bg-white p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50">
                      <User size={19} className="text-blue-600" />
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">Tenant</p>

                      <p className="font-semibold text-gray-800">
                        {selectedApplication.tenant?.name || "Tenant"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Property */}

                <div className="rounded-lg bg-white p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50">
                      <Building2 size={19} className="text-green-600" />
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">Property</p>

                      <p className="font-semibold text-gray-800">
                        {selectedApplication.property?.title || "Property"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Start Date */}

                <div className="rounded-lg bg-white p-4">
                  <p className="text-xs text-gray-500">Requested Start Date</p>

                  <p className="mt-1 font-semibold text-gray-800">
                    {formData.startDate
                      ? new Date(
                          `${formData.startDate}T00:00:00`,
                        ).toLocaleDateString()
                      : "-"}
                  </p>
                </div>

                {/* Duration */}

                <div className="rounded-lg bg-white p-4">
                  <p className="text-xs text-gray-500">Rental Duration</p>

                  <p className="mt-1 font-semibold text-gray-800">
                    {formData.rentalDuration
                      ? `${formData.rentalDuration} ${
                          Number(formData.rentalDuration) === 1
                            ? "Month"
                            : "Months"
                        }`
                      : "-"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* =================================================
              CONTRACT PERIOD
          ================================================= */}

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <Calendar size={20} className="text-blue-600" />

              <div>
                <h2 className="font-bold text-gray-800">Contract Period</h2>

                <p className="text-sm text-gray-500">
                  Dates are automatically taken from the approved application.
                </p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {/* Start Date */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Start Date
                </label>

                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  readOnly
                  className="w-full cursor-not-allowed rounded-lg border bg-gray-100 px-4 py-3 text-gray-600 outline-none"
                />
              </div>

              {/* Duration */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Rental Duration
                </label>

                <input
                  type="text"
                  value={
                    formData.rentalDuration
                      ? `${formData.rentalDuration} ${
                          Number(formData.rentalDuration) === 1
                            ? "Month"
                            : "Months"
                        }`
                      : ""
                  }
                  readOnly
                  className="w-full cursor-not-allowed rounded-lg border bg-gray-100 px-4 py-3 text-gray-600 outline-none"
                />
              </div>

              {/* End Date */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  End Date
                </label>

                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  readOnly
                  className="w-full cursor-not-allowed rounded-lg border bg-gray-100 px-4 py-3 text-gray-600 outline-none"
                />
              </div>
            </div>

            {formData.startDate && formData.endDate && (
              <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                <strong>Contract Period:</strong>{" "}
                {new Date(
                  `${formData.startDate}T00:00:00`,
                ).toLocaleDateString()}{" "}
                →{" "}
                {new Date(`${formData.endDate}T00:00:00`).toLocaleDateString()}
              </div>
            )}
          </div>

          {/* =================================================
              FINANCIAL INFORMATION
          ================================================= */}

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <DollarSign size={20} className="text-blue-600" />

              <div>
                <h2 className="font-bold text-gray-800">
                  Rent & Payment Information
                </h2>

                <p className="text-sm text-gray-500">
                  Monthly rent is automatically taken from the property.
                </p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {/* Monthly Rent */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Monthly Rent
                </label>

                <input
                  type="number"
                  name="monthlyRent"
                  value={formData.monthlyRent}
                  readOnly
                  className="w-full cursor-not-allowed rounded-lg border bg-gray-100 px-4 py-3 text-gray-600 outline-none"
                />
              </div>

              {/* Security Deposit */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Security Deposit
                </label>

                <input
                  type="number"
                  name="securityDeposit"
                  value={formData.securityDeposit}
                  onChange={handleChange}
                  min="0"
                  placeholder="e.g. 50000"
                  className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
                />

                <p className="mt-1 text-xs text-gray-400">
                  Tenant will pay this before the contract becomes active.
                </p>
              </div>

              {/* Due Date */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Rent Due Day
                </label>

                <select
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
                  required
                >
                  {Array.from({ length: 28 }, (_, index) => index + 1).map(
                    (day) => (
                      <option key={day} value={day}>
                        Day {day}
                      </option>
                    ),
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* =================================================
              TERMS
          ================================================= */}

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-2 font-bold text-gray-800">Terms & Conditions</h2>

            <p className="mb-4 text-sm text-gray-500">
              Add any important rental terms and conditions.
            </p>

            <textarea
              name="termsAndConditions"
              value={formData.termsAndConditions}
              onChange={handleChange}
              rows={6}
              placeholder="Enter rental terms and conditions..."
              className="w-full resize-none rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          {/* =================================================
              SUBMIT
          ================================================= */}

          <div className="flex justify-end gap-3">
            <Link
              to="/owner/contracts"
              className="rounded-lg border bg-white px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={
                submitting || loadingApplications || applications.length === 0
              }
              className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Creating Contract..." : "Create Rental Contract"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default CreateContract;

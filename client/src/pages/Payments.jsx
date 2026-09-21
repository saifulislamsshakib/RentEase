import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  DollarSign,
  CalendarDays,
  CreditCard,
  Clock3,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ArrowLeft,
  Receipt,
  MapPin,
  ShieldCheck,
  Send,
  Smartphone,
  Building2,
  User,
} from "lucide-react";

import api from "../services/api";

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Security deposit form
  const [depositForm, setDepositForm] = useState({
    paymentMethod: "",
    reference: "",
    note: "",
  });

  const [submittingDeposit, setSubmittingDeposit] = useState(false);

  const [depositMessage, setDepositMessage] = useState("");

  const [depositError, setDepositError] = useState("");

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/payment/my");

      setPayments(response.data?.payments || []);
    } catch (err) {
      console.error("Payments error:", err);

      setError(
        err.response?.data?.message || "Failed to load payment information.",
      );
    } finally {
      setLoading(false);
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

  const formatMethod = (method) => {
    if (!method) return "Other";

    return method
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "paid":
        return {
          wrapper: "bg-emerald-50 text-emerald-700 border border-emerald-200",
          icon: <CheckCircle2 size={16} />,
        };

      case "overdue":
        return {
          wrapper: "bg-red-50 text-red-700 border border-red-200",
          icon: <AlertCircle size={16} />,
        };

      case "cancelled":
        return {
          wrapper: "bg-gray-100 text-gray-600 border border-gray-200",
          icon: <XCircle size={16} />,
        };

      default:
        return {
          wrapper: "bg-amber-50 text-amber-700 border border-amber-200",
          icon: <Clock3 size={16} />,
        };
    }
  };

  const securityDepositPayments = payments.filter(
    (payment) => payment.type === "security_deposit",
  );

  const pendingSecurityDeposits = securityDepositPayments.filter(
    (payment) => payment.status === "pending" || payment.status === "overdue",
  );

  const handleDepositChange = (e) => {
    const { name, value } = e.target;

    setDepositForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSecurityDepositSubmit = async (contractId) => {
    try {
      setSubmittingDeposit(true);
      setDepositMessage("");
      setDepositError("");

      if (!depositForm.paymentMethod) {
        setDepositError("Please select a payment method.");

        setSubmittingDeposit(false);
        return;
      }

      if (
        depositForm.paymentMethod === "mobile_banking" &&
        !depositForm.reference.trim()
      ) {
        setDepositError("Please enter the transaction/reference number.");

        setSubmittingDeposit(false);
        return;
      }

      const response = await api.post(
        `/payment/security-deposit/${contractId}`,
        {
          paymentMethod: depositForm.paymentMethod,

          reference: depositForm.reference,

          note: depositForm.note,
        },
      );

      setDepositMessage(
        response.data?.message || "Security deposit submitted successfully.",
      );

      setDepositForm({
        paymentMethod: "",
        reference: "",
        note: "",
      });

      await fetchPayments();
    } catch (err) {
      console.error("Security deposit submission error:", err);

      setDepositError(
        err.response?.data?.message || "Failed to submit security deposit.",
      );
    } finally {
      setSubmittingDeposit(false);
    }
  };

  const totalPaid = payments
    .filter((payment) => payment.status === "paid")
    .reduce((total, payment) => total + Number(payment.amount || 0), 0);

  const totalPending = payments
    .filter((payment) => payment.status === "pending")
    .reduce((total, payment) => total + Number(payment.amount || 0), 0);

  const totalOverdue = payments
    .filter((payment) => payment.status === "overdue")
    .reduce((total, payment) => total + Number(payment.amount || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>

          <p className="text-slate-600 font-medium">
            Loading payment information...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600 transition mb-5"
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </Link>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
                Rent Payments
              </h1>

              <p className="mt-2 text-slate-500">
                Track your rent payments, security deposit, due dates and
                payment history.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm">
              <Receipt className="text-blue-600" size={20} />

              <span className="text-sm font-semibold text-slate-700">
                {payments.length} Payment Records
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-4">
            <AlertCircle size={20} />

            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {depositMessage && (
          <div className="mb-6 flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-4">
            <CheckCircle2 size={20} />

            <p className="text-sm font-medium">{depositMessage}</p>
          </div>
        )}

        {depositError && (
          <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-4">
            <AlertCircle size={20} />

            <p className="text-sm font-medium">{depositError}</p>
          </div>
        )}

        {pendingSecurityDeposits.length > 0 && (
          <div className="mb-8">
            <div className="bg-white border border-amber-200 rounded-2xl shadow-sm overflow-hidden">
              {/* Header */}

              <div className="px-5 sm:px-7 py-5 bg-amber-50 border-b border-amber-200">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center">
                    <ShieldCheck size={24} className="text-amber-600" />
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      Security Deposit Required
                    </h2>

                    <p className="text-sm text-slate-600 mt-1">
                      Send your security deposit and submit the payment details
                      for owner verification.
                    </p>
                  </div>
                </div>
              </div>

              {/* Deposit Cards */}

              <div className="p-5 sm:p-7 space-y-6">
                {pendingSecurityDeposits.map((payment) => {
                  const paymentInfo = payment.owner?.paymentInformation || {};

                  return (
                    <div
                      key={payment._id}
                      className="border border-slate-200 rounded-2xl p-5"
                    >
                      {/* Property */}

                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                        <div>
                          <h3 className="text-lg font-bold text-slate-900">
                            {payment.property?.title || "Rental Property"}
                          </h3>

                          {payment.property?.address && (
                            <div className="flex items-center gap-1.5 mt-1 text-sm text-slate-500">
                              <MapPin size={15} />

                              <span>{payment.property.address}</span>
                            </div>
                          )}
                        </div>

                        <div className="text-left md:text-right">
                          <p className="text-xs uppercase tracking-wide text-slate-500">
                            Security Deposit
                          </p>

                          <p className="text-2xl font-bold text-slate-900">
                            ${Number(payment.amount || 0).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 p-5">
                        <div className="flex items-center gap-3 mb-5">
                          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                            <CreditCard size={20} className="text-blue-600" />
                          </div>

                          <div>
                            <h4 className="font-bold text-slate-900">
                              Where to Send Payment
                            </h4>

                            <p className="text-sm text-slate-600">
                              Send the payment to the owner's account below.
                            </p>
                          </div>
                        </div>

                        {/* Owner */}

                        <div className="mb-4 rounded-xl bg-white border border-slate-200 p-4">
                          <div className="flex items-center gap-2">
                            <User size={17} className="text-blue-600" />

                            <div>
                              <p className="text-xs text-slate-500">
                                Property Owner
                              </p>

                              <p className="font-semibold text-slate-900">
                                {payment.owner?.name || "Owner"}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* bKash */}

                          {paymentInfo.bkash && (
                            <div className="bg-white rounded-xl border border-slate-200 p-4">
                              <div className="flex items-center gap-2">
                                <Smartphone
                                  size={17}
                                  className="text-pink-600"
                                />

                                <p className="text-xs uppercase tracking-wide text-slate-500">
                                  bKash
                                </p>
                              </div>

                              <p className="mt-2 font-bold text-slate-900">
                                {paymentInfo.bkash}
                              </p>
                            </div>
                          )}

                          {/* Nagad */}

                          {paymentInfo.nagad && (
                            <div className="bg-white rounded-xl border border-slate-200 p-4">
                              <div className="flex items-center gap-2">
                                <Smartphone
                                  size={17}
                                  className="text-orange-600"
                                />

                                <p className="text-xs uppercase tracking-wide text-slate-500">
                                  Nagad
                                </p>
                              </div>

                              <p className="mt-2 font-bold text-slate-900">
                                {paymentInfo.nagad}
                              </p>
                            </div>
                          )}

                          {/* Bank */}

                          {paymentInfo.bankName && (
                            <div className="bg-white rounded-xl border border-slate-200 p-4 sm:col-span-2">
                              <div className="flex items-center gap-2 mb-4">
                                <Building2
                                  size={18}
                                  className="text-blue-600"
                                />

                                <p className="font-bold text-slate-900">
                                  Bank Transfer
                                </p>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                  <p className="text-xs text-slate-500">
                                    Bank Name
                                  </p>

                                  <p className="font-semibold text-slate-900">
                                    {paymentInfo.bankName}
                                  </p>
                                </div>

                                <div>
                                  <p className="text-xs text-slate-500">
                                    Account Name
                                  </p>

                                  <p className="font-semibold text-slate-900">
                                    {paymentInfo.accountName || "N/A"}
                                  </p>
                                </div>

                                <div>
                                  <p className="text-xs text-slate-500">
                                    Account Number
                                  </p>

                                  <p className="font-semibold text-slate-900">
                                    {paymentInfo.accountNumber || "N/A"}
                                  </p>
                                </div>

                                <div>
                                  <p className="text-xs text-slate-500">
                                    Branch
                                  </p>

                                  <p className="font-semibold text-slate-900">
                                    {paymentInfo.branch || "N/A"}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Instructions */}

                          {paymentInfo.instructions && (
                            <div className="bg-white rounded-xl border border-slate-200 p-4 sm:col-span-2">
                              <p className="text-xs uppercase tracking-wide text-slate-500">
                                Payment Instructions
                              </p>

                              <p className="mt-2 text-sm text-slate-700 whitespace-pre-line">
                                {paymentInfo.instructions}
                              </p>
                            </div>
                          )}

                          {/* No Payment Info */}

                          {!paymentInfo.bkash &&
                            !paymentInfo.nagad &&
                            !paymentInfo.bankName && (
                              <div className="sm:col-span-2 bg-red-50 border border-red-200 rounded-xl p-4">
                                <p className="text-sm font-medium text-red-700">
                                  The owner has not provided payment account
                                  information yet. Please contact the owner
                                  before making the payment.
                                </p>
                              </div>
                            )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                        {/* Due Date */}

                        <div className="bg-slate-50 rounded-xl p-4">
                          <p className="text-xs uppercase tracking-wide text-slate-500">
                            Due Date
                          </p>

                          <div className="flex items-center gap-2 mt-2">
                            <CalendarDays size={17} className="text-blue-600" />

                            <p className="font-semibold text-slate-800">
                              {formatDate(payment.dueDate)}
                            </p>
                          </div>
                        </div>

                        {/* Status */}

                        <div className="bg-slate-50 rounded-xl p-4">
                          <p className="text-xs uppercase tracking-wide text-slate-500">
                            Status
                          </p>

                          <div className="mt-2">
                            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                              <Clock3 size={15} />
                              Waiting for Confirmation
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-slate-200 pt-6">
                        <h4 className="font-bold text-slate-900 mb-4">
                          Payment Details
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          {/* Payment Method */}

                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                              Payment Method
                            </label>

                            <select
                              name="paymentMethod"
                              value={depositForm.paymentMethod}
                              onChange={handleDepositChange}
                              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            >
                              <option value="">Select payment method</option>

                              <option value="mobile_banking">
                                bKash / Nagad
                              </option>

                              <option value="bank_transfer">
                                Bank Transfer
                              </option>

                              <option value="cash">Cash</option>

                              <option value="card">Card</option>

                              <option value="other">Other</option>
                            </select>
                          </div>

                          {/* Reference */}

                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                              Transaction / Reference
                            </label>

                            <input
                              type="text"
                              name="reference"
                              value={depositForm.reference}
                              onChange={handleDepositChange}
                              placeholder="e.g. Transaction ID"
                              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />

                            <p className="mt-1 text-xs text-slate-400">
                              Required for mobile banking payments.
                            </p>
                          </div>

                          {/* Note */}

                          <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                              Note
                              <span className="font-normal text-slate-400">
                                {" "}
                                (Optional)
                              </span>
                            </label>

                            <textarea
                              name="note"
                              value={depositForm.note}
                              onChange={handleDepositChange}
                              rows={3}
                              placeholder="Add any additional payment information..."
                              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-800 outline-none resize-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                          </div>
                        </div>

                        {/* Submit */}

                        <div className="mt-5 flex justify-end">
                          <button
                            type="button"
                            onClick={() =>
                              handleSecurityDepositSubmit(
                                payment.contract?._id || payment.contract,
                              )
                            }
                            disabled={submittingDeposit}
                            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold px-6 py-3 rounded-xl transition shadow-sm"
                          >
                            {submittingDeposit ? (
                              <>
                                <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                                Submitting...
                              </>
                            ) : (
                              <>
                                <Send size={18} />
                                Submit Security Deposit
                              </>
                            )}
                          </button>
                        </div>

                        <p className="text-xs text-slate-500 mt-3 text-right">
                          The owner will verify your payment before activating
                          the contract.
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {/* Total Paid */}

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-5">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center">
                <CheckCircle2 size={23} className="text-emerald-600" />
              </div>

              <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Paid
              </span>
            </div>

            <p className="text-sm text-slate-500">Total Paid</p>

            <h2 className="text-2xl font-bold text-slate-900 mt-1">
              ${totalPaid.toLocaleString()}
            </h2>
          </div>

          {/* Pending */}

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-5">
              <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center">
                <Clock3 size={23} className="text-amber-600" />
              </div>

              <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Pending
              </span>
            </div>

            <p className="text-sm text-slate-500">Pending Amount</p>

            <h2 className="text-2xl font-bold text-slate-900 mt-1">
              ${totalPending.toLocaleString()}
            </h2>
          </div>

          {/* Overdue */}

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-5">
              <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center">
                <AlertCircle size={23} className="text-red-600" />
              </div>

              <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Overdue
              </span>
            </div>

            <p className="text-sm text-slate-500">Overdue Amount</p>

            <h2 className="text-2xl font-bold text-slate-900 mt-1">
              ${totalOverdue.toLocaleString()}
            </h2>
          </div>

          {/* Records */}

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-5">
              <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
                <Receipt size={23} className="text-blue-600" />
              </div>

              <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Records
              </span>
            </div>

            <p className="text-sm text-slate-500">Total Records</p>

            <h2 className="text-2xl font-bold text-slate-900 mt-1">
              {payments.length}
            </h2>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          {/* Section Header */}

          <div className="px-5 sm:px-7 py-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Payment History
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                All your rental payment records
              </p>
            </div>

            <span className="text-sm font-medium text-slate-500">
              {payments.length} records
            </span>
          </div>

          {/* Empty State */}

          {payments.length === 0 ? (
            <div className="px-6 py-20 text-center">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-5">
                <DollarSign size={38} className="text-blue-600" />
              </div>

              <h3 className="text-xl font-bold text-slate-900">
                No payment records yet
              </h3>

              <p className="text-slate-500 max-w-md mx-auto mt-2 leading-6">
                Your rent and security deposit payment records will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {payments.map((payment) => {
                const statusStyle = getStatusStyle(payment.status);

                return (
                  <div
                    key={payment._id}
                    className="p-5 sm:p-7 hover:bg-slate-50/70 transition"
                  >
                    {/* Top */}

                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                      <div className="flex gap-4">
                        <div className="hidden sm:flex w-12 h-12 rounded-xl bg-blue-50 items-center justify-center shrink-0">
                          {payment.type === "security_deposit" ? (
                            <ShieldCheck size={23} className="text-blue-600" />
                          ) : (
                            <DollarSign size={23} className="text-blue-600" />
                          )}
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-bold text-slate-900">
                              {payment.property?.title || "Rental Property"}
                            </h3>

                            {payment.type === "security_deposit" && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold">
                                <ShieldCheck size={13} />
                                Security Deposit
                              </span>
                            )}
                          </div>

                          {payment.property?.address && (
                            <div className="flex items-center gap-1.5 mt-1 text-sm text-slate-500">
                              <MapPin size={15} />

                              <span>{payment.property.address}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Status */}

                      <div
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold w-fit ${statusStyle.wrapper}`}
                      >
                        {statusStyle.icon}

                        {payment.status?.charAt(0).toUpperCase() +
                          payment.status?.slice(1)}
                      </div>
                    </div>

                    {/* Details */}

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                      {/* Amount */}

                      <div className="bg-slate-50 rounded-xl p-4">
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                          Amount
                        </p>

                        <p className="text-xl font-bold text-slate-900 mt-1">
                          ${Number(payment.amount || 0).toLocaleString()}
                        </p>
                      </div>

                      {/* Due Date */}

                      <div className="bg-slate-50 rounded-xl p-4">
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                          Due Date
                        </p>

                        <div className="flex items-center gap-2 mt-2">
                          <CalendarDays size={17} className="text-blue-600" />

                          <p className="font-semibold text-slate-800">
                            {formatDate(payment.dueDate)}
                          </p>
                        </div>
                      </div>

                      {/* Paid Date */}

                      <div className="bg-slate-50 rounded-xl p-4">
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                          Paid Date
                        </p>

                        <p className="font-semibold text-slate-800 mt-2">
                          {payment.paidDate
                            ? formatDate(payment.paidDate)
                            : "Not paid"}
                        </p>
                      </div>

                      {/* Payment Method */}

                      <div className="bg-slate-50 rounded-xl p-4">
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                          Payment Method
                        </p>

                        <div className="flex items-center gap-2 mt-2">
                          <CreditCard size={17} className="text-blue-600" />

                          <p className="font-semibold text-slate-800">
                            {formatMethod(payment.paymentMethod)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Reference / Note */}

                    {(payment.reference || payment.note) && (
                      <div className="mt-5 flex flex-col gap-2 text-sm">
                        {payment.reference && (
                          <p className="text-slate-600">
                            <span className="font-semibold text-slate-800">
                              Reference:
                            </span>{" "}
                            {payment.reference}
                          </p>
                        )}

                        {payment.note && (
                          <p className="text-slate-600">
                            <span className="font-semibold text-slate-800">
                              Note:
                            </span>{" "}
                            {payment.note}
                          </p>
                        )}
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

export default Payments;

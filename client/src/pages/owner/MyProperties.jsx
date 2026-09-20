import React, { useEffect, useMemo, useState } from "react";
import {
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  DollarSign,
  Home,
  Loader2,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  Wallet,
  XCircle,
} from "lucide-react";
import api from "../../services/api";
import { Link } from "react-router-dom";

const MyProperties = () => {
  const [properties, setProperties] = useState([]);
  const [payments, setPayments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const [error, setError] = useState("");

  // =====================================================
  // FETCH DATA
  // =====================================================

  const fetchData = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const [propertyResponse, paymentResponse] = await Promise.all([
        api.get("/property/my-properties"),
        api.get("/payment/owner"),
      ]);

      setProperties(propertyResponse.data?.properties || []);

      setPayments(paymentResponse.data?.payments || []);
    } catch (err) {
      console.error("My properties error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load your properties. Please try again.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // =====================================================
  // HELPERS
  // =====================================================

  const getPropertyId = (property) => {
    if (!property) return null;

    return property._id || property.id || null;
  };

  const getPaymentPropertyId = (payment) => {
    if (!payment?.property) return null;

    if (typeof payment.property === "string") {
      return payment.property;
    }

    return payment.property._id || payment.property.id || null;
  };

  const getPropertyPayments = (propertyId) => {
    return payments.filter(
      (payment) => getPaymentPropertyId(payment) === propertyId,
    );
  };

  const getSecurityDeposit = (propertyPayments) => {
    return propertyPayments.find(
      (payment) => payment.type === "security_deposit",
    );
  };

  const getRentPayments = (propertyPayments) => {
    return propertyPayments
      .filter((payment) => payment.type === "rent")
      .sort((a, b) => {
        return new Date(b.dueDate || 0) - new Date(a.dueDate || 0);
      });
  };

  const getContractId = (payment) => {
    if (!payment?.contract) return null;

    if (typeof payment.contract === "string") {
      return payment.contract;
    }

    return payment.contract._id || payment.contract.id || null;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
      maximumFractionDigits: 2,
    }).format(Number(amount || 0));
  };

  const formatDate = (date) => {
    if (!date) return "N/A";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "N/A";
    }

    return parsedDate.toLocaleDateString("en-AU", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-700";

      case "pending":
        return "bg-yellow-100 text-yellow-700";

      case "overdue":
        return "bg-red-100 text-red-700";

      case "rejected":
        return "bg-red-100 text-red-700";

      case "cancelled":
        return "bg-gray-100 text-gray-600";

      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "paid":
        return <CheckCircle2 size={15} />;

      case "pending":
        return <Clock3 size={15} />;

      case "overdue":
        return <XCircle size={15} />;

      case "rejected":
        return <XCircle size={15} />;

      default:
        return null;
    }
  };

  const getStatusText = (status) => {
    if (!status) return "Unknown";

    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // =====================================================
  // ACCEPT / REJECT SECURITY DEPOSIT
  // =====================================================

  const handlePaymentStatus = async (paymentId, status) => {
    if (!paymentId) return;

    const actionText = status === "paid" ? "accept" : "reject";

    const confirmed = window.confirm(
      `Are you sure you want to ${actionText} this security deposit?`,
    );

    if (!confirmed) return;

    try {
      setActionLoading(paymentId);
      setError("");

      await api.put(`/payment/${paymentId}`, {
        status,
      });

      await fetchData(true);

      window.alert(
        status === "paid"
          ? "Security deposit accepted successfully."
          : "Security deposit rejected successfully.",
      );
    } catch (err) {
      console.error("Payment status update error:", err);

      window.alert(
        err.response?.data?.message || "Failed to update payment status.",
      );
    } finally {
      setActionLoading(null);
    }
  };

  // =====================================================
  // SEARCH
  // =====================================================

  const filteredProperties = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) {
      return properties;
    }

    return properties.filter((property) => {
      const title = property.title || "";
      const city = property.city || "";
      const address = property.address || "";
      const type = property.propertyType || "";

      return (
        title.toLowerCase().includes(term) ||
        city.toLowerCase().includes(term) ||
        address.toLowerCase().includes(term) ||
        type.toLowerCase().includes(term)
      );
    });
  }, [properties, searchTerm]);

  // =====================================================
  // SUMMARY
  // =====================================================

  const summary = useMemo(() => {
    let totalRent = 0;
    let totalPaid = 0;
    let totalPending = 0;
    let totalOverdue = 0;

    payments.forEach((payment) => {
      const amount = Number(payment.amount || 0);

      if (payment.type === "rent") {
        totalRent += amount;
      }

      if (payment.status === "paid") {
        totalPaid += amount;
      }

      if (payment.status === "pending") {
        totalPending += amount;
      }

      if (payment.status === "overdue") {
        totalOverdue += amount;
      }
    });

    return {
      totalProperties: properties.length,
      totalRent,
      totalPaid,
      totalPending,
      totalOverdue,
    };
  }, [properties, payments]);

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={40} className="animate-spin text-blue-600" />

          <p className="text-gray-600">Loading your properties...</p>
        </div>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="mb-4">
            <Link
              to="/owner/dashboard"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              ← Back to Dashboard
            </Link>
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              My Properties
            </h1>

            <p className="text-gray-600 mt-1">
              Manage your properties and track tenant payments.
            </p>
          </div>

          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-60"
          >
            <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {/* SUMMARY */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Properties</p>

                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {summary.totalProperties}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
                <Building2 size={22} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Rent Records</p>

                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(summary.totalRent)}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-purple-100 text-purple-600">
                <Wallet size={22} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Paid</p>

                <p className="text-2xl font-bold text-green-600 mt-1">
                  {formatCurrency(summary.totalPaid)}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-green-100 text-green-600">
                <CheckCircle2 size={22} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending / Overdue</p>

                <p className="text-2xl font-bold text-orange-600 mt-1">
                  {formatCurrency(summary.totalPending + summary.totalOverdue)}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-orange-100 text-orange-600">
                <Clock3 size={22} />
              </div>
            </div>
          </div>
        </div>

        {/* SEARCH */}
        <div className="bg-white border rounded-xl p-4 mb-6">
          <div className="relative max-w-md">
            <Search
              size={19}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search property..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* NO PROPERTIES */}
        {filteredProperties.length === 0 && (
          <div className="bg-white border rounded-xl p-10 text-center">
            <Home size={42} className="mx-auto text-gray-400 mb-3" />

            <h2 className="text-lg font-semibold text-gray-800">
              {searchTerm
                ? "No properties found"
                : "You don't have any properties yet"}
            </h2>

            <p className="text-gray-500 mt-1">
              {searchTerm
                ? "Try a different search term."
                : "Your properties will appear here."}
            </p>
          </div>
        )}

        {/* PROPERTY LIST */}
        <div className="space-y-6">
          {filteredProperties.map((property) => {
            const propertyId = getPropertyId(property);

            const propertyPayments = getPropertyPayments(propertyId);

            const securityDeposit = getSecurityDeposit(propertyPayments);

            const rentPayments = getRentPayments(propertyPayments);

            const contractId = getContractId(securityDeposit);

            const paymentLoading =
              securityDeposit && actionLoading === securityDeposit._id;

            return (
              <div
                key={propertyId}
                className="bg-white border rounded-2xl overflow-hidden shadow-sm"
              >
                {/* PROPERTY HEADER */}
                <div className="p-5 md:p-6 border-b">
                  <div className="flex gap-4">
                    <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                      <Building2 size={28} />
                    </div>

                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-gray-900">
                        {property.title || "Untitled Property"}
                      </h2>

                      <div className="flex items-center gap-1.5 text-gray-500 text-sm mt-2">
                        <MapPin size={16} />

                        <span>
                          {property.address || "Address not available"}

                          {property.city ? `, ${property.city}` : ""}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-3">
                        {property.propertyType && (
                          <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">
                            {property.propertyType}
                          </span>
                        )}

                        <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                          {formatCurrency(property.rent)} / month
                        </span>

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            property.isAvailable
                              ? "bg-green-100 text-green-700"
                              : "bg-orange-100 text-orange-700"
                          }`}
                        >
                          {property.isAvailable ? "Available" : "Occupied"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* PAYMENT AREA */}
                <div className="p-5 md:p-6">
                  {/* SECURITY DEPOSIT */}
                  <div className="border rounded-xl overflow-hidden mb-6">
                    <div className="bg-gray-50 px-4 py-3 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <DollarSign size={19} className="text-blue-600" />

                        <h3 className="font-semibold text-gray-900">
                          Security Deposit
                        </h3>
                      </div>

                      {securityDeposit && (
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(
                            securityDeposit.status,
                          )}`}
                        >
                          {getStatusIcon(securityDeposit.status)}

                          {getStatusText(securityDeposit.status)}
                        </span>
                      )}
                    </div>

                    <div className="p-4">
                      {securityDeposit ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* AMOUNT */}
                          <div>
                            <p className="text-xs text-gray-500">Amount</p>

                            <p className="font-semibold text-gray-900 mt-1">
                              {formatCurrency(securityDeposit.amount)}
                            </p>
                          </div>

                          {/* DUE DATE */}
                          <div>
                            <p className="text-xs text-gray-500">Due Date</p>

                            <p className="font-medium text-gray-800 mt-1">
                              {formatDate(securityDeposit.dueDate)}
                            </p>
                          </div>

                          {/* METHOD */}
                          <div>
                            <p className="text-xs text-gray-500">
                              Payment Method
                            </p>

                            <p className="font-medium text-gray-800 mt-1 capitalize">
                              {securityDeposit.paymentMethod
                                ? securityDeposit.paymentMethod.replace(
                                    "_",
                                    " ",
                                  )
                                : "Not provided"}
                            </p>
                          </div>

                          {/* REFERENCE */}
                          {securityDeposit.reference && (
                            <div>
                              <p className="text-xs text-gray-500">Reference</p>

                              <p className="font-medium text-gray-800 mt-1">
                                {securityDeposit.reference}
                              </p>
                            </div>
                          )}

                          {/* NOTE */}
                          {securityDeposit.note && (
                            <div className="md:col-span-2">
                              <p className="text-xs text-gray-500">
                                Tenant Note
                              </p>

                              <p className="text-gray-700 mt-1">
                                {securityDeposit.note}
                              </p>
                            </div>
                          )}

                          {/* ACCEPT / REJECT */}
                          {(securityDeposit.status === "pending" ||
                            securityDeposit.status === "overdue") && (
                            <div className="md:col-span-3 pt-2">
                              <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                  type="button"
                                  disabled={paymentLoading}
                                  onClick={() =>
                                    handlePaymentStatus(
                                      securityDeposit._id,
                                      "paid",
                                    )
                                  }
                                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                  {paymentLoading ? (
                                    <Loader2
                                      size={18}
                                      className="animate-spin"
                                    />
                                  ) : (
                                    <CheckCircle2 size={18} />
                                  )}
                                  Accept Payment
                                </button>

                                <button
                                  type="button"
                                  disabled={paymentLoading}
                                  onClick={() =>
                                    handlePaymentStatus(
                                      securityDeposit._id,
                                      "rejected",
                                    )
                                  }
                                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                  {paymentLoading ? (
                                    <Loader2
                                      size={18}
                                      className="animate-spin"
                                    />
                                  ) : (
                                    <XCircle size={18} />
                                  )}
                                  Reject Payment
                                </button>
                              </div>

                              <p className="text-xs text-gray-500 mt-2">
                                Accepting the security deposit will activate the
                                rental contract.
                              </p>
                            </div>
                          )}

                          {/* PAID */}
                          {securityDeposit.status === "paid" && (
                            <div className="md:col-span-3 bg-green-50 border border-green-200 rounded-lg p-3">
                              <div className="flex gap-2">
                                <CheckCircle2
                                  size={18}
                                  className="text-green-600 mt-0.5"
                                />

                                <div>
                                  <p className="font-medium text-green-800">
                                    Security deposit confirmed
                                  </p>

                                  <p className="text-sm text-green-700 mt-1">
                                    This property's security deposit has been
                                    accepted and the contract is Active.
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* REJECTED */}
                          {securityDeposit.status === "rejected" && (
                            <div className="md:col-span-3 bg-red-50 border border-red-200 rounded-lg p-3">
                              <div className="flex gap-2">
                                <XCircle
                                  size={18}
                                  className="text-red-600 mt-0.5"
                                />

                                <div>
                                  <p className="font-medium text-red-800">
                                    Security deposit rejected
                                  </p>

                                  <p className="text-sm text-red-700 mt-1">
                                    The tenant can review the payment details
                                    and submit the security deposit again.
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">
                          No security deposit payment record found.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* MONTHLY RENT */}
                  <div className="border rounded-xl overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <CalendarDays size={19} className="text-purple-600" />

                        <h3 className="font-semibold text-gray-900">
                          Monthly Rent
                        </h3>

                        <span className="text-sm font-medium text-gray-500">
                          ({rentPayments.length})
                        </span>
                      </div>

                      {contractId && securityDeposit?.status === "paid" && (
                        <a
                          href={`/owner/payments/create?contractId=${contractId}`}
                          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 transition"
                        >
                          <Plus size={17} />
                          Add Monthly Rent
                        </a>
                      )}
                    </div>

                    <div className="p-4">
                      {rentPayments.length === 0 ? (
                        <div className="text-center py-7">
                          <Wallet
                            size={34}
                            className="mx-auto text-gray-300 mb-2"
                          />

                          <p className="text-gray-500 text-sm">
                            No monthly rent payments recorded for this property.
                          </p>

                          {contractId && securityDeposit?.status === "paid" && (
                            <a
                              href={`/owner/payments/create?contractId=${contractId}`}
                              className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 transition"
                            >
                              <Plus size={16} />
                              Add Monthly Rent
                            </a>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {rentPayments.map((payment) => (
                            <div
                              key={payment._id}
                              className="border rounded-lg p-4"
                            >
                              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                <div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <p className="font-semibold text-gray-900">
                                      {formatCurrency(payment.amount)}
                                    </p>

                                    <span
                                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusClass(
                                        payment.status,
                                      )}`}
                                    >
                                      {getStatusIcon(payment.status)}

                                      {getStatusText(payment.status)}
                                    </span>
                                  </div>

                                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 mt-2">
                                    <span>
                                      Due: {formatDate(payment.dueDate)}
                                    </span>

                                    {payment.paidDate && (
                                      <span>
                                        Paid: {formatDate(payment.paidDate)}
                                      </span>
                                    )}

                                    {payment.paymentMethod && (
                                      <span className="capitalize">
                                        Method:{" "}
                                        {payment.paymentMethod.replace(
                                          "_",
                                          " ",
                                        )}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {payment.reference && (
                                  <div className="text-sm text-gray-500">
                                    <span className="font-medium">Ref:</span>{" "}
                                    {payment.reference}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MyProperties;

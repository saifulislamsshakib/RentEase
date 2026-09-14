// import { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
// import {
//   ArrowLeft,
//   DollarSign,
//   CalendarDays,
//   User,
//   Home,
//   CheckCircle2,
//   Clock3,
//   AlertCircle,
//   XCircle,
//   Plus,
//   RefreshCw,
//   CreditCard,
//   Receipt,
// } from "lucide-react";
// import api from "../../services/api";

// const OwnerPayments = () => {
//   const [payments, setPayments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     fetchPayments();
//   }, []);

//   const fetchPayments = async () => {
//     try {
//       setLoading(true);
//       setError("");

//       const response = await api.get("/payment/owner");

//       setPayments(response.data?.payments || []);
//     } catch (err) {
//       console.error("Owner payments error:", err);

//       setError(
//         err.response?.data?.message || "Failed to load payment records.",
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   const formatDate = (date) => {
//     if (!date) return "N/A";

//     return new Date(date).toLocaleDateString("en-GB", {
//       day: "2-digit",
//       month: "short",
//       year: "numeric",
//     });
//   };

//   const formatMethod = (method) => {
//     if (!method) return "Other";

//     return method
//       .replaceAll("_", " ")
//       .replace(/\b\w/g, (letter) => letter.toUpperCase());
//   };

//   const getStatusStyle = (status) => {
//     switch (status) {
//       case "paid":
//         return {
//           className: "bg-emerald-50 text-emerald-700 border-emerald-200",
//           icon: <CheckCircle2 size={16} />,
//         };

//       case "overdue":
//         return {
//           className: "bg-red-50 text-red-700 border-red-200",
//           icon: <AlertCircle size={16} />,
//         };

//       case "cancelled":
//         return {
//           className: "bg-slate-100 text-slate-600 border-slate-200",
//           icon: <XCircle size={16} />,
//         };

//       default:
//         return {
//           className: "bg-amber-50 text-amber-700 border-amber-200",
//           icon: <Clock3 size={16} />,
//         };
//     }
//   };

//   const totalAmount = payments.reduce(
//     (total, payment) => total + Number(payment.amount || 0),
//     0,
//   );

//   const totalPaid = payments
//     .filter((payment) => payment.status === "paid")
//     .reduce((total, payment) => total + Number(payment.amount || 0), 0);

//   const totalPending = payments
//     .filter((payment) => payment.status === "pending")
//     .reduce((total, payment) => total + Number(payment.amount || 0), 0);

//   const totalOverdue = payments
//     .filter((payment) => payment.status === "overdue")
//     .reduce((total, payment) => total + Number(payment.amount || 0), 0);

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-slate-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />

//           <p className="text-slate-600 font-medium">
//             Loading payment records...
//           </p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="mb-8">
//           <Link
//             to="/owner/dashboard"
//             className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600 transition mb-5"
//           >
//             <ArrowLeft size={18} />
//             Back to Dashboard
//           </Link>

//           <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
//             <div>
//               <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
//                 Rent Payments
//               </h1>

//               <p className="mt-2 text-slate-500">
//                 Manage rent payments and track tenant payment status.
//               </p>
//             </div>

//             <div className="flex flex-wrap gap-3">
//               <button
//                 onClick={fetchPayments}
//                 className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold text-sm hover:bg-slate-50 transition shadow-sm"
//               >
//                 <RefreshCw size={17} />
//                 Refresh
//               </button>

//               <Link
//                 to="/owner/payments/create"
//                 className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition shadow-sm"
//               >
//                 <Plus size={18} />
//                 Record Payment
//               </Link>
//             </div>
//           </div>
//         </div>

//         {/* Error */}
//         {error && (
//           <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-red-700">
//             <AlertCircle size={20} />

//             <p className="text-sm font-medium">{error}</p>
//           </div>
//         )}

//         {/* Summary */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
//           {/* Total */}
//           <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
//             <div className="flex items-center justify-between mb-5">
//               <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
//                 <DollarSign size={23} className="text-blue-600" />
//               </div>

//               <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
//                 Total
//               </span>
//             </div>

//             <p className="text-sm text-slate-500">Total Recorded</p>

//             <h2 className="text-2xl font-bold text-slate-900 mt-1">
//               ${totalAmount.toLocaleString()}
//             </h2>
//           </div>

//           {/* Paid */}
//           <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
//             <div className="flex items-center justify-between mb-5">
//               <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center">
//                 <CheckCircle2 size={23} className="text-emerald-600" />
//               </div>

//               <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
//                 Paid
//               </span>
//             </div>

//             <p className="text-sm text-slate-500">Paid Amount</p>

//             <h2 className="text-2xl font-bold text-slate-900 mt-1">
//               ${totalPaid.toLocaleString()}
//             </h2>
//           </div>

//           {/* Pending */}
//           <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
//             <div className="flex items-center justify-between mb-5">
//               <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center">
//                 <Clock3 size={23} className="text-amber-600" />
//               </div>

//               <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
//                 Pending
//               </span>
//             </div>

//             <p className="text-sm text-slate-500">Pending Amount</p>

//             <h2 className="text-2xl font-bold text-slate-900 mt-1">
//               ${totalPending.toLocaleString()}
//             </h2>
//           </div>

//           {/* Overdue */}
//           <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
//             <div className="flex items-center justify-between mb-5">
//               <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center">
//                 <AlertCircle size={23} className="text-red-600" />
//               </div>

//               <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
//                 Overdue
//               </span>
//             </div>

//             <p className="text-sm text-slate-500">Overdue Amount</p>

//             <h2 className="text-2xl font-bold text-slate-900 mt-1">
//               ${totalOverdue.toLocaleString()}
//             </h2>
//           </div>
//         </div>

//         {/* Payment Records */}
//         <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
//           {/* Table Header */}
//           <div className="px-5 sm:px-7 py-5 border-b border-slate-200 flex items-center justify-between">
//             <div>
//               <h2 className="text-xl font-bold text-slate-900">
//                 Payment Records
//               </h2>

//               <p className="text-sm text-slate-500 mt-1">
//                 All payments recorded for your properties.
//               </p>
//             </div>

//             <div className="hidden sm:flex items-center gap-2 text-sm text-slate-500">
//               <Receipt size={17} />
//               {payments.length} records
//             </div>
//           </div>

//           {/* Empty */}
//           {payments.length === 0 ? (
//             <div className="text-center px-6 py-20">
//               <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-5">
//                 <CreditCard size={38} className="text-blue-600" />
//               </div>

//               <h3 className="text-xl font-bold text-slate-900">
//                 No payment records
//               </h3>

//               <p className="text-slate-500 max-w-md mx-auto mt-2">
//                 You have not recorded any rent payments yet.
//               </p>

//               <Link
//                 to="/owner/payments/create"
//                 className="inline-flex items-center gap-2 mt-6 px-5 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
//               >
//                 <Plus size={18} />
//                 Record First Payment
//               </Link>
//             </div>
//           ) : (
//             <div className="divide-y divide-slate-100">
//               {payments.map((payment) => {
//                 const statusStyle = getStatusStyle(payment.status);

//                 return (
//                   <div
//                     key={payment._id}
//                     className="p-5 sm:p-7 hover:bg-slate-50/70 transition"
//                   >
//                     {/* Top */}
//                     <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
//                       <div className="flex gap-4">
//                         <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
//                           <DollarSign size={23} className="text-blue-600" />
//                         </div>

//                         <div>
//                           <h3 className="text-lg font-bold text-slate-900">
//                             {payment.property?.title || "Rental Property"}
//                           </h3>

//                           <div className="flex flex-wrap items-center gap-4 mt-2">
//                             <div className="flex items-center gap-1.5 text-sm text-slate-500">
//                               <User size={15} />

//                               <span>{payment.tenant?.name || "Tenant"}</span>
//                             </div>

//                             <div className="flex items-center gap-1.5 text-sm text-slate-500">
//                               <Home size={15} />

//                               <span>
//                                 {payment.property?.address ||
//                                   "Address unavailable"}
//                               </span>
//                             </div>
//                           </div>
//                         </div>
//                       </div>

//                       {/* Status */}
//                       <div
//                         className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-semibold w-fit ${statusStyle.className}`}
//                       >
//                         {statusStyle.icon}

//                         {payment.status?.charAt(0).toUpperCase() +
//                           payment.status?.slice(1)}
//                       </div>
//                     </div>

//                     {/* Details */}
//                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
//                       <div className="bg-slate-50 rounded-xl p-4">
//                         <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
//                           Amount
//                         </p>

//                         <p className="text-xl font-bold text-slate-900 mt-1">
//                           ${Number(payment.amount || 0).toLocaleString()}
//                         </p>
//                       </div>

//                       <div className="bg-slate-50 rounded-xl p-4">
//                         <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
//                           Due Date
//                         </p>

//                         <div className="flex items-center gap-2 mt-2">
//                           <CalendarDays size={17} className="text-blue-600" />

//                           <p className="font-semibold text-slate-800">
//                             {formatDate(payment.dueDate)}
//                           </p>
//                         </div>
//                       </div>

//                       <div className="bg-slate-50 rounded-xl p-4">
//                         <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
//                           Paid Date
//                         </p>

//                         <p className="font-semibold text-slate-800 mt-2">
//                           {payment.paidDate
//                             ? formatDate(payment.paidDate)
//                             : "Not paid"}
//                         </p>
//                       </div>

//                       <div className="bg-slate-50 rounded-xl p-4">
//                         <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
//                           Payment Method
//                         </p>

//                         <div className="flex items-center gap-2 mt-2">
//                           <CreditCard size={17} className="text-blue-600" />

//                           <p className="font-semibold text-slate-800">
//                             {formatMethod(payment.paymentMethod)}
//                           </p>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Reference / Note */}
//                     {(payment.reference || payment.note) && (
//                       <div className="mt-5 space-y-1 text-sm text-slate-600">
//                         {payment.reference && (
//                           <p>
//                             <span className="font-semibold text-slate-800">
//                               Reference:
//                             </span>{" "}
//                             {payment.reference}
//                           </p>
//                         )}

//                         {payment.note && (
//                           <p>
//                             <span className="font-semibold text-slate-800">
//                               Note:
//                             </span>{" "}
//                             {payment.note}
//                           </p>
//                         )}
//                       </div>
//                     )}
//                   </div>
//                 );
//               })}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default OwnerPayments;
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  DollarSign,
  CalendarDays,
  User,
  Home,
  CheckCircle2,
  Clock3,
  AlertCircle,
  XCircle,
  Plus,
  RefreshCw,
  CreditCard,
  Receipt,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import api from "../../services/api";

const OwnerPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirmingId, setConfirmingId] = useState(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/payment/owner");

      setPayments(response.data?.payments || []);
    } catch (err) {
      console.error("Owner payments error:", err);

      setError(
        err.response?.data?.message || "Failed to load payment records.",
      );
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // CONFIRM PAYMENT
  // --------------------------------------------------
  const handleConfirmPayment = async (paymentId) => {
    const confirmed = window.confirm(
      "Are you sure you want to confirm this payment?\n\n" +
        "For a security deposit, confirming the payment will activate the rental contract.",
    );

    if (!confirmed) return;

    try {
      setConfirmingId(paymentId);
      setError("");

      const response = await api.put(`/payment/${paymentId}`, {
        status: "paid",
      });

      if (response.data?.success) {
        // Update the payment immediately in UI
        setPayments((prevPayments) =>
          prevPayments.map((payment) =>
            payment._id === paymentId
              ? {
                  ...payment,
                  status: "paid",
                  paidDate:
                    response.data?.payment?.paidDate ||
                    new Date().toISOString(),
                }
              : payment,
          ),
        );

        // Fetch again to make sure backend data is synced
        await fetchPayments();

        alert(
          response.data?.payment?.type === "security_deposit"
            ? "Security deposit confirmed successfully. The rental contract is now Active."
            : "Payment confirmed successfully.",
        );
      }
    } catch (err) {
      console.error("Confirm payment error:", err);

      setError(err.response?.data?.message || "Failed to confirm payment.");
    } finally {
      setConfirmingId(null);
    }
  };

  // --------------------------------------------------
  // DATE FORMAT
  // --------------------------------------------------
  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // --------------------------------------------------
  // PAYMENT METHOD
  // --------------------------------------------------
  const formatMethod = (method) => {
    if (!method) return "Not provided";

    return method
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  // --------------------------------------------------
  // PAYMENT TYPE
  // --------------------------------------------------
  const formatPaymentType = (type) => {
    if (type === "security_deposit") {
      return "Security Deposit";
    }

    return "Rent Payment";
  };

  // --------------------------------------------------
  // STATUS STYLE
  // --------------------------------------------------
  const getStatusStyle = (status) => {
    switch (status) {
      case "paid":
        return {
          className: "bg-emerald-50 text-emerald-700 border-emerald-200",
          icon: <CheckCircle2 size={16} />,
        };

      case "overdue":
        return {
          className: "bg-red-50 text-red-700 border-red-200",
          icon: <AlertCircle size={16} />,
        };

      case "cancelled":
        return {
          className: "bg-slate-100 text-slate-600 border-slate-200",
          icon: <XCircle size={16} />,
        };

      default:
        return {
          className: "bg-amber-50 text-amber-700 border-amber-200",
          icon: <Clock3 size={16} />,
        };
    }
  };

  // --------------------------------------------------
  // TOTALS
  // --------------------------------------------------
  const totalAmount = payments.reduce(
    (total, payment) => total + Number(payment.amount || 0),
    0,
  );

  const totalPaid = payments
    .filter((payment) => payment.status === "paid")
    .reduce((total, payment) => total + Number(payment.amount || 0), 0);

  const totalPending = payments
    .filter((payment) => payment.status === "pending")
    .reduce((total, payment) => total + Number(payment.amount || 0), 0);

  const totalOverdue = payments
    .filter((payment) => payment.status === "overdue")
    .reduce((total, payment) => total + Number(payment.amount || 0), 0);

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />

          <p className="text-slate-600 font-medium">
            Loading payment records...
          </p>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // PAGE
  // --------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* ================= HEADER ================= */}
        <div className="mb-8">
          <Link
            to="/owner/dashboard"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600 transition mb-5"
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </Link>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
                Rent Payments
              </h1>

              <p className="mt-2 text-slate-500">
                Manage rent payments and track tenant payment status.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={fetchPayments}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold text-sm hover:bg-slate-50 transition shadow-sm"
              >
                <RefreshCw size={17} />
                Refresh
              </button>

              <Link
                to="/owner/payments/create"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition shadow-sm"
              >
                <Plus size={18} />
                Record Payment
              </Link>
            </div>
          </div>
        </div>

        {/* ================= ERROR ================= */}
        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-red-700">
            <AlertCircle size={20} />

            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* ================= SUMMARY ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {/* TOTAL */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
                <DollarSign size={23} className="text-blue-600" />
              </div>

              <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Total
              </span>
            </div>

            <p className="text-sm text-slate-500">Total Recorded</p>

            <h2 className="text-2xl font-bold text-slate-900 mt-1">
              ${totalAmount.toLocaleString()}
            </h2>
          </div>

          {/* PAID */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center">
                <CheckCircle2 size={23} className="text-emerald-600" />
              </div>

              <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Paid
              </span>
            </div>

            <p className="text-sm text-slate-500">Paid Amount</p>

            <h2 className="text-2xl font-bold text-slate-900 mt-1">
              ${totalPaid.toLocaleString()}
            </h2>
          </div>

          {/* PENDING */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center">
                <Clock3 size={23} className="text-amber-600" />
              </div>

              <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Pending
              </span>
            </div>

            <p className="text-sm text-slate-500">Pending Amount</p>

            <h2 className="text-2xl font-bold text-slate-900 mt-1">
              ${totalPending.toLocaleString()}
            </h2>
          </div>

          {/* OVERDUE */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center">
                <AlertCircle size={23} className="text-red-600" />
              </div>

              <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Overdue
              </span>
            </div>

            <p className="text-sm text-slate-500">Overdue Amount</p>

            <h2 className="text-2xl font-bold text-slate-900 mt-1">
              ${totalOverdue.toLocaleString()}
            </h2>
          </div>
        </div>

        {/* ================= PAYMENT RECORDS ================= */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          {/* TABLE HEADER */}
          <div className="px-5 sm:px-7 py-5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Payment Records
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                All payments recorded for your properties.
              </p>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-sm text-slate-500">
              <Receipt size={17} />
              {payments.length} records
            </div>
          </div>

          {/* EMPTY */}
          {payments.length === 0 ? (
            <div className="text-center px-6 py-20">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-5">
                <CreditCard size={38} className="text-blue-600" />
              </div>

              <h3 className="text-xl font-bold text-slate-900">
                No payment records
              </h3>

              <p className="text-slate-500 max-w-md mx-auto mt-2">
                You have not recorded any rent payments yet.
              </p>

              <Link
                to="/owner/payments/create"
                className="inline-flex items-center gap-2 mt-6 px-5 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
              >
                <Plus size={18} />
                Record First Payment
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {payments.map((payment) => {
                const statusStyle = getStatusStyle(payment.status);

                const isSecurityDeposit = payment.type === "security_deposit";

                const isPending =
                  payment.status === "pending" || payment.status === "overdue";

                const isConfirming = confirmingId === payment._id;

                return (
                  <div
                    key={payment._id}
                    className={`p-5 sm:p-7 transition ${
                      isPending
                        ? "hover:bg-amber-50/40"
                        : "hover:bg-slate-50/70"
                    }`}
                  >
                    {/* ================= TOP ================= */}
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                      <div className="flex gap-4">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                            isSecurityDeposit ? "bg-purple-50" : "bg-blue-50"
                          }`}
                        >
                          {isSecurityDeposit ? (
                            <ShieldCheck
                              size={23}
                              className="text-purple-600"
                            />
                          ) : (
                            <DollarSign size={23} className="text-blue-600" />
                          )}
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-bold text-slate-900">
                              {payment.property?.title || "Rental Property"}
                            </h3>

                            {/* PAYMENT TYPE */}
                            <span
                              className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                                isSecurityDeposit
                                  ? "bg-purple-100 text-purple-700"
                                  : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              {formatPaymentType(payment.type)}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-4 mt-2">
                            <div className="flex items-center gap-1.5 text-sm text-slate-500">
                              <User size={15} />
                              <span>{payment.tenant?.name || "Tenant"}</span>
                            </div>

                            <div className="flex items-center gap-1.5 text-sm text-slate-500">
                              <Home size={15} />
                              <span>
                                {payment.property?.address ||
                                  "Address unavailable"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* STATUS */}
                      <div
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-semibold w-fit ${statusStyle.className}`}
                      >
                        {statusStyle.icon}

                        {payment.status
                          ? payment.status.charAt(0).toUpperCase() +
                            payment.status.slice(1)
                          : "Pending"}
                      </div>
                    </div>

                    {/* ================= SECURITY DEPOSIT NOTICE ================= */}
                    {isSecurityDeposit && isPending && (
                      <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div className="flex gap-3">
                            <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shrink-0">
                              <ShieldCheck
                                size={19}
                                className="text-amber-600"
                              />
                            </div>

                            <div>
                              <p className="font-bold text-amber-900">
                                Security Deposit Awaiting Confirmation
                              </p>

                              <p className="text-sm text-amber-800 mt-1">
                                The tenant has submitted this security deposit.
                                Please verify the payment and confirm it.
                              </p>
                            </div>
                          </div>

                          {/* CONFIRM BUTTON */}
                          <button
                            onClick={() => handleConfirmPayment(payment._id)}
                            disabled={isConfirming}
                            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed transition shadow-sm whitespace-nowrap"
                          >
                            {isConfirming ? (
                              <>
                                <Loader2 size={18} className="animate-spin" />
                                Confirming...
                              </>
                            ) : (
                              <>
                                <CheckCircle2 size={18} />
                                Confirm Payment
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* ================= DETAILS ================= */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                      {/* AMOUNT */}
                      <div className="bg-slate-50 rounded-xl p-4">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                          Amount
                        </p>

                        <p className="text-xl font-bold text-slate-900 mt-1">
                          ${Number(payment.amount || 0).toLocaleString()}
                        </p>
                      </div>

                      {/* DUE DATE */}
                      <div className="bg-slate-50 rounded-xl p-4">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                          Due Date
                        </p>

                        <div className="flex items-center gap-2 mt-2">
                          <CalendarDays size={17} className="text-blue-600" />

                          <p className="font-semibold text-slate-800">
                            {formatDate(payment.dueDate)}
                          </p>
                        </div>
                      </div>

                      {/* PAID DATE */}
                      <div className="bg-slate-50 rounded-xl p-4">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                          Paid Date
                        </p>

                        <p className="font-semibold text-slate-800 mt-2">
                          {payment.paidDate
                            ? formatDate(payment.paidDate)
                            : "Not paid"}
                        </p>
                      </div>

                      {/* PAYMENT METHOD */}
                      <div className="bg-slate-50 rounded-xl p-4">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
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

                    {/* ================= REFERENCE / NOTE ================= */}
                    {(payment.reference || payment.note) && (
                      <div className="mt-5 rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-2 text-sm text-slate-600">
                        {payment.reference && (
                          <p>
                            <span className="font-semibold text-slate-800">
                              Reference:
                            </span>{" "}
                            {payment.reference}
                          </p>
                        )}

                        {payment.note && (
                          <p>
                            <span className="font-semibold text-slate-800">
                              Note:
                            </span>{" "}
                            {payment.note}
                          </p>
                        )}
                      </div>
                    )}

                    {/* ================= PAID MESSAGE ================= */}
                    {isSecurityDeposit && payment.status === "paid" && (
                      <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                        <div className="flex items-center gap-3">
                          <CheckCircle2
                            size={21}
                            className="text-emerald-600 shrink-0"
                          />

                          <div>
                            <p className="font-bold text-emerald-800">
                              Security Deposit Confirmed
                            </p>

                            <p className="text-sm text-emerald-700 mt-1">
                              Payment has been confirmed and the rental contract
                              is now Active.
                            </p>
                          </div>
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

export default OwnerPayments;

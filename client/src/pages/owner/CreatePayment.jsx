// import { useEffect, useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import {
//   ArrowLeft,
//   DollarSign,
//   CalendarDays,
//   User,
//   Home,
//   CreditCard,
//   FileText,
//   CheckCircle2,
//   AlertCircle,
// } from "lucide-react";
// import api from "../../services/api";

// const CreatePayment = () => {
//   const navigate = useNavigate();

//   const [contracts, setContracts] = useState([]);
//   const [loadingContracts, setLoadingContracts] = useState(true);
//   const [submitting, setSubmitting] = useState(false);
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");

//   const [formData, setFormData] = useState({
//     contractId: "",
//     amount: "",
//     dueDate: "",
//     paymentMethod: "cash",
//     status: "paid",
//     paidDate: "",
//     reference: "",
//     note: "",
//   });

//   useEffect(() => {
//     fetchContracts();
//   }, []);

//   const fetchContracts = async () => {
//     try {
//       setLoadingContracts(true);

//       const response = await api.get("/contract/owner/contracts");

//       const activeContracts = (response.data?.contracts || []).filter(
//         (contract) => contract.status === "Active",
//       );

//       setContracts(activeContracts);
//     } catch (err) {
//       console.error("Contracts error:", err);

//       setError(
//         err.response?.data?.message || "Failed to load active contracts.",
//       );
//     } finally {
//       setLoadingContracts(false);
//     }
//   };

//   const selectedContract = contracts.find(
//     (contract) => contract._id === formData.contractId,
//   );

//   const handleChange = (e) => {
//     const { name, value } = e.target;

//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));

//     setError("");
//     setSuccess("");
//   };

//   const handleContractChange = (e) => {
//     const contractId = e.target.value;

//     const contract = contracts.find((item) => item._id === contractId);

//     setFormData((prev) => ({
//       ...prev,
//       contractId,
//       amount: contract ? contract.monthlyRent : "",
//     }));

//     setError("");
//     setSuccess("");
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     setError("");
//     setSuccess("");

//     if (!formData.contractId) {
//       setError("Please select a rental contract.");
//       return;
//     }

//     if (!formData.amount || Number(formData.amount) <= 0) {
//       setError("Please enter a valid payment amount.");
//       return;
//     }

//     if (!formData.dueDate) {
//       setError("Please select a due date.");
//       return;
//     }

//     if (formData.status === "paid" && !formData.paidDate) {
//       setError("Please select the paid date.");
//       return;
//     }

//     try {
//       setSubmitting(true);

//       const payload = {
//         amount: Number(formData.amount),
//         dueDate: formData.dueDate,
//         paymentMethod: formData.paymentMethod,
//         status: formData.status,
//         paidDate: formData.status === "paid" ? formData.paidDate : null,
//         reference: formData.reference,
//         note: formData.note,
//       };

//       await api.post(`/payment/create/${formData.contractId}`, payload);

//       setSuccess("Rent payment recorded successfully.");

//       setTimeout(() => {
//         navigate("/owner/payments");
//       }, 1000);
//     } catch (err) {
//       console.error("Create payment error:", err);

//       setError(err.response?.data?.message || "Failed to record payment.");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-4xl mx-auto">
//         {/* Header */}
//         <div className="mb-8">
//           <Link
//             to="/owner/payments"
//             className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600 transition mb-5"
//           >
//             <ArrowLeft size={18} />
//             Back to Payments
//           </Link>

//           <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
//             Record Rent Payment
//           </h1>

//           <p className="mt-2 text-slate-500">
//             Record a rent payment for one of your active rental contracts.
//           </p>
//         </div>

//         {/* Alerts */}
//         {error && (
//           <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-red-700">
//             <AlertCircle size={20} className="mt-0.5 shrink-0" />

//             <p className="text-sm font-medium">{error}</p>
//           </div>
//         )}

//         {success && (
//           <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-emerald-700">
//             <CheckCircle2 size={20} className="mt-0.5 shrink-0" />

//             <p className="text-sm font-medium">{success}</p>
//           </div>
//         )}

//         {/* Form */}
//         <form
//           onSubmit={handleSubmit}
//           className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden"
//         >
//           {/* Form Header */}
//           <div className="px-6 sm:px-8 py-6 border-b border-slate-200 bg-slate-50/70">
//             <div className="flex items-center gap-4">
//               <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
//                 <DollarSign size={25} className="text-blue-600" />
//               </div>

//               <div>
//                 <h2 className="text-xl font-bold text-slate-900">
//                   Payment Information
//                 </h2>

//                 <p className="text-sm text-slate-500 mt-1">
//                   Enter the payment details below.
//                 </p>
//               </div>
//             </div>
//           </div>

//           <div className="p-6 sm:p-8">
//             {/* Contract */}
//             <div className="mb-6">
//               <label className="block text-sm font-semibold text-slate-700 mb-2">
//                 Rental Contract
//               </label>

//               {loadingContracts ? (
//                 <div className="h-12 rounded-xl bg-slate-100 animate-pulse" />
//               ) : contracts.length === 0 ? (
//                 <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4">
//                   <p className="text-sm font-medium text-amber-800">
//                     No active rental contracts found.
//                   </p>

//                   <Link
//                     to="/owner/contracts/create"
//                     className="inline-block mt-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
//                   >
//                     Create a rental contract →
//                   </Link>
//                 </div>
//               ) : (
//                 <select
//                   name="contractId"
//                   value={formData.contractId}
//                   onChange={handleContractChange}
//                   className="w-full h-12 px-4 rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                 >
//                   <option value="">Select a rental contract</option>

//                   {contracts.map((contract) => (
//                     <option key={contract._id} value={contract._id}>
//                       {contract.property?.title || "Property"} —{" "}
//                       {contract.tenant?.name || "Tenant"}
//                     </option>
//                   ))}
//                 </select>
//               )}
//             </div>

//             {/* Selected Contract Information */}
//             {selectedContract && (
//               <div className="mb-7 rounded-2xl border border-blue-100 bg-blue-50/60 p-5">
//                 <h3 className="font-bold text-slate-900 mb-4">
//                   Selected Contract
//                 </h3>

//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                   <div className="flex items-start gap-3">
//                     <Home size={18} className="text-blue-600 mt-0.5" />

//                     <div>
//                       <p className="text-xs text-slate-500">Property</p>

//                       <p className="font-semibold text-slate-800">
//                         {selectedContract.property?.title || "N/A"}
//                       </p>
//                     </div>
//                   </div>

//                   <div className="flex items-start gap-3">
//                     <User size={18} className="text-blue-600 mt-0.5" />

//                     <div>
//                       <p className="text-xs text-slate-500">Tenant</p>

//                       <p className="font-semibold text-slate-800">
//                         {selectedContract.tenant?.name || "N/A"}
//                       </p>
//                     </div>
//                   </div>

//                   <div className="flex items-start gap-3">
//                     <DollarSign size={18} className="text-blue-600 mt-0.5" />

//                     <div>
//                       <p className="text-xs text-slate-500">Monthly Rent</p>

//                       <p className="font-semibold text-slate-800">
//                         $
//                         {Number(
//                           selectedContract.monthlyRent || 0,
//                         ).toLocaleString()}
//                       </p>
//                     </div>
//                   </div>

//                   <div className="flex items-start gap-3">
//                     <CalendarDays size={18} className="text-blue-600 mt-0.5" />

//                     <div>
//                       <p className="text-xs text-slate-500">Contract Due Day</p>

//                       <p className="font-semibold text-slate-800">
//                         Every month on day {selectedContract.dueDate}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Amount & Due Date */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
//               <div>
//                 <label className="block text-sm font-semibold text-slate-700 mb-2">
//                   Payment Amount *
//                 </label>

//                 <div className="relative">
//                   <DollarSign
//                     size={18}
//                     className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
//                   />

//                   <input
//                     type="number"
//                     name="amount"
//                     value={formData.amount}
//                     onChange={handleChange}
//                     min="0"
//                     step="0.01"
//                     placeholder="Enter amount"
//                     className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                   />
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-semibold text-slate-700 mb-2">
//                   Due Date *
//                 </label>

//                 <div className="relative">
//                   <CalendarDays
//                     size={18}
//                     className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
//                   />

//                   <input
//                     type="date"
//                     name="dueDate"
//                     value={formData.dueDate}
//                     onChange={handleChange}
//                     className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* Status & Method */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
//               <div>
//                 <label className="block text-sm font-semibold text-slate-700 mb-2">
//                   Payment Status *
//                 </label>

//                 <select
//                   name="status"
//                   value={formData.status}
//                   onChange={handleChange}
//                   className="w-full h-12 px-4 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                 >
//                   <option value="paid">Paid</option>

//                   <option value="pending">Pending</option>

//                   <option value="overdue">Overdue</option>

//                   <option value="cancelled">Cancelled</option>
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-sm font-semibold text-slate-700 mb-2">
//                   Payment Method
//                 </label>

//                 <div className="relative">
//                   <CreditCard
//                     size={18}
//                     className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
//                   />

//                   <select
//                     name="paymentMethod"
//                     value={formData.paymentMethod}
//                     onChange={handleChange}
//                     className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                   >
//                     <option value="cash">Cash</option>

//                     <option value="bank_transfer">Bank Transfer</option>

//                     <option value="mobile_banking">Mobile Banking</option>

//                     <option value="card">Card</option>

//                     <option value="other">Other</option>
//                   </select>
//                 </div>
//               </div>
//             </div>

//             {/* Paid Date */}
//             {formData.status === "paid" && (
//               <div className="mb-5">
//                 <label className="block text-sm font-semibold text-slate-700 mb-2">
//                   Paid Date *
//                 </label>

//                 <div className="relative">
//                   <CalendarDays
//                     size={18}
//                     className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
//                   />

//                   <input
//                     type="date"
//                     name="paidDate"
//                     value={formData.paidDate}
//                     onChange={handleChange}
//                     className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                   />
//                 </div>
//               </div>
//             )}

//             {/* Reference */}
//             <div className="mb-5">
//               <label className="block text-sm font-semibold text-slate-700 mb-2">
//                 Payment Reference
//               </label>

//               <input
//                 type="text"
//                 name="reference"
//                 value={formData.reference}
//                 onChange={handleChange}
//                 placeholder="Transaction ID, receipt number, etc."
//                 className="w-full h-12 px-4 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//               />
//             </div>

//             {/* Note */}
//             <div className="mb-8">
//               <label className="block text-sm font-semibold text-slate-700 mb-2">
//                 Note
//               </label>

//               <div className="relative">
//                 <FileText
//                   size={18}
//                   className="absolute left-4 top-4 text-slate-400"
//                 />

//                 <textarea
//                   name="note"
//                   value={formData.note}
//                   onChange={handleChange}
//                   rows="4"
//                   placeholder="Add any additional information..."
//                   className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                 />
//               </div>
//             </div>

//             {/* Buttons */}
//             <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-6 border-t border-slate-200">
//               <Link
//                 to="/owner/payments"
//                 className="inline-flex items-center justify-center px-6 py-3 rounded-xl border border-slate-300 bg-white text-slate-700 font-semibold hover:bg-slate-50 transition"
//               >
//                 Cancel
//               </Link>

//               <button
//                 type="submit"
//                 disabled={submitting || contracts.length === 0}
//                 className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition"
//               >
//                 {submitting ? (
//                   <>
//                     <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
//                     Recording...
//                   </>
//                 ) : (
//                   <>
//                     <CheckCircle2 size={18} />
//                     Record Payment
//                   </>
//                 )}
//               </button>
//             </div>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default CreatePayment;

import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import {
  ArrowLeft,
  DollarSign,
  CalendarDays,
  User,
  Home,
  CreditCard,
  FileText,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import api from "../../services/api";

const CreatePayment = () => {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const preselectedContractId = searchParams.get("contractId");

  const [contracts, setContracts] = useState([]);

  const [loadingContracts, setLoadingContracts] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    contractId: "",
    amount: "",
    dueDate: "",
    paymentMethod: "cash",
    status: "paid",
    paidDate: "",
    reference: "",
    note: "",
  });

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      setLoadingContracts(true);

      const response = await api.get("/contract/owner/contracts");

      const activeContracts = (response.data?.contracts || []).filter(
        (contract) => contract.status === "Active",
      );

      setContracts(activeContracts);

      // Automatically select contract from URL
      if (preselectedContractId) {
        const selectedContract = activeContracts.find(
          (contract) => contract._id === preselectedContractId,
        );

        if (selectedContract) {
          setFormData((prev) => ({
            ...prev,
            contractId: selectedContract._id,
            amount: selectedContract.monthlyRent,
          }));
        }
      }
    } catch (err) {
      console.error("Contracts error:", err);

      setError(
        err.response?.data?.message || "Failed to load active contracts.",
      );
    } finally {
      setLoadingContracts(false);
    }
  };

  const selectedContract = contracts.find(
    (contract) => contract._id === formData.contractId,
  );

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const handleContractChange = (e) => {
    const contractId = e.target.value;

    const contract = contracts.find((item) => item._id === contractId);

    setFormData((prev) => ({
      ...prev,
      contractId,
      amount: contract ? contract.monthlyRent : "",
    }));

    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!formData.contractId) {
      setError("Please select a rental contract.");
      return;
    }

    if (!formData.amount || Number(formData.amount) <= 0) {
      setError("Please enter a valid payment amount.");
      return;
    }

    if (!formData.dueDate) {
      setError("Please select a due date.");
      return;
    }

    if (formData.status === "paid" && !formData.paidDate) {
      setError("Please select the paid date.");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        amount: Number(formData.amount),

        dueDate: formData.dueDate,

        paymentMethod: formData.paymentMethod,

        status: formData.status,

        paidDate: formData.status === "paid" ? formData.paidDate : null,

        reference: formData.reference,

        note: formData.note,

        type: "rent",
      };

      await api.post(`/payment/create/${formData.contractId}`, payload);

      setSuccess("Rent payment recorded successfully.");

      setTimeout(() => {
        navigate("/owner/properties");
      }, 1000);
    } catch (err) {
      console.error("Create payment error:", err);

      setError(err.response?.data?.message || "Failed to record payment.");
    } finally {
      setSubmitting(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loadingContracts) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />

          <p className="text-slate-600">Loading contracts...</p>
        </div>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* HEADER */}
        <div className="mb-8">
          <Link
            to="/owner/properties"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600 transition mb-5"
          >
            <ArrowLeft size={18} />
            Back to My Properties
          </Link>

          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
            Record Rent Payment
          </h1>

          <p className="mt-2 text-slate-500">
            Record a monthly rent payment for one of your active rental
            contracts.
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-red-700">
            <AlertCircle size={20} className="mt-0.5 shrink-0" />

            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* SUCCESS */}
        {success && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-emerald-700">
            <CheckCircle2 size={20} className="mt-0.5 shrink-0" />

            <p className="text-sm font-medium">{success}</p>
          </div>
        )}

        {/* NO ACTIVE CONTRACT */}
        {contracts.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
            <Home size={42} className="mx-auto text-slate-300 mb-3" />

            <h2 className="text-xl font-semibold text-slate-800">
              No Active Rental Contracts
            </h2>

            <p className="text-slate-500 mt-2">
              You need an active rental contract before recording monthly rent.
            </p>

            <Link
              to="/owner/contracts"
              className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
            >
              View Contracts
            </Link>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden"
          >
            <div className="p-6 sm:p-8">
              {/* CONTRACT */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Rental Contract *
                </label>

                <div className="relative">
                  <Home
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <select
                    name="contractId"
                    value={formData.contractId}
                    onChange={handleContractChange}
                    className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select active contract</option>

                    {contracts.map((contract) => (
                      <option key={contract._id} value={contract._id}>
                        {contract.property?.title || "Property"} —{" "}
                        {contract.tenant?.name || "Tenant"}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* SELECTED CONTRACT INFO */}
              {selectedContract && (
                <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-blue-600 font-medium">
                        Property
                      </p>

                      <p className="font-semibold text-slate-800 mt-1">
                        {selectedContract.property?.title || "N/A"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-blue-600 font-medium">
                        Tenant
                      </p>

                      <p className="font-semibold text-slate-800 mt-1">
                        {selectedContract.tenant?.name || "N/A"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-blue-600 font-medium">
                        Monthly Rent
                      </p>

                      <p className="font-semibold text-slate-800 mt-1">
                        {new Intl.NumberFormat("en-AU", {
                          style: "currency",
                          currency: "AUD",
                        }).format(Number(selectedContract.monthlyRent || 0))}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* AMOUNT + DUE DATE */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                {/* AMOUNT */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Rent Amount *
                  </label>

                  <div className="relative">
                    <DollarSign
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      placeholder="Enter rent amount"
                      className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* DUE DATE */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Due Date *
                  </label>

                  <div className="relative">
                    <CalendarDays
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="date"
                      name="dueDate"
                      value={formData.dueDate}
                      onChange={handleChange}
                      className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* PAYMENT METHOD + STATUS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                {/* PAYMENT METHOD */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Payment Method
                  </label>

                  <div className="relative">
                    <CreditCard
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <select
                      name="paymentMethod"
                      value={formData.paymentMethod}
                      onChange={handleChange}
                      className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="cash">Cash</option>

                      <option value="bank_transfer">Bank Transfer</option>

                      <option value="mobile_banking">Mobile Banking</option>

                      <option value="card">Card</option>

                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                {/* STATUS */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Payment Status
                  </label>

                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full h-12 px-4 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="paid">Paid</option>

                    <option value="pending">Pending</option>

                    <option value="overdue">Overdue</option>

                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* PAID DATE */}
              {formData.status === "paid" && (
                <div className="mb-5">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Paid Date *
                  </label>

                  <div className="relative">
                    <CalendarDays
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="date"
                      name="paidDate"
                      value={formData.paidDate}
                      onChange={handleChange}
                      className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* REFERENCE */}
              <div className="mb-5">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Payment Reference
                </label>

                <input
                  type="text"
                  name="reference"
                  value={formData.reference}
                  onChange={handleChange}
                  placeholder="Transaction ID, receipt number, etc."
                  className="w-full h-12 px-4 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* NOTE */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Note
                </label>

                <div className="relative">
                  <FileText
                    size={18}
                    className="absolute left-4 top-4 text-slate-400"
                  />

                  <textarea
                    name="note"
                    value={formData.note}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Add any additional information..."
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* BUTTONS */}
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-6 border-t border-slate-200">
                <Link
                  to="/owner/properties"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-xl border border-slate-300 bg-white text-slate-700 font-semibold hover:bg-slate-50 transition"
                >
                  Cancel
                </Link>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition"
                >
                  {submitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Recording...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={18} />
                      Record Payment
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CreatePayment;

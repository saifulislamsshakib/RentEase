import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, CreditCard, User } from "lucide-react";

import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

function EditProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",

    bkash: "",
    nagad: "",
    bankName: "",
    accountName: "",
    accountNumber: "",
    branch: "",
    instructions: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/user/profile");

        const profile = response.data.user;
        const payment = profile.paymentInformation || {};

        setFormData({
          name: profile.name || "",
          phone: profile.phone || "",
          address: profile.address || "",

          bkash: payment.bkash || "",
          nagad: payment.nagad || "",
          bankName: payment.bankName || "",
          accountName: payment.accountName || "",
          accountNumber: payment.accountNumber || "",
          branch: payment.branch || "",
          instructions: payment.instructions || "",
        });
      } catch (error) {
        setError(error.response?.data?.message || "Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await api.put("/user/profile", {
        name: formData.name,
        phone: formData.phone,
        address: formData.address,

        paymentInformation: {
          bkash: formData.bkash,
          nagad: formData.nagad,
          bankName: formData.bankName,
          accountName: formData.accountName,
          accountNumber: formData.accountNumber,
          branch: formData.branch,
          instructions: formData.instructions,
        },
      });

      setSuccess("Profile updated successfully.");

      setTimeout(() => {
        navigate("/owner/profile");
      }, 1000);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-gray-600">Loading profile...</p>
      </div>
    );
  }

  if (!user || user.role !== "owner") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">Access Denied</h1>

          <Link
            to="/login"
            className="mt-5 inline-flex rounded-lg bg-blue-600 px-5 py-3 font-medium text-white"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-4xl">
        {/* Top Navigation */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <Link
            to="/owner/profile"
            className="inline-flex w-fit items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:border-blue-500 hover:text-blue-600"
          >
            <ArrowLeft size={17} />
            Back Profile
          </Link>
        </div>

        {/* Header */}
        <div className="mt-7">
          <h1 className="text-3xl font-bold text-gray-800">
            Edit Owner Profile
          </h1>

          <p className="mt-1 text-gray-600">
            Update your personal and payment information.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Personal Information */}
          <div className="mt-7 rounded-xl bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 border-b pb-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50">
                <User className="text-blue-600" size={23} />
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Personal Information
                </h2>

                <p className="text-sm text-gray-500">
                  Update your basic information
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {/* Name */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Full Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Enter your name"
                />
              </div>

              {/* Email */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Email
                </label>

                <input
                  type="email"
                  value={user.email || ""}
                  disabled
                  className="mt-2 w-full rounded-lg border border-gray-200 bg-gray-100 px-4 py-3 text-gray-500"
                />

                <p className="mt-1 text-xs text-gray-400">
                  Email cannot be changed here.
                </p>
              </div>

              {/* Phone */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Phone
                </label>

                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Enter phone number"
                />
              </div>

              {/* Address */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Address
                </label>

                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Enter address"
                />
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 border-b pb-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-green-50">
                <CreditCard className="text-green-600" size={23} />
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Payment Information
                </h2>

                <p className="text-sm text-gray-500">
                  Tenants will see these details when making payments.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {/* bKash */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  bKash Number
                </label>

                <input
                  type="text"
                  name="bkash"
                  value={formData.bkash}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                  placeholder="01XXXXXXXXX"
                />
              </div>

              {/* Nagad */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Nagad Number
                </label>

                <input
                  type="text"
                  name="nagad"
                  value={formData.nagad}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                  placeholder="01XXXXXXXXX"
                />
              </div>

              {/* Bank Name */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Bank Name
                </label>

                <input
                  type="text"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                  placeholder="e.g. Dutch-Bangla Bank"
                />
              </div>

              {/* Account Name */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Account Name
                </label>

                <input
                  type="text"
                  name="accountName"
                  value={formData.accountName}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                  placeholder="Account holder name"
                />
              </div>

              {/* Account Number */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Account Number
                </label>

                <input
                  type="text"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                  placeholder="Bank account number"
                />
              </div>

              {/* Branch */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Branch
                </label>

                <input
                  type="text"
                  name="branch"
                  value={formData.branch}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                  placeholder="Bank branch"
                />
              </div>

              {/* Instructions */}
              <div className="sm:col-span-2">
                <label className="text-sm font-medium text-gray-700">
                  Payment Instructions
                </label>

                <textarea
                  name="instructions"
                  value={formData.instructions}
                  onChange={handleChange}
                  rows={4}
                  className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                  placeholder="Example: Please send the exact amount and provide the transaction/reference number."
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save size={18} />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProfile;

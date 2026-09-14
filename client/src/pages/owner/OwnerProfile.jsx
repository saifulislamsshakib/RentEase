import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  Mail,
  CreditCard,
  Pencil,
} from "lucide-react";

import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

function OwnerProfile() {
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/user/profile");

        setProfile(response.data.user);
      } catch (error) {
        setError(error.response?.data?.message || "Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-gray-600">Loading profile...</p>
      </div>
    );
  }

  if (!profile || user?.role !== "owner") {
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

  const paymentInfo = profile.paymentInformation || {};

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <Link
            to="/owner/dashboard"
            className="inline-flex w-fit items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:border-blue-500 hover:text-blue-600"
          >
            <ArrowLeft size={17} />
            Back Dashboard
          </Link>

          <Link
            to="/owner/profile/edit"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            <Pencil size={17} />
            Edit Profile
          </Link>
        </div>

        {/* Title */}
        <div className="mt-7">
          <h1 className="text-3xl font-bold text-gray-800">Owner Profile</h1>

          <p className="mt-1 text-gray-600">
            Manage your personal and payment information.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">
            {error}
          </div>
        )}

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
                Your basic account information
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {/* Name */}
            <div>
              <p className="text-sm text-gray-500">Full Name</p>
              <div className="mt-1 flex items-center gap-2">
                <User size={17} className="text-gray-400" />
                <p className="font-medium text-gray-800">
                  {profile.name || "Not provided"}
                </p>
              </div>
            </div>

            {/* Email */}
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <div className="mt-1 flex items-center gap-2">
                <Mail size={17} className="text-gray-400" />
                <p className="font-medium text-gray-800 break-all">
                  {profile.email || "Not provided"}
                </p>
              </div>
            </div>

            {/* Phone */}
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <div className="mt-1 flex items-center gap-2">
                <Phone size={17} className="text-gray-400" />
                <p className="font-medium text-gray-800">
                  {profile.phone || "Not provided"}
                </p>
              </div>
            </div>

            {/* Address */}
            <div>
              <p className="text-sm text-gray-500">Address</p>
              <div className="mt-1 flex items-center gap-2">
                <MapPin size={17} className="text-gray-400" />
                <p className="font-medium text-gray-800">
                  {profile.address || "Not provided"}
                </p>
              </div>
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
                Tenants will use these details to send payments.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {/* bKash */}
            <div className="rounded-lg border p-4">
              <p className="text-sm text-gray-500">bKash Number</p>
              <p className="mt-1 font-semibold text-gray-800">
                {paymentInfo.bkash || "Not provided"}
              </p>
            </div>

            {/* Nagad */}
            <div className="rounded-lg border p-4">
              <p className="text-sm text-gray-500">Nagad Number</p>
              <p className="mt-1 font-semibold text-gray-800">
                {paymentInfo.nagad || "Not provided"}
              </p>
            </div>

            {/* Bank */}
            <div className="rounded-lg border p-4">
              <p className="text-sm text-gray-500">Bank Name</p>
              <p className="mt-1 font-semibold text-gray-800">
                {paymentInfo.bankName || "Not provided"}
              </p>
            </div>

            {/* Account Name */}
            <div className="rounded-lg border p-4">
              <p className="text-sm text-gray-500">Account Name</p>
              <p className="mt-1 font-semibold text-gray-800">
                {paymentInfo.accountName || "Not provided"}
              </p>
            </div>

            {/* Account Number */}
            <div className="rounded-lg border p-4">
              <p className="text-sm text-gray-500">Account Number</p>
              <p className="mt-1 font-semibold text-gray-800">
                {paymentInfo.accountNumber || "Not provided"}
              </p>
            </div>

            {/* Branch */}
            <div className="rounded-lg border p-4">
              <p className="text-sm text-gray-500">Branch</p>
              <p className="mt-1 font-semibold text-gray-800">
                {paymentInfo.branch || "Not provided"}
              </p>
            </div>

            {/* Instructions */}
            <div className="rounded-lg border p-4 sm:col-span-2">
              <p className="text-sm text-gray-500">Payment Instructions</p>

              <p className="mt-1 whitespace-pre-line font-medium text-gray-800">
                {paymentInfo.instructions ||
                  "No payment instructions provided."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OwnerProfile;

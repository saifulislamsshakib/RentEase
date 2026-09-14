import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../services/api";

function VerifyEmail() {
  const [searchParams] = useSearchParams();

  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get("token");

      if (!token) {
        setStatus("error");
        setMessage("Verification token is missing.");
        return;
      }

      try {
        const response = await api.get(`/user/verify-email/${token}`);

        setStatus("success");
        setMessage(response.data.message || "Email verified successfully");
      } catch (error) {
        setStatus("error");
        setMessage(
          error.response?.data?.message || "Email verification failed.",
        );
      }
    };

    verifyEmail();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
        <h1 className="text-3xl font-bold text-blue-600">RentEase</h1>

        {status === "verifying" && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-800">
              Verifying your email...
            </h2>

            <p className="mt-2 text-gray-600">
              Please wait while we verify your email address.
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="mt-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl">
              ✓
            </div>

            <h2 className="mt-4 text-xl font-semibold text-gray-800">
              Email Verified
            </h2>

            <p className="mt-2 text-gray-600">{message}</p>

            <Link
              to="/login"
              className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Go to Login
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="mt-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-2xl">
              !
            </div>

            <h2 className="mt-4 text-xl font-semibold text-gray-800">
              Verification Failed
            </h2>

            <p className="mt-2 text-red-600">{message}</p>

            <Link
              to="/login"
              className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Go to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default VerifyEmail;

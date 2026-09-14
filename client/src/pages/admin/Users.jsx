import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Users as UsersIcon,
  User,
  Mail,
  Phone,
  Shield,
  Ban,
  CheckCircle,
  Trash2,
} from "lucide-react";

import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

function AdminUsers() {
  const { user } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/admin/users");

        setUsers(response.data.users || []);
      } catch (error) {
        setError(error.response?.data?.message || "Failed to load users.");
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === "admin") {
      fetchUsers();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleToggleStatus = async (userId, currentStatus) => {
    const action = currentStatus ? "block" : "unblock";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} this user?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(userId);
      setError("");
      setSuccess("");

      const response = await api.put(`/admin/users/${userId}/status`);

      const updatedUser = response.data.user;

      setUsers((prevUsers) =>
        prevUsers.map((item) =>
          item._id === userId
            ? {
                ...item,
                ...updatedUser,
              }
            : item,
        ),
      );

      setSuccess(response.data.message || "User status updated successfully.");
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to update user status.",
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (userId, name) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${
        name || "this user"
      }? This action cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(userId);
      setError("");
      setSuccess("");

      const response = await api.delete(`/admin/users/${userId}`);

      setUsers((prevUsers) => prevUsers.filter((item) => item._id !== userId));

      setSuccess(response.data.message || "User deleted successfully.");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to delete user.");
    } finally {
      setActionLoading(null);
    }
  };

  const getRoleClass = (role) => {
    if (role === "admin") {
      return "bg-purple-100 text-purple-700";
    }

    if (role === "owner") {
      return "bg-blue-100 text-blue-700";
    }

    return "bg-green-100 text-green-700";
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>

          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
        <div className="w-full max-w-md rounded-xl bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
            <UsersIcon size={28} className="text-red-500" />
          </div>

          <h1 className="mt-5 text-2xl font-bold text-gray-800">
            Access Denied
          </h1>

          <p className="mt-2 text-gray-600">
            Only administrators can manage users.
          </p>

          <Link
            to="/login"
            className="mt-6 inline-flex rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link
            to="/admin/dashboard"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:border-blue-500 hover:text-blue-600"
          >
            <ArrowLeft size={17} />
            Back to Dashboard
          </Link>

          <Link to="/" className="text-2xl font-bold text-blue-600">
            RentEase
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
              <UsersIcon size={25} className="text-blue-600" />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-gray-800">Manage Users</h1>

              <p className="mt-1 text-gray-600">
                View and manage all RentEase users.
              </p>
            </div>
          </div>

          <div className="rounded-lg bg-white px-5 py-3 shadow-sm">
            <p className="text-xs text-gray-500">Total Users</p>

            <p className="mt-1 text-xl font-bold text-blue-600">
              {users.length}
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="mt-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-600">
            {success}
          </div>
        )}

        {/* Empty */}
        {users.length === 0 ? (
          <div className="mt-7 rounded-xl bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-50">
              <UsersIcon size={30} className="text-gray-300" />
            </div>

            <h2 className="mt-5 text-xl font-semibold text-gray-800">
              No Users
            </h2>

            <p className="mt-2 text-gray-500">There are no users to display.</p>
          </div>
        ) : (
          <div className="mt-7 overflow-hidden rounded-xl bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px]">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      User
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Contact
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Role
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Status
                    </th>

                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {users.map((item) => {
                    const isCurrentUser = item._id === user._id;

                    const isAdmin = item.role === "admin";

                    return (
                      <tr
                        key={item._id}
                        className="transition hover:bg-gray-50"
                      >
                        {/* User */}
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50">
                              <User size={21} className="text-blue-600" />
                            </div>

                            <div className="min-w-0">
                              <p className="truncate font-semibold text-gray-800">
                                {item.name || "Unnamed User"}
                              </p>

                              {isCurrentUser && (
                                <span className="mt-1 inline-block text-xs font-medium text-blue-600">
                                  You
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Contact */}
                        <td className="px-6 py-5">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Mail size={15} className="text-gray-400" />

                              <span className="text-sm text-gray-600">
                                {item.email || "No email"}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <Phone size={15} className="text-gray-400" />

                              <span className="text-sm text-gray-600">
                                {item.phone || "No phone"}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold capitalize ${getRoleClass(
                              item.role,
                            )}`}
                          >
                            <Shield size={13} />
                            {item.role || "tenant"}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                              item.isActive
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {item.isActive ? (
                              <>
                                <CheckCircle size={13} />
                                Active
                              </>
                            ) : (
                              <>
                                <Ban size={13} />
                                Blocked
                              </>
                            )}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-5">
                          <div className="flex justify-end gap-2">
                            {!isAdmin && !isCurrentUser && (
                              <>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleToggleStatus(item._id, item.isActive)
                                  }
                                  disabled={actionLoading === item._id}
                                  className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
                                    item.isActive
                                      ? "border border-red-300 text-red-600 hover:bg-red-50"
                                      : "border border-green-300 text-green-600 hover:bg-green-50"
                                  }`}
                                >
                                  {item.isActive ? (
                                    <>
                                      <Ban size={16} />
                                      Block
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle size={16} />
                                      Unblock
                                    </>
                                  )}
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDelete(item._id, item.name)
                                  }
                                  disabled={actionLoading === item._id}
                                  className="inline-flex items-center gap-2 rounded-lg border border-red-300 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  <Trash2 size={16} />
                                  Delete
                                </button>
                              </>
                            )}

                            {isAdmin && (
                              <span className="text-xs text-gray-400">
                                Admin protected
                              </span>
                            )}

                            {isCurrentUser && (
                              <span className="text-xs text-gray-400">
                                Your account
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminUsers;

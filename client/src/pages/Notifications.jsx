import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Bell,
  Check,
  CheckCheck,
  Building2,
  CalendarDays,
  FileText,
  Clock,
} from "lucide-react";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function Notifications() {
  const { user } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/notification");

        setNotifications(response.data.notifications || []);

        setUnreadCount(response.data.unreadCount || 0);
      } catch (error) {
        setError(
          error.response?.data?.message || "Failed to load notifications.",
        );
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchNotifications();
    } else {
      setLoading(false);
    }
  }, [user]);

  const getNotificationIcon = (type) => {
    if (type?.includes("application")) {
      return <FileText size={20} className="text-blue-600" />;
    }

    if (type?.includes("booking")) {
      return <CalendarDays size={20} className="text-blue-600" />;
    }

    if (type?.includes("property")) {
      return <Building2 size={20} className="text-blue-600" />;
    }

    return <Bell size={20} className="text-blue-600" />;
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      setActionLoading(notificationId);
      setError("");
      setSuccess("");

      await api.put(`/notification/${notificationId}/read`);

      setNotifications((prev) =>
        prev.map((notification) =>
          notification._id === notificationId
            ? {
                ...notification,
                isRead: true,
              }
            : notification,
        ),
      );

      setUnreadCount((prev) => (prev > 0 ? prev - 1 : 0));

      setSuccess("Notification marked as read.");
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to mark notification as read.",
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) {
      return;
    }

    try {
      setActionLoading("all");
      setError("");
      setSuccess("");

      await api.put("/notification/read-all");

      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          isRead: true,
        })),
      );

      setUnreadCount(0);

      setSuccess("All notifications marked as read.");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to mark all notifications as read.",
      );
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>

          <p className="mt-4 text-gray-600">Loading notifications...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
        <div className="w-full max-w-md rounded-xl bg-white p-8 text-center shadow-sm">
          <Bell size={45} className="mx-auto text-gray-300" />

          <h1 className="mt-5 text-2xl font-bold text-gray-800">
            Please Login
          </h1>

          <p className="mt-2 text-gray-600">
            You need to login to view notifications.
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

  const dashboardPath =
    user.role === "admin"
      ? "/admin/dashboard"
      : user.role === "owner"
        ? "/owner/dashboard"
        : "/dashboard";

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <Link
            to={dashboardPath}
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
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {/* Heading */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
              <Bell size={25} className="text-blue-600" />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Notifications
              </h1>

              <p className="mt-1 text-gray-600">
                Stay updated with your RentEase activity.
              </p>
            </div>
          </div>

          {unreadCount > 0 && (
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-600">
                {unreadCount} unread
              </span>

              <button
                type="button"
                onClick={handleMarkAllAsRead}
                disabled={actionLoading === "all"}
                className="inline-flex items-center gap-2 rounded-lg border border-blue-300 px-4 py-2.5 text-sm font-semibold text-blue-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <CheckCheck size={17} />

                {actionLoading === "all" ? "Updating..." : "Mark All Read"}
              </button>
            </div>
          )}
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
        {notifications.length === 0 ? (
          <div className="mt-7 rounded-xl bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-50">
              <Bell size={30} className="text-gray-300" />
            </div>

            <h2 className="mt-5 text-xl font-semibold text-gray-800">
              No Notifications
            </h2>

            <p className="mt-2 text-gray-500">
              You're all caught up. New notifications will appear here.
            </p>
          </div>
        ) : (
          <div className="mt-7 space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`rounded-xl border bg-white p-5 shadow-sm transition ${
                  notification.isRead
                    ? "border-gray-100"
                    : "border-blue-200 bg-blue-50/30"
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                      notification.isRead ? "bg-gray-100" : "bg-blue-100"
                    }`}
                  >
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col justify-between gap-2 sm:flex-row">
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="font-semibold text-gray-800">
                            {notification.type
                              ?.replaceAll("_", " ")
                              ?.replace(/^./, (char) => char.toUpperCase()) ||
                              "Notification"}
                          </h2>

                          {!notification.isRead && (
                            <span className="h-2 w-2 rounded-full bg-blue-600"></span>
                          )}
                        </div>

                        <p className="mt-2 leading-6 text-gray-600">
                          {notification.message ||
                            "You have a new notification."}
                        </p>
                      </div>

                      {!notification.isRead && (
                        <span className="h-fit w-fit rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-600">
                          New
                        </span>
                      )}
                    </div>

                    {/* Property */}
                    {notification.property && (
                      <div className="mt-4 rounded-lg bg-gray-50 p-3">
                        <div className="flex items-start gap-2">
                          <Building2
                            size={17}
                            className="mt-0.5 text-gray-400"
                          />

                          <div>
                            <p className="text-xs text-gray-400">Property</p>

                            <p className="text-sm font-medium text-gray-700">
                              {notification.property.title || "Property"}
                            </p>

                            {notification.property.city && (
                              <p className="mt-1 text-xs text-gray-500">
                                {notification.property.city}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Date */}
                    <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
                      <Clock size={14} />

                      <span>
                        {notification.createdAt
                          ? new Date(notification.createdAt).toLocaleString()
                          : "Recently"}
                      </span>
                    </div>

                    {/* Action */}
                    {!notification.isRead && (
                      <button
                        type="button"
                        onClick={() => handleMarkAsRead(notification._id)}
                        disabled={actionLoading === notification._id}
                        className="mt-4 inline-flex items-center gap-2 rounded-lg border border-blue-300 px-3 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Check size={16} />

                        {actionLoading === notification._id
                          ? "Updating..."
                          : "Mark as Read"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Notifications;

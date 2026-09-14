import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  MapPin,
  BedDouble,
  Bath,
  Heart,
  CalendarDays,
  FileText,
  Star,
  Pencil,
  Trash2,
  Send,
  X,
} from "lucide-react";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function PropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [property, setProperty] = useState(null);

  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const [editingReviewId, setEditingReviewId] = useState(null);

  const [reviewLoading, setReviewLoading] = useState(false);

  const [reviewActionLoading, setReviewActionLoading] = useState(null);

  const [loading, setLoading] = useState(true);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [favorite, setFavorite] = useState(false);

  // Get Property
  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/property/${id}`);

        setProperty(response.data.property);
      } catch (error) {
        setError(error.response?.data?.message || "Failed to load property.");
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  // Get Reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setReviewsLoading(true);

        const response = await api.get(`/review/property/${id}`);

        setReviews(response.data.reviews || []);

        setAverageRating(response.data.averageRating || 0);
      } catch (error) {
        console.log("Get reviews error:", error.message);
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchReviews();
  }, [id]);

  // Check Favorite
  useEffect(() => {
    const checkFavorite = async () => {
      if (!user || user.role !== "tenant") {
        setFavorite(false);
        return;
      }

      try {
        const response = await api.get("/favorite");

        const favorites = response.data.favorites || [];

        const alreadyFavorite = favorites.some(
          (item) => item.property?._id === id,
        );

        setFavorite(alreadyFavorite);
      } catch (error) {
        console.log("Check favorite error:", error.message);
      }
    };

    checkFavorite();
  }, [user, id]);

  // Favorite
  const handleFavorite = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role !== "tenant") {
      setError("Only tenants can add properties to favorites.");
      return;
    }

    try {
      setFavoriteLoading(true);
      setError("");
      setSuccess("");

      if (favorite) {
        await api.delete(`/favorite/${id}`);

        setFavorite(false);
        setSuccess("Property removed from favorites.");
      } else {
        await api.post(`/favorite/${id}`);

        setFavorite(true);
        setSuccess("Property added to favorites.");
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update favorite.");
    } finally {
      setFavoriteLoading(false);
    }
  };

  // Apply
  const handleApply = () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role !== "tenant") {
      setError("Only tenants can apply for properties.");
      return;
    }

    if (!property?.isAvailable) {
      setError("This property is currently unavailable.");
      return;
    }

    navigate(`/applications/create?propertyId=${id}`);
  };

  // Booking
  const handleBooking = () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role !== "tenant") {
      setError("Only tenants can book property visits.");
      return;
    }

    if (!property?.isAvailable) {
      setError("This property is currently unavailable.");
      return;
    }

    navigate(`/bookings/create?propertyId=${id}`);
  };

  // Reset Review Form
  const resetReviewForm = () => {
    setRating(5);
    setComment("");
    setEditingReviewId(null);
  };

  // Submit Review
  const handleSubmitReview = async (event) => {
    event.preventDefault();

    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role !== "tenant") {
      setError("Only tenants can write reviews.");
      return;
    }

    if (!comment.trim()) {
      setError("Please write a comment before submitting.");
      return;
    }

    if (rating < 1 || rating > 5) {
      setError("Rating must be between 1 and 5.");
      return;
    }

    try {
      setReviewLoading(true);
      setError("");
      setSuccess("");

      if (editingReviewId) {
        const response = await api.put(`/review/${editingReviewId}`, {
          rating,
          comment: comment.trim(),
        });

        const updatedReview = response.data.review;

        setReviews((prev) =>
          prev.map((review) =>
            review._id === editingReviewId ? updatedReview : review,
          ),
        );

        setSuccess("Review updated successfully.");
      } else {
        const response = await api.post(`/review/${id}`, {
          rating,
          comment: comment.trim(),
        });

        const newReview = response.data.review;

        setReviews((prev) => [newReview, ...prev]);

        setSuccess("Review added successfully.");
      }

      resetReviewForm();

      // Recalculate average
      const updatedReviews = editingReviewId
        ? reviews.map((review) =>
            review._id === editingReviewId
              ? {
                  ...review,
                  rating,
                }
              : review,
          )
        : [
            ...reviews,
            {
              rating,
            },
          ];

      if (updatedReviews.length > 0) {
        const total = updatedReviews.reduce(
          (sum, review) => sum + Number(review.rating),
          0,
        );

        setAverageRating(Number((total / updatedReviews.length).toFixed(1)));
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to save review.");
    } finally {
      setReviewLoading(false);
    }
  };

  // Edit Review
  const handleEditReview = (review) => {
    setEditingReviewId(review._id);
    setRating(review.rating);
    setComment(review.comment || "");
    setError("");
    setSuccess("");

    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth",
    });
  };

  // Delete Review
  const handleDeleteReview = async (reviewId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this review?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setReviewActionLoading(reviewId);
      setError("");
      setSuccess("");

      await api.delete(`/review/${reviewId}`);

      const updatedReviews = reviews.filter(
        (review) => review._id !== reviewId,
      );

      setReviews(updatedReviews);

      if (updatedReviews.length > 0) {
        const total = updatedReviews.reduce(
          (sum, review) => sum + Number(review.rating),
          0,
        );

        setAverageRating(Number((total / updatedReviews.length).toFixed(1)));
      } else {
        setAverageRating(0);
      }

      if (editingReviewId === reviewId) {
        resetReviewForm();
      }

      setSuccess("Review deleted successfully.");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to delete review.");
    } finally {
      setReviewActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-gray-600">Loading property...</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
        <div className="text-center">
          <Building2 size={48} className="mx-auto text-gray-400" />

          <h1 className="mt-4 text-2xl font-bold text-gray-800">
            Property Not Found
          </h1>

          <p className="mt-2 text-gray-600">
            {error || "The property you are looking for does not exist."}
          </p>

          <Link
            to="/properties"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            <ArrowLeft size={17} />
            Back to Properties
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link
            to="/properties"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:border-blue-500 hover:text-blue-600"
          >
            <ArrowLeft size={17} />
            Back
          </Link>

          <Link to="/" className="text-2xl font-bold text-blue-600">
            RentEase
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* Error */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-600">
            {success}
          </div>
        )}

        {/* Property Images */}
        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
          {property.images?.length > 0 ? (
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="sm:row-span-2">
                <img
                  src={property.images[0]}
                  alt={property.title}
                  className="h-80 w-full object-cover sm:h-full"
                />
              </div>

              {property.images.slice(1, 5).map((image, index) => (
                <img
                  key={`${image}-${index}`}
                  src={image}
                  alt={`${property.title} ${index + 2}`}
                  className="hidden h-40 w-full object-cover sm:block"
                />
              ))}
            </div>
          ) : (
            <div className="flex h-80 items-center justify-center bg-gray-200">
              <div className="text-center">
                <Building2 size={50} className="mx-auto text-gray-400" />

                <p className="mt-3 text-gray-500">No images available</p>
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="mt-7 grid gap-7 lg:grid-cols-3">
          {/* Left */}
          <div className="lg:col-span-2">
            <div className="rounded-xl bg-white p-6 shadow-sm">
              {/* Title */}
              <div className="flex flex-col justify-between gap-4 sm:flex-row">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        property.isAvailable
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {property.isAvailable ? "Available" : "Unavailable"}
                    </span>

                    {property.propertyType && (
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold capitalize text-blue-600">
                        {property.propertyType}
                      </span>
                    )}
                  </div>

                  <h1 className="mt-3 text-3xl font-bold text-gray-800">
                    {property.title}
                  </h1>

                  <div className="mt-2 flex items-center gap-2 text-gray-500">
                    <MapPin size={18} />

                    <span>
                      {property.address || "Address unavailable"}

                      {property.city && `, ${property.city}`}
                    </span>
                  </div>
                </div>

                {/* Favorite */}
                <button
                  type="button"
                  onClick={handleFavorite}
                  disabled={favoriteLoading}
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition ${
                    favorite
                      ? "border-red-200 bg-red-50 text-red-500"
                      : "border-gray-300 bg-white text-gray-500 hover:border-red-300 hover:text-red-500"
                  } disabled:cursor-not-allowed disabled:opacity-60`}
                  title={
                    favorite ? "Remove from favorites" : "Add to favorites"
                  }
                >
                  <Heart size={21} fill={favorite ? "currentColor" : "none"} />
                </button>
              </div>

              {/* Rent */}
              <div className="mt-7 border-y border-gray-100 py-5">
                <p className="text-sm text-gray-500">Monthly Rent</p>

                <p className="mt-1 text-3xl font-bold text-blue-600">
                  ৳{property.rent}
                  <span className="ml-2 text-base font-normal text-gray-500">
                    / month
                  </span>
                </p>
              </div>

              {/* Details */}
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg bg-gray-50 p-4">
                  <BedDouble size={23} className="text-blue-600" />

                  <p className="mt-3 text-sm text-gray-500">Bedrooms</p>

                  <p className="mt-1 font-semibold text-gray-800">
                    {property.bedrooms || 0}
                  </p>
                </div>

                <div className="rounded-lg bg-gray-50 p-4">
                  <Bath size={23} className="text-blue-600" />

                  <p className="mt-3 text-sm text-gray-500">Bathrooms</p>

                  <p className="mt-1 font-semibold text-gray-800">
                    {property.bathrooms || 0}
                  </p>
                </div>

                <div className="rounded-lg bg-gray-50 p-4">
                  <Building2 size={23} className="text-blue-600" />

                  <p className="mt-3 text-sm text-gray-500">Property Type</p>

                  <p className="mt-1 font-semibold capitalize text-gray-800">
                    {property.propertyType || "N/A"}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="mt-8">
                <h2 className="text-xl font-semibold text-gray-800">
                  Description
                </h2>

                <p className="mt-3 leading-7 text-gray-600">
                  {property.description || "No description available."}
                </p>
              </div>

              {/* Owner */}
              <div className="mt-8">
                <h2 className="text-xl font-semibold text-gray-800">
                  Property Owner
                </h2>

                <div className="mt-4 rounded-lg bg-gray-50 p-5">
                  <p className="font-semibold text-gray-800">
                    {property.owner?.name || "Owner information unavailable"}
                  </p>

                  {property.owner?.email && (
                    <p className="mt-2 text-sm text-gray-500">
                      Email: {property.owner.email}
                    </p>
                  )}

                  {property.owner?.phone && (
                    <p className="mt-1 text-sm text-gray-500">
                      Phone: {property.owner.phone}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Reviews */}
            <div className="mt-7 rounded-xl bg-white p-6 shadow-sm">
              {/* Review Heading */}
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    Reviews & Ratings
                  </h2>

                  <div className="mt-2 flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Star
                        size={21}
                        fill="currentColor"
                        className="text-yellow-500"
                      />

                      <span className="text-xl font-bold text-gray-800">
                        {averageRating || 0}
                      </span>
                    </div>

                    <span className="text-sm text-gray-500">
                      ({reviews.length}{" "}
                      {reviews.length === 1 ? "review" : "reviews"})
                    </span>
                  </div>
                </div>
              </div>

              {/* Review Form */}
              {user?.role === "tenant" && (
                <form
                  onSubmit={handleSubmitReview}
                  className="mt-6 rounded-xl border border-gray-100 bg-gray-50 p-5"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-800">
                      {editingReviewId ? "Edit Your Review" : "Write a Review"}
                    </h3>

                    {editingReviewId && (
                      <button
                        type="button"
                        onClick={resetReviewForm}
                        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
                      >
                        <X size={16} />
                        Cancel
                      </button>
                    )}
                  </div>

                  {/* Rating */}
                  <div className="mt-5">
                    <p className="mb-2 text-sm font-medium text-gray-700">
                      Your Rating
                    </p>

                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="rounded p-1 transition hover:bg-yellow-50"
                          title={`${star} star`}
                        >
                          <Star
                            size={26}
                            fill={star <= rating ? "currentColor" : "none"}
                            className={
                              star <= rating
                                ? "text-yellow-500"
                                : "text-gray-300"
                            }
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Comment */}
                  <div className="mt-5">
                    <label
                      htmlFor="review-comment"
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      Your Comment
                    </label>

                    <textarea
                      id="review-comment"
                      value={comment}
                      onChange={(event) => setComment(event.target.value)}
                      rows={4}
                      placeholder="Share your experience with this property..."
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={reviewLoading}
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Send size={17} />

                    {reviewLoading
                      ? "Saving..."
                      : editingReviewId
                        ? "Update Review"
                        : "Submit Review"}
                  </button>
                </form>
              )}

              {/* Login message */}
              {!user && (
                <div className="mt-6 rounded-lg bg-blue-50 p-4 text-sm text-blue-700">
                  <Link to="/login" className="font-semibold underline">
                    Login
                  </Link>{" "}
                  as a tenant to write a review.
                </div>
              )}

              {/* Reviews List */}
              <div className="mt-7">
                {reviewsLoading ? (
                  <p className="py-6 text-center text-gray-500">
                    Loading reviews...
                  </p>
                ) : reviews.length === 0 ? (
                  <div className="rounded-lg bg-gray-50 p-8 text-center">
                    <Star size={38} className="mx-auto text-gray-300" />

                    <p className="mt-3 font-medium text-gray-700">
                      No reviews yet
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      Be the first to review this property.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => {
                      const isOwnReview =
                        user?.role === "tenant" &&
                        review.tenant?._id === user._id;

                      return (
                        <div
                          key={review._id}
                          className="rounded-xl border border-gray-100 p-5"
                        >
                          <div className="flex flex-col justify-between gap-4 sm:flex-row">
                            <div className="flex items-start gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50">
                                <span className="font-bold text-blue-600">
                                  {review.tenant?.name
                                    ?.charAt(0)
                                    ?.toUpperCase() || "T"}
                                </span>
                              </div>

                              <div>
                                <p className="font-semibold text-gray-800">
                                  {review.tenant?.name || "Tenant"}
                                </p>

                                <div className="mt-1 flex items-center gap-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      size={15}
                                      fill={
                                        star <= review.rating
                                          ? "currentColor"
                                          : "none"
                                      }
                                      className={
                                        star <= review.rating
                                          ? "text-yellow-500"
                                          : "text-gray-300"
                                      }
                                    />
                                  ))}

                                  <span className="ml-1 text-xs text-gray-500">
                                    {review.rating}/5
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Own review actions */}
                            {isOwnReview && (
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleEditReview(review)}
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 px-3 py-2 text-xs font-medium text-blue-600 transition hover:bg-blue-50"
                                >
                                  <Pencil size={14} />
                                  Edit
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteReview(review._id)}
                                  disabled={reviewActionLoading === review._id}
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                                >
                                  <Trash2 size={14} />

                                  {reviewActionLoading === review._id
                                    ? "Deleting..."
                                    : "Delete"}
                                </button>
                              </div>
                            )}
                          </div>

                          <p className="mt-4 leading-6 text-gray-600">
                            {review.comment}
                          </p>

                          {review.createdAt && (
                            <p className="mt-3 text-xs text-gray-400">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div>
            <div className="sticky top-6 rounded-xl bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-800">
                Interested in this property?
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Apply for this property or schedule a visit with the owner.
              </p>

              {/* Apply */}
              <button
                type="button"
                onClick={handleApply}
                disabled={!property.isAvailable}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                <FileText size={18} />
                Apply Now
              </button>

              {/* Booking */}
              <button
                type="button"
                onClick={handleBooking}
                disabled={!property.isAvailable}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-blue-600 px-4 py-3 font-semibold text-blue-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:border-gray-300 disabled:text-gray-400"
              >
                <CalendarDays size={18} />
                Book a Visit
              </button>

              {/* Availability */}
              <div className="mt-5 rounded-lg bg-gray-50 p-4 text-sm text-gray-500">
                {property.isAvailable
                  ? "This property is currently available for rent."
                  : "This property is currently unavailable."}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default PropertyDetails;

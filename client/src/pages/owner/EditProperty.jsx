import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Building2, Upload, X, Trash2 } from "lucide-react";

import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

function EditProperty() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    propertyType: "",
    address: "",
    city: "",
    rent: "",
    bedrooms: "",
    bathrooms: "",
  });

  const [property, setProperty] = useState(null);

  const [newImages, setNewImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load property
  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/property/${id}`);

        const data = response.data.property;

        if (!data) {
          setError("Property not found.");
          return;
        }

        setProperty(data);

        setFormData({
          title: data.title || "",
          description: data.description || "",
          propertyType: data.propertyType || "",
          address: data.address || "",
          city: data.city || "",
          rent: data.rent || "",
          bedrooms: data.bedrooms || "",
          bathrooms: data.bathrooms || "",
        });
      } catch (error) {
        setError(error.response?.data?.message || "Failed to load property.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProperty();
    }
  }, [id]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Select new images
  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files);

    if (selectedFiles.length === 0) {
      return;
    }

    const currentImageCount = property?.images?.length || 0;

    if (currentImageCount + newImages.length + selectedFiles.length > 5) {
      setError("A property can have a maximum of 5 images.");
      return;
    }

    const validFiles = selectedFiles.filter((file) =>
      file.type.startsWith("image/"),
    );

    if (validFiles.length !== selectedFiles.length) {
      setError("Only image files are allowed.");
      return;
    }

    setError("");

    setNewImages((prev) => [...prev, ...validFiles]);

    const previews = validFiles.map((file) => URL.createObjectURL(file));

    setPreviewImages((prev) => [...prev, ...previews]);

    e.target.value = "";
  };

  // Remove selected new image
  const removeNewImage = (index) => {
    if (previewImages[index]) {
      URL.revokeObjectURL(previewImages[index]);
    }

    setNewImages((prev) => prev.filter((_, i) => i !== index));

    setPreviewImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Delete existing image
  const deleteExistingImage = async (imageUrl) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this image?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleteLoading(imageUrl);
      setError("");
      setSuccess("");

      const response = await api.delete(`/property/${id}/image`, {
        data: {
          imageUrl,
        },
      });

      setProperty(response.data.property);

      setSuccess(response.data.message || "Image deleted successfully.");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to delete image.");
    } finally {
      setDeleteLoading(null);
    }
  };

  // Update property
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (
      !formData.title ||
      !formData.description ||
      !formData.propertyType ||
      !formData.address ||
      !formData.city ||
      !formData.rent
    ) {
      setError("Please fill all required fields.");
      return;
    }

    if (Number(formData.rent) <= 0) {
      setError("Rent must be greater than 0.");
      return;
    }

    try {
      setSaving(true);

      const data = new FormData();

      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("propertyType", formData.propertyType);
      data.append("address", formData.address);
      data.append("city", formData.city);
      data.append("rent", formData.rent);

      data.append("bedrooms", formData.bedrooms || 0);

      data.append("bathrooms", formData.bathrooms || 0);

      newImages.forEach((image) => {
        data.append("images", image);
      });

      const response = await api.put(`/property/${id}`, data);

      setProperty(response.data.property);

      setNewImages([]);

      previewImages.forEach((url) => {
        URL.revokeObjectURL(url);
      });

      setPreviewImages([]);

      setSuccess(response.data.message || "Property updated successfully.");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update property.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-gray-600">Loading property...</p>
      </div>
    );
  }

  if (!user || user.role !== "owner") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
        <div className="text-center">
          <Building2 size={45} className="mx-auto text-gray-400" />

          <h1 className="mt-4 text-2xl font-bold text-gray-800">
            Access Denied
          </h1>

          <p className="mt-2 text-gray-600">
            Only property owners can edit properties.
          </p>

          <Link
            to="/login"
            className="mt-5 inline-flex rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
        <div className="text-center">
          <Building2 size={45} className="mx-auto text-gray-400" />

          <h1 className="mt-4 text-2xl font-bold text-gray-800">
            Property Not Found
          </h1>

          <p className="mt-2 text-gray-600">{error}</p>

          <Link
            to="/owner/dashboard"
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            <ArrowLeft size={17} />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6">
          <Link
            to="/owner/dashboard"
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

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="rounded-xl bg-white p-6 shadow-sm sm:p-8">
          {/* Heading */}
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50">
              <Building2 size={24} className="text-blue-600" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Edit Property
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Update your property information.
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

          <form onSubmit={handleSubmit} className="mt-7 space-y-6">
            {/* Title */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Property Title *
              </label>

              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Description *
              </label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="5"
                className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            {/* Property Type */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Property Type *
              </label>

              <select
                name="propertyType"
                value={formData.propertyType}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
              >
                <option value="apartment">Apartment</option>

                <option value="house">House</option>

                <option value="room">Room</option>

                <option value="studio">Studio</option>

                <option value="office">Office</option>

                <option value="other">Other</option>
              </select>
            </div>

            {/* Address */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Address *
              </label>

              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            {/* City */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                City *
              </label>

              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            {/* Rent */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Monthly Rent *
              </label>

              <input
                type="number"
                name="rent"
                value={formData.rent}
                onChange={handleChange}
                min="1"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            {/* Bedrooms / Bathrooms */}
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Bedrooms
                </label>

                <input
                  type="number"
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleChange}
                  min="0"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Bathrooms
                </label>

                <input
                  type="number"
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleChange}
                  min="0"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Existing Images */}
            <div>
              <label className="mb-3 block text-sm font-medium text-gray-700">
                Current Images
              </label>

              {property.images?.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {property.images.map((image, index) => (
                    <div
                      key={`${image}-${index}`}
                      className="relative overflow-hidden rounded-lg border"
                    >
                      <img
                        src={image}
                        alt={`Property ${index + 1}`}
                        className="h-36 w-full object-cover"
                      />

                      <button
                        type="button"
                        onClick={() => deleteExistingImage(image)}
                        disabled={deleteLoading === image}
                        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-700 shadow transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                        title="Delete image"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg bg-gray-50 p-6 text-center text-sm text-gray-500">
                  No images uploaded.
                </div>
              )}
            </div>

            {/* Add New Images */}
            <div>
              <label className="mb-3 block text-sm font-medium text-gray-700">
                Add New Images
              </label>

              <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 px-5 py-8 transition hover:border-blue-400 hover:bg-blue-50">
                <Upload size={30} className="text-gray-400" />

                <p className="mt-3 text-sm font-medium text-gray-700">
                  Click to upload images
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  Maximum 5 images total
                </p>

                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>

              {/* New Image Preview */}
              {previewImages.length > 0 && (
                <div className="mt-5">
                  <p className="mb-3 text-sm font-medium text-gray-700">
                    New Images
                  </p>

                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    {previewImages.map((image, index) => (
                      <div
                        key={image}
                        className="relative overflow-hidden rounded-lg border"
                      >
                        <img
                          src={image}
                          alt={`New image ${index + 1}`}
                          className="h-36 w-full object-cover"
                        />

                        <button
                          type="button"
                          onClick={() => removeNewImage(index)}
                          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-700 shadow transition hover:bg-red-50 hover:text-red-600"
                          title="Remove image"
                        >
                          <X size={17} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to="/owner/dashboard"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 px-5 py-3 font-semibold text-gray-700 transition hover:border-blue-500 hover:text-blue-600"
              >
                <ArrowLeft size={18} />
                Cancel
              </Link>

              <button
                type="submit"
                disabled={saving}
                className="flex-1 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving Changes..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default EditProperty;

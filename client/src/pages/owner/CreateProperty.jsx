import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Building2, Upload, X } from "lucide-react";

import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

function CreateProperty() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    propertyType: "apartment",
    address: "",
    city: "",
    rent: "",
    bedrooms: "",
    bathrooms: "",
  });

  const [images, setImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files);

    if (selectedFiles.length === 0) {
      return;
    }

    if (images.length + selectedFiles.length > 5) {
      setError("You can upload a maximum of 5 images.");
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

    setImages((prev) => [...prev, ...validFiles]);

    const newPreviews = validFiles.map((file) => URL.createObjectURL(file));

    setPreviewImages((prev) => [...prev, ...newPreviews]);

    e.target.value = "";
  };

  const removeImage = (index) => {
    URL.revokeObjectURL(previewImages[index]);

    setImages((prev) => prev.filter((_, i) => i !== index));

    setPreviewImages((prev) => prev.filter((_, i) => i !== index));
  };

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
      setLoading(true);

      const data = new FormData();

      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("propertyType", formData.propertyType);
      data.append("address", formData.address);
      data.append("city", formData.city);
      data.append("rent", formData.rent);
      data.append("bedrooms", formData.bedrooms || 0);
      data.append("bathrooms", formData.bathrooms || 0);

      images.forEach((image) => {
        data.append("images", image);
      });

      const response = await api.post("/property/create", data);

      setSuccess(response.data.message || "Property created successfully.");

      setTimeout(() => {
        navigate("/owner/dashboard");
      }, 1200);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to create property.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
        <div className="text-center">
          <Building2 size={45} className="mx-auto text-gray-400" />

          <h1 className="mt-4 text-2xl font-bold text-gray-800">
            Login Required
          </h1>

          <p className="mt-2 text-gray-600">
            Please login to create a property.
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

  if (user.role !== "owner") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
        <div className="text-center">
          <Building2 size={45} className="mx-auto text-gray-400" />

          <h1 className="mt-4 text-2xl font-bold text-gray-800">
            Access Denied
          </h1>

          <p className="mt-2 text-gray-600">
            Only property owners can create properties.
          </p>

          <Link
            to="/"
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            <ArrowLeft size={17} />
            Back Home
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
                Add New Property
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Add your rental property details.
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
                placeholder="e.g. Beautiful 2 Bedroom Apartment"
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
                placeholder="Describe your property..."
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
                placeholder="e.g. House 12, Road 5, Dhanmondi"
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
                placeholder="e.g. Dhaka"
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
                placeholder="e.g. 25000"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            {/* Bedrooms + Bathrooms */}
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
                  placeholder="e.g. 2"
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
                  placeholder="e.g. 2"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Images */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Property Images
              </label>

              <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 px-5 py-8 transition hover:border-blue-400 hover:bg-blue-50">
                <Upload size={30} className="text-gray-400" />

                <p className="mt-3 text-sm font-medium text-gray-700">
                  Click to upload images
                </p>

                <p className="mt-1 text-xs text-gray-400">Maximum 5 images</p>

                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>

              {/* Preview */}
              {previewImages.length > 0 && (
                <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {previewImages.map((image, index) => (
                    <div
                      key={image}
                      className="relative overflow-hidden rounded-lg border"
                    >
                      <img
                        src={image}
                        alt={`Preview ${index + 1}`}
                        className="h-36 w-full object-cover"
                      />

                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-700 shadow transition hover:bg-red-50 hover:text-red-600"
                        title="Remove image"
                      >
                        <X size={17} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 px-5 py-3.5 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating Property..." : "Create Property"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default CreateProperty;

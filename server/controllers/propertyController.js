import Property from "../models/propertyModel.js";

import cloudinary from "../config/cloudinary.js";
// Create Property
export const createProperty = async (req, res) => {
  try {
    const {
      title,
      description,
      propertyType,
      address,
      city,
      rent,
      bedrooms,
      bathrooms,
    } = req.body;

    // Validation
    if (!title || !description || !propertyType || !address || !city || !rent) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }

    const imageUrls = [];

    // Upload images to Cloudinary
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: "rentease/properties",
            },
            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve(result);
              }
            },
          );

          uploadStream.end(file.buffer);
        });

        imageUrls.push(result.secure_url);
      }
    }

    // Create property
    const property = await Property.create({
      title,
      description,
      propertyType,
      address,
      city,
      rent,
      bedrooms,
      bathrooms,
      images: imageUrls,
      owner: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Property created successfully",
      property,
    });
  } catch (error) {
    console.log("Create property error:", error.message);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
// Get All Properties
export const getAllProperties = async (req, res) => {
  try {
    const {
      city,
      propertyType,
      minRent,
      maxRent,
      bedrooms,
      bathrooms,
      page = 1,
      limit = 10,
    } = req.query;

    // Filter object
    const filter = {};

    // শুধু available property দেখাবে
    filter.isAvailable = true;

    // City filter
    if (city) {
      filter.city = city;
    }

    // Property type filter
    if (propertyType) {
      filter.propertyType = propertyType;
    }

    // Rent filter
    if (minRent || maxRent) {
      filter.rent = {};

      if (minRent) {
        filter.rent.$gte = Number(minRent);
      }

      if (maxRent) {
        filter.rent.$lte = Number(maxRent);
      }
    }

    // Bedrooms filter
    if (bedrooms) {
      filter.bedrooms = Number(bedrooms);
    }

    // Bathrooms filter
    if (bathrooms) {
      filter.bathrooms = Number(bathrooms);
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Total properties
    const totalProperties = await Property.countDocuments(filter);

    // Get properties
    const properties = await Property.find(filter)
      .populate("owner", "name email phone")
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: properties.length,

      pagination: {
        totalProperties,
        currentPage: Number(page),
        totalPages: Math.ceil(totalProperties / Number(limit)),
        limit: Number(limit),
      },

      properties,
    });
  } catch (error) {
    console.log("Get properties error:", error.message);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
// Get Single Property
export const getSingleProperty = async (req, res) => {
  try {
    const { id } = req.params;

    const property = await Property.findById(id).populate(
      "owner",
      "name email phone",
    );

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    res.status(200).json({
      success: true,
      property,
    });
  } catch (error) {
    console.log("Get single property error:", error.message);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
// Update Property
export const updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    // শুধু নিজের property update করতে পারবে
    if (property.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this property",
      });
    }

    const {
      title,
      description,
      propertyType,
      address,
      city,
      rent,
      bedrooms,
      bathrooms,
    } = req.body;

    // যেসব field পাঠানো হবে শুধু সেগুলো update হবে
    if (title) property.title = title;
    if (description) property.description = description;
    if (propertyType) property.propertyType = propertyType;
    if (address) property.address = address;
    if (city) property.city = city;
    if (rent) property.rent = rent;
    if (bedrooms) property.bedrooms = bedrooms;
    if (bathrooms) property.bathrooms = bathrooms;

    // নতুন image upload
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: "rentease/properties",
            },
            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve(result);
              }
            },
          );

          uploadStream.end(file.buffer);
        });

        property.images.push(result.secure_url);
      }
    }

    await property.save();

    res.status(200).json({
      success: true,
      message: "Property updated successfully",
      property,
    });
  } catch (error) {
    console.log("Update property error:", error.message);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
// Delete Property
export const deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;

    // Find property
    const property = await Property.findById(id);

    // Check property exists
    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    // Check property owner
    if (property.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own property",
      });
    }

    // Delete property
    await Property.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Property deleted successfully",
    });
  } catch (error) {
    console.log("Delete property error:", error.message);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
// Get My Properties
export const getMyProperties = async (req, res) => {
  try {
    const properties = await Property.find({
      owner: req.user._id,
    });

    res.status(200).json({
      success: true,
      count: properties.length,
      properties,
    });
  } catch (error) {
    console.log("Get my properties error:", error.message);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
// Delete Property Image - Owner

export const deletePropertyImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { imageUrl } = req.body;

    // Validate image URL
    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: "Image URL is required",
      });
    }

    // Find property
    const property = await Property.findById(id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    // Check property owner
    if (property.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only delete images from your own property",
      });
    }

    // Check image exists in property
    if (!property.images.includes(imageUrl)) {
      return res.status(404).json({
        success: false,
        message: "Image not found in this property",
      });
    }

    // Extract Cloudinary public ID
    const uploadMarker = "/upload/";
    const uploadIndex = imageUrl.indexOf(uploadMarker);

    if (uploadIndex === -1) {
      return res.status(400).json({
        success: false,
        message: "Invalid Cloudinary image URL",
      });
    }

    let publicId = imageUrl.substring(uploadIndex + uploadMarker.length);

    // Remove version from URL
    publicId = publicId.replace(/^v\d+\//, "");

    // Remove file extension
    publicId = publicId.replace(/\.[^/.]+$/, "");

    // Delete image from Cloudinary
    await cloudinary.uploader.destroy(publicId);

    // Remove image URL from database
    property.images = property.images.filter((image) => image !== imageUrl);

    await property.save();

    res.status(200).json({
      success: true,
      message: "Property image deleted successfully",
      property,
    });
  } catch (error) {
    console.log("Delete property image error:", error.message);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
// Get All Properties - Admin

export const getAllPropertiesAdmin = async (req, res) => {
  try {
    const properties = await Property.find()
      .populate("owner", "name email phone")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: properties.length,
      properties,
    });
  } catch (error) {
    console.log("Get all admin properties error:", error.message);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
